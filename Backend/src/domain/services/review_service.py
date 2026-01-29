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

    @staticmethod
    def get_reviews_by_reviewer(reviewer_id, conference_id=None):
        """Get all reviews submitted by a specific reviewer"""
        db = SessionLocal()
        
        try:
            query = db.query(Review).join(Assignment).filter(
                Assignment.reviewer_id == reviewer_id,
                Review.is_deleted == False
            )
            
            if conference_id:
                query = query.filter(Assignment.conference_id == conference_id)
            
            reviews = query.order_by(Review.created_at.desc()).all()
            
            return {
                'reviews': [ReviewService._serialize_review(db, r) for r in reviews],
                'total': len(reviews)
            }, None
            
        except Exception as e:
            return None, str(e)
        finally:
            db.close()

    @staticmethod
    def get_review_by_id(review_id):
        """Get a specific review by ID"""
        db = SessionLocal()
        
        try:
            review = db.query(Review).filter(
                Review.id == review_id,
                Review.is_deleted == False
            ).first()
            
            if not review:
                return None, "Review not found"
            
            return ReviewService._serialize_review(db, review), None
            
        except Exception as e:
            return None, str(e)
        finally:
            db.close()

    @staticmethod
    def get_reviews_for_paper(paper_id):
        """Get all reviews for a specific paper"""
        db = SessionLocal()
        
        try:
            reviews = db.query(Review).filter(
                Review.paper_id == paper_id,
                Review.is_deleted == False
            ).all()
            
            return {
                'reviews': [ReviewService._serialize_review(db, r, show_confidential=False) for r in reviews],
                'total': len(reviews)
            }, None
            
        except Exception as e:
            return None, str(e)
        finally:
            db.close()

    @staticmethod
    def get_conference_statistics(conference_id):
        """Get review statistics for a conference"""
        db = SessionLocal()
        
        try:
            from sqlalchemy import func
            
            # Get total assignments
            total_assignments = db.query(func.count(Assignment.id)).filter(
                Assignment.conference_id == conference_id,
                Assignment.is_deleted == False
            ).scalar()
            
            # Get completed reviews
            completed_reviews = db.query(func.count(Review.id)).join(Assignment).filter(
                Assignment.conference_id == conference_id,
                Review.is_deleted == False
            ).scalar()
            
            # Get average score
            avg_score = db.query(func.avg(Review.score)).join(Assignment).filter(
                Assignment.conference_id == conference_id,
                Review.is_deleted == False
            ).scalar()
            
            return {
                'total_assignments': total_assignments,
                'completed_reviews': completed_reviews,
                'pending_reviews': total_assignments - completed_reviews,
                'completion_rate': (completed_reviews / total_assignments * 100) if total_assignments > 0 else 0,
                'average_score': round(float(avg_score), 2) if avg_score else 0
            }, None
            
        except Exception as e:
            return None, str(e)
        finally:
            db.close()
