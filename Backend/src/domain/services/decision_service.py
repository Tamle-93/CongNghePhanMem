"""
============================================
Backend/src/domain/services/decision_service.py
============================================
Decision Service - Quyết định cho bài báo

MỤC ĐÍCH:
- Quản lý quyết định cuối cùng cho bài báo
- Track decision history
- Generate notification emails
- Support all decision types: Accept, Reject, Revision

CHỨC NĂNG CHÍNH:
1. make_decision(): Tạo hoặc cập nhật quyết định
   - Accept: Chấp nhận bài
   - Reject: Từ chối bài
   - Revision: Yêu cầu chỉnh sửa
   
2. get_decision(): Lấy quyết định của bài
3. notify_authors(): Gửi email cho tác giả
4. get_statistics(): Thống kê quyết định

DECISION WORKFLOW:
1. Chair view reviews for a paper
2. Chair reads comments từ reviewers
3. Chair make decision + write feedback
4. System create Decision record
5. System send email to authors
6. Authors see result in their dashboard
7. If Revision: authors resubmit + new review
8. If Accept: authors submit camera-ready

NOTIFICATION:
- Template cho mỗi decision type
- Include review comments nếu needed
- Send to all authors
- Log to AuditLogAI
"""

from infrastructure.databases.base import SessionLocal
from infrastructure.models import (
    Decision, Paper, Conference, User, Review, 
    Assignment, AuditLogAI, PaperStatus
)
from datetime import datetime
import json

class DecisionService:
    """
    Decision Management Service
    ===========================
    Quản lý quyết định bài báo
    """
    
    @staticmethod
    def make_decision(paper_id, chair_user_id, result, final_comment=""):
        """
        Make decision on a paper
        result: 'Accept', 'Reject', 'Revision'
        """
        db = SessionLocal()
        
        try:
            # Verify paper
            paper = db.query(Paper).filter(Paper.id == paper_id).first()
            
            if not paper:
                return None, "Paper not found"
            
            # Verify chair permission
            conference = paper.conference
            chair = db.query(User).filter(User.id == chair_user_id).first()
            
            # Check if user is chair of conference or Admin
            is_admin = 'Admin' in (chair.roles if chair else [])
            is_chair = conference.chair_id == chair_user_id
            
            if not is_chair and not is_admin:
                return None, "Permission denied: Only conference chair can make decisions"
            
            # Check if reviews are complete (optional - allow decision without reviews)
            assignments = db.query(Assignment).filter(
                Assignment.paper_id == paper_id,
                Assignment.is_deleted == False
            ).all()
            
            # Allow decision even without assignments (Chair can decide directly)
            # if not assignments:
            #     return None, "No reviewers assigned to this paper"
            
            # completed_reviews = db.query(Review).filter(
            #     Review.paper_id == paper_id,
            #     Review.is_deleted == False
            # ).count()
            # 
            # if completed_reviews < len(assignments):
            #     return None, f"Not all reviews completed ({completed_reviews}/{len(assignments)})"
            
            # Check if decision already exists
            existing_decision = db.query(Decision).filter(
                Decision.paper_id == paper_id
            ).first()
            
            if existing_decision:
                # Update existing decision
                existing_decision.result = result
                existing_decision.final_comment = final_comment
                existing_decision.updated_at = datetime.utcnow()
                
                db.commit()
                db.refresh(existing_decision)
                
                decision = existing_decision
                action = 'decision_updated'
            else:
                # Create new decision
                decision = Decision(
                    paper_id=paper_id,
                    conference_id=conference.id,
                    chair_user_id=chair_user_id,
                    result=result,
                    final_comment=final_comment
                )
                
                db.add(decision)
                db.commit()
                db.refresh(decision)
                
                action = 'decision_made'
            
            # Update paper status
            if result == 'Accept':
                paper.status = PaperStatus.ACCEPTED
            elif result == 'Reject':
                paper.status = PaperStatus.REJECTED
            else:  # Revision
                paper.status = PaperStatus.UNDER_REVIEW
            
            db.commit()
            
            # Log decision
            AuditLogAI.log(
                db_session=db,
                user_id=chair_user_id,
                action_type=action,
                table_name='decisions',
                record_id=decision.id,
                data=json.dumps({
                    "paper_id": paper_id,
                    "result": result,
                    "paper_title": paper.title
                })
            )
            
            return DecisionService._serialize_decision(db, decision), None
            
        except Exception as e:
            db.rollback()
            return None, str(e)
        finally:
            db.close()
    
    @staticmethod
    def get_decision(paper_id):
        """Get decision for a paper"""
        db = SessionLocal()
        
        try:
            decision = db.query(Decision).filter(
                Decision.paper_id == paper_id,
                Decision.is_deleted == False
            ).first()
            
            if not decision:
                return None, "No decision found for this paper"
            
            return DecisionService._serialize_decision(db, decision), None
            
        finally:
            db.close()
    
    @staticmethod
    def get_conference_decisions(conference_id, page=1, per_page=20):
        """Get all decisions for a conference"""
        db = SessionLocal()
        
        try:
            total = db.query(Decision).filter(
                Decision.conference_id == conference_id,
                Decision.is_deleted == False
            ).count()
            
            decisions = db.query(Decision).filter(
                Decision.conference_id == conference_id,
                Decision.is_deleted == False
            ).order_by(Decision.created_at.desc())\
             .limit(per_page)\
             .offset((page - 1) * per_page)\
             .all()
            
            return {
                'decisions': [DecisionService._serialize_decision(db, d) for d in decisions],
                'total': total,
                'page': page,
                'per_page': per_page
            }, None
            
        finally:
            db.close()
    
    @staticmethod
    def get_decision_statistics(conference_id):
        """Get decision statistics for a conference"""
        db = SessionLocal()
        
        try:
            from sqlalchemy import func
            
            # Count by result
            result_stats = db.query(
                Decision.result,
                func.count(Decision.id).label('count')
            ).filter(
                Decision.conference_id == conference_id,
                Decision.is_deleted == False
            ).group_by(Decision.result).all()
            
            stats = {
                'Accept': 0,
                'Reject': 0,
                'Revision': 0
            }
            
            for result, count in result_stats:
                if result in stats:
                    stats[result] = count
            
            total = sum(stats.values())
            
            # Calculate acceptance rate
            acceptance_rate = (stats['Accept'] / total * 100) if total > 0 else 0
            
            # Total papers vs decided papers
            total_papers = db.query(Paper).filter(
                Paper.conference_id == conference_id
            ).count()
            
            return {
                'total_papers': total_papers,
                'decided_papers': total,
                'pending_decisions': total_papers - total,
                'accepted': stats['Accept'],
                'rejected': stats['Reject'],
                'revision_required': stats['Revision'],
                'acceptance_rate': round(acceptance_rate, 2)
            }, None
            
        finally:
            db.close()
    
    @staticmethod
    def bulk_notify_authors(conference_id, chair_user_id):
        """
        Send notifications to all authors with decisions
        Returns list of papers with decisions
        """
        db = SessionLocal()
        
        try:
            # Verify permission
            conference = db.query(Conference).filter(
                Conference.id == conference_id
            ).first()
            
            if not conference:
                return None, "Conference not found"
            
            chair = db.query(User).filter(User.id == chair_user_id).first()
            if conference.chair_id != chair_user_id and chair.role != 'Admin':
                return None, "Permission denied"
            
            # Get all decisions for this conference
            decisions = db.query(Decision).filter(
                Decision.conference_id == conference_id,
                Decision.is_deleted == False
            ).all()
            
            if not decisions:
                return None, "No decisions to notify"
            
            notifications = []
            
            for decision in decisions:
                paper = decision.paper
                submitter = paper.submitter
                
                notifications.append({
                    'paper_id': paper.id,
                    'paper_title': paper.title,
                    'decision': decision.result,
                    'author_email': submitter.email,
                    'author_name': submitter.full_name,
                    'final_comment': decision.final_comment
                })
            
            # Log bulk notification
            AuditLogAI.log(
                db_session=db,
                user_id=chair_user_id,
                action_type='bulk_notification_sent',
                table_name='decisions',
                record_id=conference_id,
                data=json.dumps({
                    "conference_id": conference_id,
                    "notification_count": len(notifications)
                })
            )
            
            return {
                'conference_id': conference_id,
                'conference_name': conference.name,
                'notification_count': len(notifications),
                'notifications': notifications
            }, None
            
        except Exception as e:
            return None, str(e)
        finally:
            db.close()
    
    @staticmethod
    def get_paper_decision_summary(paper_id):
        """
        Get comprehensive decision summary including reviews
        """
        db = SessionLocal()
        
        try:
            paper = db.query(Paper).filter(Paper.id == paper_id).first()
            
            if not paper:
                return None, "Paper not found"
            
            # Get reviews
            reviews = db.query(Review).filter(
                Review.paper_id == paper_id,
                Review.is_deleted == False
            ).all()
            
            # Get decision
            decision = db.query(Decision).filter(
                Decision.paper_id == paper_id,
                Decision.is_deleted == False
            ).first()
            
            # Calculate average score
            from sqlalchemy import func
            avg_score = db.query(func.avg(Review.score)).filter(
                Review.paper_id == paper_id,
                Review.is_deleted == False
            ).scalar()
            
            review_summaries = []
            for review in reviews:
                review_summaries.append({
                    'score': review.score,
                    'comments': review.comments_for_author,
                    'created_at': review.created_at.isoformat()
                })
            
            return {
                'paper_id': paper.id,
                'paper_title': paper.title,
                'paper_status': paper.status.value if paper.status else None,
                'review_count': len(reviews),
                'average_score': round(float(avg_score), 2) if avg_score else None,
                'reviews': review_summaries,
                'decision': {
                    'result': decision.result,
                    'final_comment': decision.final_comment,
                    'decided_at': decision.created_at.isoformat(),
                    'decided_by': decision.chair.full_name
                } if decision else None
            }, None
            
        finally:
            db.close()
    
    @staticmethod
    def _serialize_decision(db, decision):
        """Serialize decision with relations"""
        
        paper = decision.paper
        chair = decision.chair
        conference = None
        
        # Try to get conference - handle both relationship loading and direct query
        try:
            if hasattr(decision, 'conference') and decision.conference:
                conference = decision.conference
            elif decision.conference_id:
                # Fallback: query conference if relationship not loaded
                from infrastructure.models import Conference
                conference = db.query(Conference).filter(Conference.id == decision.conference_id).first()
        except:
            pass
        
        return {
            'id': decision.id,
            'paper_id': decision.paper_id,
            'paper_title': paper.title,
            'paper_status': paper.status.value if paper.status else None,
            'conference_id': decision.conference_id,
            'conference_name': conference.name if conference else None,
            'result': decision.result,
            'final_comment': decision.final_comment,
            'chair_id': decision.chair_user_id,
            'chair_name': chair.full_name,
            'created_at': decision.created_at.isoformat(),
            'updated_at': decision.updated_at.isoformat()
        }
