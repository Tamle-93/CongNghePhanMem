"""
============================================
Backend/src/domain/services/review_service.py
============================================
Review Service - Phản biện quản lý

MỤC ĐÍCH:
- Quản lý submission của phản biện
- Track review scores và comments
- Validate review deadlines
- Ghi log audit trail

CHỨC NĂNG CHÍNH:
1. submit_review(): Nộp hoặc cập nhật phản biện
   - Validate reviewer assignment
   - Check deadline
   - Update assignment status
   
2. get_paper_reviews(): Lấy tất cả reviews của 1 bài
3. get_reviewer_assignments(): Bài phân công cho reviewer
4. get_review_status(): Trạng thái phản biện

WORKFLOW:
1. Reviewer login -> list assignments
2. Reviewer open paper -> submit review with score + comments
3. System log to AuditLogAI
4. Chair view reviews -> make decision

SECURITY:
- Chỉ assigned reviewer mới submit review
- Check deadline trước submit
- Confidential comments (không cho author thấy)
- Audit log mọi thay đổi
"""

from infrastructure.databases.base import SessionLocal
from infrastructure.models import (
    Review, Assignment, Paper, User, Conference, AuditLogAI
)
from domain.services.email_service import EmailService
from datetime import datetime
import json

class ReviewService:
    """
    Review Management Service
    ========================
    Quản lý phản biện và scores
    """
    
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
                return None, "Review already submitted"
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
                
                # ✅ Send email to chair that review is submitted
                try:
                    conference = assignment.conference
                    paper = assignment.paper
                    reviewer = assignment.reviewer
                    
                    EmailService.send_email(
                        to=conference.chair_email if conference.chair_email else 'chair@example.com',
                        subject=f'Phản biện đã nộp - {paper.title[:50]}...',
                        body=f"""
                        Xin chào,
                        
                        Phản biện đã nộp nhận xét cho bài báo:
                        
                        Tiêu đề: {paper.title}
                        Phản biện: {reviewer.full_name or reviewer.username}
                        Điểm: {score}/5
                        
                        Vui lòng đăng nhập vào hệ thống để xem chi tiết.
                        
                        Trân trọng,
                        Hệ thống quản lý hội nghị
                        """,
                        html=f"""
                        <p>Xin chào,</p>
                        <p>Phản biện đã nộp nhận xét cho bài báo:</p>
                        <div style="background-color: #f9fafb; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                            <p><strong>Tiêu đề:</strong> {paper.title}</p>
                            <p><strong>Phản biện:</strong> {reviewer.full_name or reviewer.username}</p>
                            <p><strong>Điểm:</strong> <span style="font-size: 18px; font-weight: bold; color: #10b981;">{score}</span>/5</p>
                        </div>
                        <p>Vui lòng đăng nhập vào hệ thống để xem chi tiết.</p>
                        """,
                        email_type='REVIEW_SUBMITTED',
                        entity_type='Review',
                        entity_id=review.id,
                        user_id=reviewer_id
                    )
                except Exception as e:
                    print(f"⚠️  Failed to send review submission email: {str(e)}")
            
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
