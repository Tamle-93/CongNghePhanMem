"""
============================================
Backend/src/domain/services/assignment_service.py
============================================
Assignment Service - Phân công phản biện

MỤC ĐÍCH:
- Phân công reviewer cho bài báo
- Check conflict of interest (COI)
- Quản lý assignment lifecycle
- Support cả manual assignment và auto assignment

CHỨC NĂNG CHÍNH:
1. create_assignment(): Phân công reviewer cho bài
   - Check COI
   - Validate reviewer expertise
   - Create Assignment record
   
2. auto_assign(): Tự động phân công nhiều reviewer
   - Load balancing (distribute fairly)
   - Expertise matching
   - COI checking
   
3. reassign(): Phân công lại nếu reviewer từ chối
4. remove_assignment(): Xóa phân công

WORKFLOW PHÂN CÔNG:
1. Chair upload papers
2. Chair select reviewers manually OR use auto-assign
3. System check COI + workload
4. Send assignments to reviewers
5. Reviewers see assignments in their dashboard
6. Reviewers submit reviews by deadline
7. Chair view reviews + make decision

CONSTRAINTS:
- Min 3 reviewers per paper (typically)
- Avoid COI
- Balance workload
- Check deadline before assigning
"""

from infrastructure.databases.base import SessionLocal
from infrastructure.models import (
    Assignment, Paper, User, Conference, ConflictOfInterest, 
    Review, AuditLogAI
)
from domain.services.email_service import EmailService
from datetime import datetime
import json

class AssignmentService:
    """
    Assignment Management Service
    =============================
    Quản lý phân công phản biện
    """
    
    @staticmethod
    def create_assignment(conference_id, paper_id, reviewer_id, chair_user_id):
        """
        Manually assign a reviewer to a paper
        """
        db = SessionLocal()
        
        try:
            # Verify chair permission
            conference = db.query(Conference).filter(
                Conference.id == conference_id
            ).first()
            
            if not conference:
                return None, "Conference not found"
            
            chair = db.query(User).filter(User.id == chair_user_id).first()
            if not chair:
                return None, "User not found"
                
            chair_role_names = [r.name if hasattr(r, 'name') else r for r in (chair.roles if chair else [])]
            
            # ✅ DEBUG: Log role check details
            print(f"[DEBUG] Chair user_id={chair_user_id}, username={chair.username if chair else 'N/A'}")
            print(f"[DEBUG] Chair roles={chair.roles}, role_names={chair_role_names}")
            print(f"[DEBUG] Conference chair_id={conference.chair_id}")
            
            # ✅ FIX: Allow if user has Chair or Admin role
            # (Don't require exact conference.chair_id match as it may not be set)
            is_admin = 'Admin' in chair_role_names
            is_chair = 'Chair' in chair_role_names
            is_chair_of_conference = conference.chair_id == chair_user_id
            
            print(f"[DEBUG] is_admin={is_admin}, is_chair={is_chair}, is_chair_of_conference={is_chair_of_conference}")
            
            if not (is_admin or is_chair or is_chair_of_conference):
                return None, f"Permission denied: Need Admin or Chair role"
            
            # Verify paper belongs to conference
            paper = db.query(Paper).filter(
                Paper.id == paper_id,
                Paper.conference_id == conference_id
            ).first()
            
            if not paper:
                return None, "Paper not found in this conference"
            
            # Verify reviewer
            # ✅ FIXED: Check user.roles for multi-role support
            reviewer = db.query(User).filter(User.id == reviewer_id).first()
            if reviewer:
                reviewer_role_names = [r.name if hasattr(r, 'name') else r for r in (reviewer.roles if reviewer else [])]
                print(f"[DEBUG] Reviewer user_id={reviewer_id}, username={reviewer.username if reviewer else 'N/A'}")
                print(f"[DEBUG] Reviewer roles={reviewer.roles}, role_names={reviewer_role_names}")
                if 'Reviewer' not in reviewer_role_names and 'Chair' not in reviewer_role_names:
                    print(f"[DEBUG] Reviewer role check FAILED - setting reviewer=None")
                    reviewer = None
            
            if not reviewer:
                return None, "Reviewer not found or invalid role"
            
            # ✅ CHECK 1: Reviewer cannot be the paper submitter (author)
            if paper.submitter_id == reviewer_id:
                return None, "Cannot assign paper submitter as reviewer (conflict of interest)"
            
            # ✅ CHECK 2: Reviewer cannot be a co-author of the paper
            from infrastructure.models import PaperAuthor
            is_coauthor = db.query(PaperAuthor).filter(
                PaperAuthor.paper_id == paper_id,
                PaperAuthor.user_id == reviewer_id
            ).first()
            
            if is_coauthor:
                return None, "Cannot assign co-author as reviewer (conflict of interest)"
            
            # ✅ CHECK 3: Check for declared conflict of interest
            conflict = db.query(ConflictOfInterest).filter(
                ConflictOfInterest.paper_id == paper_id,
                ConflictOfInterest.reviewer_id == reviewer_id
            ).first()
            
            if conflict:
                return None, f"Conflict of interest declared: {conflict.reason}"
            
            # Check if already assigned
            existing = db.query(Assignment).filter(
                Assignment.paper_id == paper_id,
                Assignment.reviewer_id == reviewer_id,
                Assignment.is_deleted == False
            ).first()
            
            if existing:
                return None, "Reviewer already assigned to this paper"
            
            # Create assignment
            assignment = Assignment(
                conference_id=conference_id,
                paper_id=paper_id,
                reviewer_id=reviewer_id,
                is_auto_assigned=False,
                status='Assigned'
            )
            
            db.add(assignment)
            
            # ✅ Update paper status to UNDER_REVIEW after first assignment
            # Database uses UPPERCASE enum values
            if paper.status and paper.status.upper() in ['SUBMITTED', 'PENDING', 'DRAFT']:
                paper.status = 'UNDER_REVIEW'
            
            db.commit()
            db.refresh(assignment)
            
            # ✅ Send email to reviewer
            try:
                EmailService.send_email(
                    to=reviewer.email,
                    subject=f'Phân công phản biện - {conference.name}',
                    body=f"""
                    Xin chào {reviewer.full_name or reviewer.username},
                    
                    Bạn đã được phân công phản biện bài báo:
                    
                    Tiêu đề: {paper.title}
                    Hội nghị: {conference.name}
                    Hạn chót: {paper.deadline.strftime('%d/%m/%Y') if paper.deadline else 'N/A'}
                    
                    Vui lòng đăng nhập vào hệ thống để xem chi tiết và bắt đầu phản biện.
                    
                    Trân trọng,
                    Ban tổ chức hội nghị
                    """,
                    html=f"""
                    <p>Xin chào <strong>{reviewer.full_name or reviewer.username}</strong>,</p>
                    <p>Bạn đã được phân công phản biện bài báo:</p>
                    <div style="background-color: #f9fafb; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                        <p><strong>Tiêu đề:</strong> {paper.title}</p>
                        <p><strong>Hội nghị:</strong> {conference.name}</p>
                        <p><strong>Hạn chót:</strong> <span style="color: #dc2626;">{paper.deadline.strftime('%d/%m/%Y') if paper.deadline else 'N/A'}</span></p>
                    </div>
                    <p>Vui lòng đăng nhập vào hệ thống để xem chi tiết và bắt đầu phản biện.</p>
                    """,
                    email_type='ASSIGNMENT',
                    entity_type='Paper',
                    entity_id=paper_id,
                    user_id=reviewer_id
                )
            except Exception as e:
                print(f"⚠️  Failed to send assignment email: {str(e)}")
            
            # Log assignment
            AuditLogAI.log(
                db_session=db,
                user_id=chair_user_id,
                action_type='assignment_created',
                table_name='assignments',
                record_id=assignment.id,
                data=json.dumps({
                    "paper_id": paper_id,
                    "reviewer_id": reviewer_id,
                    "conference_id": conference_id
                })
            )
            
            return AssignmentService._serialize_assignment(db, assignment), None
            
        except Exception as e:
            db.rollback()
            return None, str(e)
        finally:
            db.close()
    
    @staticmethod
    def get_assignments_for_paper(paper_id):
        """Get all assignments for a paper"""
        db = SessionLocal()
        
        try:
            assignments = db.query(Assignment).filter(
                Assignment.paper_id == paper_id,
                Assignment.is_deleted == False
            ).all()
            
            return [AssignmentService._serialize_assignment(db, a) for a in assignments], None
            
        finally:
            db.close()
    
    @staticmethod
    def get_assignments_for_reviewer(reviewer_id, conference_id=None):
        """Get all papers assigned to a reviewer"""
        db = SessionLocal()
        
        try:
            query = db.query(Assignment).filter(
                Assignment.reviewer_id == reviewer_id,
                Assignment.is_deleted == False
            )
            
            if conference_id:
                query = query.filter(Assignment.conference_id == conference_id)
            
            assignments = query.all()
            
            return [AssignmentService._serialize_assignment(db, a) for a in assignments], None
            
        finally:
            db.close()
    
    @staticmethod
    def get_assignments_for_conference(conference_id, page=1, per_page=20):
        """Get all assignments in a conference"""
        db = SessionLocal()
        
        try:
            total = db.query(Assignment).filter(
                Assignment.conference_id == conference_id,
                Assignment.is_deleted == False
            ).count()
            
            assignments = db.query(Assignment).filter(
                Assignment.conference_id == conference_id,
                Assignment.is_deleted == False
            ).order_by(Assignment.assigned_at.desc())\
             .limit(per_page)\
             .offset((page - 1) * per_page)\
             .all()
            
            return {
                'assignments': [AssignmentService._serialize_assignment(db, a) for a in assignments],
                'total': total,
                'page': page,
                'per_page': per_page
            }, None
            
        finally:
            db.close()
    
    @staticmethod
    def update_assignment(assignment_id, user_id, **updates):
        """Update assignment (e.g., change reviewer)"""
        db = SessionLocal()
        
        try:
            assignment = db.query(Assignment).filter(
                Assignment.id == assignment_id
            ).first()
            
            if not assignment:
                return None, "Assignment not found"
            
            # Check permission
            conference = assignment.conference
            user = db.query(User).filter(User.id == user_id).first()
            
            # ✅ FIXED: Allow if user has Admin or Chair role
            user_role_names = [r.name if hasattr(r, 'name') else r for r in (user.roles if user else [])]
            is_admin = 'Admin' in user_role_names
            is_chair = 'Chair' in user_role_names
            
            if not (is_admin or is_chair or conference.chair_id == user_id):
                return None, "Permission denied: Need Admin or Chair role"
            
            # Check if review already submitted
            review = db.query(Review).filter(
                Review.assignment_id == assignment_id
            ).first()
            
            if review and 'reviewer_id' in updates:
                return None, "Cannot change reviewer after review submission"
            
            # Update allowed fields
            if 'reviewer_id' in updates:
                new_reviewer_id = updates['reviewer_id']
                
                # Check for conflict
                conflict = db.query(ConflictOfInterest).filter(
                    ConflictOfInterest.paper_id == assignment.paper_id,
                    ConflictOfInterest.reviewer_id == new_reviewer_id
                ).first()
                
                if conflict:
                    return None, f"Conflict of interest with new reviewer"
                
                assignment.reviewer_id = new_reviewer_id
            
            if 'status' in updates:
                assignment.status = updates['status']
            
            db.commit()
            db.refresh(assignment)
            
            return AssignmentService._serialize_assignment(db, assignment), None
            
        except Exception as e:
            db.rollback()
            return None, str(e)
        finally:
            db.close()
    
    @staticmethod
    def delete_assignment(assignment_id, user_id):
        """Delete (soft) an assignment"""
        db = SessionLocal()
        
        try:
            assignment = db.query(Assignment).filter(
                Assignment.id == assignment_id
            ).first()
            
            if not assignment:
                return False, "Assignment not found"
            
            # Check permission
            conference = assignment.conference
            user = db.query(User).filter(User.id == user_id).first()
            
            # ✅ FIXED: Allow if user has Admin or Chair role
            user_role_names = [r.name if hasattr(r, 'name') else r for r in (user.roles if user else [])]
            is_admin = 'Admin' in user_role_names
            is_chair = 'Chair' in user_role_names
            
            if not (is_admin or is_chair or conference.chair_id == user_id):
                return False, "Permission denied: Need Admin or Chair role"
            
            # Check if review already submitted
            review = db.query(Review).filter(
                Review.assignment_id == assignment_id
            ).first()
            
            if review:
                return False, "Cannot delete assignment after review submission"
            
            assignment.is_deleted = True
            db.commit()
            
            # Log deletion
            AuditLogAI.log(
                db_session=db,
                user_id=user_id,
                action_type='assignment_deleted',
                table_name='assignments',
                record_id=assignment_id,
                data=json.dumps({"paper_id": assignment.paper_id})
            )
            
            return True, None
            
        except Exception as e:
            db.rollback()
            return False, str(e)
        finally:
            db.close()
    
    @staticmethod
    def declare_conflict(paper_id, reviewer_id, reason=""):
        """Reviewer declares conflict of interest"""
        db = SessionLocal()
        
        try:
            # Verify paper and reviewer
            paper = db.query(Paper).filter(Paper.id == paper_id).first()
            if not paper:
                return None, "Paper not found"
            
            reviewer = db.query(User).filter(User.id == reviewer_id).first()
            if not reviewer:
                return None, "Reviewer not found"
            
            # Check if already declared
            existing = db.query(ConflictOfInterest).filter(
                ConflictOfInterest.paper_id == paper_id,
                ConflictOfInterest.reviewer_id == reviewer_id
            ).first()
            
            if existing:
                return None, "Conflict already declared"
            
            # Create conflict
            conflict = ConflictOfInterest(
                conference_id=paper.conference_id,
                paper_id=paper_id,
                reviewer_id=reviewer_id,
                reason=reason or "Declared by reviewer"
            )
            
            db.add(conflict)
            
            # Remove any existing assignment
            assignment = db.query(Assignment).filter(
                Assignment.paper_id == paper_id,
                Assignment.reviewer_id == reviewer_id
            ).first()
            
            if assignment:
                assignment.is_deleted = True
                assignment.status = 'Conflict'
            
            db.commit()
            
            # Log conflict
            AuditLogAI.log(
                db_session=db,
                user_id=reviewer_id,
                action_type='conflict_declared',
                table_name='conflict_of_interest',
                record_id=conflict.id,
                data=json.dumps({"paper_id": paper_id, "reason": reason})
            )
            
            return {
                'id': conflict.id,
                'paper_id': conflict.paper_id,
                'reviewer_id': conflict.reviewer_id,
                'reason': conflict.reason,
                'created_at': conflict.created_at.isoformat()
            }, None
            
        except Exception as e:
            db.rollback()
            return None, str(e)
        finally:
            db.close()
    
    @staticmethod
    def get_review_progress(conference_id):
        """Get review progress statistics for conference"""
        db = SessionLocal()
        
        try:
            # Total assignments
            total_assignments = db.query(Assignment).filter(
                Assignment.conference_id == conference_id,
                Assignment.is_deleted == False
            ).count()
            
            # Completed reviews
            completed = db.query(Assignment).join(Review).filter(
                Assignment.conference_id == conference_id,
                Assignment.is_deleted == False
            ).count()
            
            # Pending reviews
            pending = total_assignments - completed
            
            # By paper
            from sqlalchemy import func
            paper_stats = db.query(
                Paper.id,
                Paper.title,
                func.count(Assignment.id).label('assigned'),
                func.count(Review.id).label('completed')
            ).join(Assignment, Assignment.paper_id == Paper.id)\
             .outerjoin(Review, Review.assignment_id == Assignment.id)\
             .filter(
                 Paper.conference_id == conference_id,
                 Assignment.is_deleted == False
             ).group_by(Paper.id, Paper.title).all()
            
            papers = []
            for paper_id, title, assigned, completed in paper_stats:
                papers.append({
                    'paper_id': paper_id,
                    'title': title,
                    'assigned_reviewers': assigned,
                    'completed_reviews': completed,
                    'pending_reviews': assigned - completed
                })
            
            return {
                'total_assignments': total_assignments,
                'completed_reviews': completed,
                'pending_reviews': pending,
                'completion_rate': round(completed / total_assignments * 100, 2) if total_assignments > 0 else 0,
                'papers': papers
            }, None
            
        finally:
            db.close()
    
    @staticmethod
    def _serialize_assignment(db, assignment):
        """Serialize assignment with relations"""
        
        # Check if review submitted
        review = db.query(Review).filter(
            Review.assignment_id == assignment.id
        ).first()
        
        return {
            'id': assignment.id,
            'paper_id': assignment.paper_id,
            'paper_title': assignment.paper.title,
            'reviewer_id': assignment.reviewer_id,
            'reviewer_name': assignment.reviewer.full_name,
            'reviewer_email': assignment.reviewer.email,
            'conference_id': assignment.conference_id,
            'conference_name': assignment.conference.name,
            'status': assignment.status,
            'is_auto_assigned': assignment.is_auto_assigned,
            'review_submitted': review is not None,
            'review_score': review.score if review else None,
            'assigned_at': assignment.assigned_at.isoformat(),
            'created_at': assignment.created_at.isoformat()
        }
    
    @staticmethod
    def get_reviewer_assignments(reviewer_id, status=None, conference_id=None):
        """
        Get all assignments for a specific reviewer
        """
        db = SessionLocal()
        
        try:
            query = db.query(Assignment).filter(
                Assignment.reviewer_id == reviewer_id,
                Assignment.is_deleted == False
            ).join(Paper).join(Conference)
            
            # Don't filter by status in query - we calculate it dynamically
            # if status:
            #     query = query.filter(Assignment.status == status)
            
            if conference_id:
                query = query.filter(Assignment.conference_id == conference_id)
            
            assignments = query.all()
            
            result = []
            for assignment in assignments:
                # Get review if submitted
                review = db.query(Review).filter(
                    Review.assignment_id == assignment.id
                ).first()
                
                # Determine status based on review
                if review and review.score:
                    assign_status = 'completed'
                elif review:
                    assign_status = 'in_progress'
                else:
                    assign_status = 'pending'
                
                # Filter by status AFTER calculating it
                if status and assign_status != status:
                    continue
                
                result.append({
                    'assignment_id': assignment.id,
                    'paper_id': assignment.paper_id,
                    'paper_code': f"UTH{assignment.paper.created_at.year}-{str(assignment.paper_id).zfill(3)}",
                    'paper_title': assignment.paper.title,
                    'abstract': assignment.paper.abstract,
                    'keywords': assignment.paper.keywords.split(',') if assignment.paper.keywords else [],
                    'conference_name': assignment.conference.name,
                    'conference_id': assignment.conference_id,
                    'track': assignment.paper.track.name if assignment.paper.track else None,
                    'status': assign_status,
                    'assigned_date': assignment.assigned_at.isoformat() if assignment.assigned_at else None,
                    'deadline': assignment.conference.review_deadline.isoformat() if assignment.conference.review_deadline else None,
                    'review_submitted': review is not None,
                    'review_score': review.score if review else None
                })
            
            return result, None
            
        except Exception as e:
            return None, f"Error fetching assignments: {str(e)}"
        finally:
            db.close()
