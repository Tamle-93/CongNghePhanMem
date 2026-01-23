"""
Backend/src/domain/services/review_service.py
Review Service - Review Submission and Management
"""

from infrastructure.databases.base import SessionLocal
from infrastructure.models import (
    Review, Assignment, Paper, User, Conference, AuditLogAI
)
from datetime import datetime
import json

class ReviewService:
    """Review management service"""
    
    @staticmethod
    def submit_review(assignment_id, reviewer_id, score, 
                     comments_for_author, confidential_content=""):
        """Submit or update review for an assignment"""
        db = SessionLocal()
        
        try:
            # Verify assignment
            assignment = db.query(Assignment).filter(
                Assignment.id == assignment_id,
                Assignment.is_deleted == False
            ).first()
            
            if not assignment:
                return None, "Assignment not found"
            
            # Verify reviewer
            if assignment.reviewer_id != reviewer_id:
                return None, "You are not assigned to review this paper"
            
            # Check review deadline
            conference = assignment.conference
            if datetime.utcnow() > conference.review_deadline:
                return None, "Review deadline has passed"
            
            # Check if review already exists
            existing_review = db.query(Review).filter(
                Review.assignment_id == assignment_id
            ).first()
            
            if existing_review:
                # Update existing review
                existing_review.score = score
                existing_review.comments_for_author = comments_for_author
                existing_review.confidential_content = confidential_content
                existing_review.updated_at = datetime.utcnow()
                
                db.commit()
                db.refresh(existing_review)
                
                review = existing_review
                action = 'review_updated'
            else:
                # Create new review
                review = Review(
                    assignment_id=assignment_id,
                    paper_id=assignment.paper_id,
                    score=score,
                    comments_for_author=comments_for_author,
                    confidential_content=confidential_content
                )
                
                db.add(review)
                db.commit()
                db.refresh(review)
                
                action = 'review_submitted'
                
                # Update assignment status
                assignment.status = 'Completed'
                db.commit()
            
            # Log review
            AuditLogAI.log(
                db_session=db,
                user_id=reviewer_id,
                action_type=action,
                table_name='reviews',
                record_id=review.id,
                data=json.dumps({
                    "assignment_id": assignment_id,
                    "paper_id": assignment.paper_id,
                    "score": score
                })
            )
            
            return ReviewService._serialize_review(db, review), None
            
        except Exception as e:
            db.rollback()
            return None, str(e)
        finally:
            db.close()
    
    @staticmethod
    def _serialize_review(db, review, show_reviewer_info=True, show_confidential=True):
        """Serialize review"""
        data = {
            'id': review.id,
            'assignment_id': review.assignment_id,
            'paper_id': review.paper_id,
            'score': review.score,
            'comments_for_author': review.comments_for_author,
            'created_at': review.created_at.isoformat(),
            'updated_at': review.updated_at.isoformat()
        }
        
        if show_reviewer_info:
            reviewer = review.assignment.reviewer
            data['reviewer_id'] = reviewer.id
            data['reviewer_name'] = reviewer.full_name
        
        if show_confidential:
            data['confidential_content'] = review.confidential_content
        
        return data

