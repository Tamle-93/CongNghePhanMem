"""
Assignment Model - Phân công bài báo (standardized)
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from src.infrastructure.databases.base import Base


class Assignment(Base):
    __tablename__ = 'assignments'
    __table_args__ = {'extend_existing': True}

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign keys
    conference_id = Column(Integer, ForeignKey('conferences.id', ondelete='CASCADE'), nullable=False)
    paper_id = Column(Integer, ForeignKey('papers.id', ondelete='CASCADE'), nullable=False)
    reviewer_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)

    # Assignment info
    is_auto_assigned = Column(Boolean, default=False)
    status = Column(String(30), default='Assigned')  
    # Assigned / Accepted / Declined / Completed

    # Time
    assigned_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to review (one-to-one)
    review = relationship("Review", back_populates="assignment", uselist=False)
    reviewer = relationship("User", back_populates="assignments")
    paper = relationship("Paper")
    conference = relationship("Conference")
