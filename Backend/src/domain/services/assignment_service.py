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
            if conference.chair_id != chair_user_id and 'Admin' not in (chair.roles if chair else []):
                return None, "Permission denied"
            
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
            if reviewer and ('Reviewer' not in reviewer.roles and 'Chair' not in reviewer.roles):
                reviewer = None
            
            if not reviewer:
                return None, "Reviewer not found or invalid role"
            
            # Check for conflict of interest
            conflict = db.query(ConflictOfInterest).filter(
                ConflictOfInterest.paper_id == paper_id,
                ConflictOfInterest.reviewer_id == reviewer_id
            ).first()
            
            if conflict:
                return None, f"Conflict of interest: {conflict.reason}"
            
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
            
            # ✅ Update paper status to under_review after first assignment
            if paper.status in ['submitted', 'pending']:
                paper.status = 'under_review'
            
            db.commit()
            db.refresh(assignment)
            
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
            
            # ✅ FIXED: Check user.roles for multi-role support
            if conference.chair_id != user_id and 'Admin' not in user.roles:
                return None, "Permission denied"
            
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
            
            # ✅ FIXED: Check user.roles for multi-role support
            if conference.chair_id != user_id and 'Admin' not in user.roles:
                return False, "Permission denied"
            
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
            
            if status:
                query = query.filter(Assignment.status == status)
            
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
