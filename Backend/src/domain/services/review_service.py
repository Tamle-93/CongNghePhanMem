from sqlalchemy.orm import Session
from datetime import datetime

from infrastructure.models.review_model import Review
from domain.schemas.review_schema import ReviewCreateSchema


def submit_review(db: Session, data: ReviewCreateSchema):
    review = Review(
        Assignment_Id=data.assignment_id,
        Score=data.score,
        ConfidenceLevel=data.confidence_level,
        CommentsForAuthor=data.comments_for_author,
        CommentsForChair=data.comments_for_chair,
        SubmittedDate=datetime.utcnow()
    )

    db.add(review)
    db.commit()
    db.refresh(review)
    return review


def get_reviews_by_assignment(db: Session, assignment_id):
    return db.query(Review).filter(
        Review.Assignment_Id == assignment_id,
        Review.IsDeleted == False
    ).all()
