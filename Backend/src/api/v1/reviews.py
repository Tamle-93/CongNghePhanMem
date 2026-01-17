from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from infrastructure.database import get_db
from domain.schemas.review_schema import ReviewCreateSchema, ReviewResponseSchema
from domain.services.review_service import submit_review

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.post("/submit", response_model=ReviewResponseSchema)
def submit_review_api(
    data: ReviewCreateSchema,
    db: Session = Depends(get_db)
):
    return submit_review(db, data)
