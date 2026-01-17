from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class ReviewCreateSchema(BaseModel):
    assignment_id: UUID
    score: int
    confidence_level: int
    comments_for_author: Optional[str]
    comments_for_chair: Optional[str]


class ReviewResponseSchema(BaseModel):
    id: UUID
    assignment_id: UUID
    score: int
    confidence_level: int
    comments_for_author: Optional[str]
    comments_for_chair: Optional[str]
    submitted_date: Optional[datetime]

    class Config:
        from_attributes = True
