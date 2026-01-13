"""
Backend/src/infrastructure/models/assignment_model.py
Assignment Model - Phân công bài báo (COMPLETE FIX)
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from infrastructure.databases.base import Base


class Assignment(Base):
    """
    Assignment of papers to reviewers
    """
    __tablename__ = 'assignments'
    __table_args__ = {'extend_existing': True}

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign keys
    conference_id = Column(
        Integer, 
        ForeignKey('conferences.id', ondelete='CASCADE'), 
        nullable=False
    )
    paper_id = Column(
        Integer, 
        ForeignKey('papers.id', ondelete='CASCADE'), 
        nullable=False
    )
    reviewer_id = Column(
        Integer, 
        ForeignKey('users.id', ondelete='CASCADE'), 
        nullable=False
    )

    # Assignment info
    is_auto_assigned = Column(Boolean, default=False)
    status = Column(String(30), default='Assigned')
    
    # NEW FIELDS from ERD
    score = Column(Integer, nullable=True)
    confidential_comment = Column(Text, nullable=True)

    # Timestamps
    assigned_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)

    # Relationships
    review = relationship(
        "Review", 
        back_populates="assignment", 
        uselist=False,
        cascade="all, delete-orphan"
    )
    reviewer = relationship("User", back_populates="assignments")
    paper = relationship("Paper", backref="paper_assignments")
    conference = relationship("Conference", backref="conference_assignments")
    
    def __repr__(self):
        return f"<Assignment(id={self.id}, paper_id={self.paper_id}, reviewer_id={self.reviewer_id}, status='{self.status}')>"