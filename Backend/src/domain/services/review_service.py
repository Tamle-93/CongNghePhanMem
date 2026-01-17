from Backend.schemas.review_schema import ReviewCreateSchema
from models.review_model import ReviewModel

class ReviewService:

    @staticmethod
    def get_assignments_for_reviewer(user_id):
        return ReviewModel.get_assignments_for_reviewer(user_id)

    @staticmethod
    def submit_review(data: ReviewCreateSchema):
        ReviewModel.submit_review(
            assignment_id=data.assignment_id,
            score=data.score,
            comment=data.comment
        )
