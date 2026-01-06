# File: src/infrastructure/models/review_model.py
"""
Reviews Model - Đánh giá bài báo (standardized)
"""

from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime, Boolean, CheckConstraint
from sqlalchemy.orm import relationship
from datetime import datetime

from infrastructure.databases.base import Base

class Review(Base):
    __tablename__ = 'reviews'
    __table_args__ = (
        CheckConstraint('score >= 1 AND score <= 10', name='check_score_range'),
        {'extend_existing': True}
    )

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign Keys
    assignment_id = Column(Integer, ForeignKey('assignments.id', ondelete='CASCADE'), nullable=False, unique=True)
    paper_id = Column(Integer, ForeignKey('papers.id', ondelete='CASCADE'), nullable=False)

    # Review Info
    score = Column(Integer, nullable=True)
    comments_for_author = Column(Text, nullable=True)
    confidential_content = Column(Text, nullable=True)
    old_confidential_content = Column(Text)

    # Relationships
    paper = relationship("Paper", back_populates="reviews")
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False, nullable=False)

    # Relationships
    assignment = relationship("Assignment", back_populates="review")