# File: Backend/src/infrastructure/models/conference_mentor_model.py
# ============================================
"""
Conference Mentors Model - Reviewer pool for conferences
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from infrastructure.databases.base import Base


class ConferenceMentor(Base):
    __tablename__ = 'conference_mentors'
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign Keys
    reviewer_user_id = Column(
        Integer, 
        ForeignKey('users.id', ondelete='CASCADE'), 
        nullable=False
    )
    paper_id = Column(
        Integer, 
        ForeignKey('papers.id', ondelete='CASCADE'),
        nullable=True
    )
    
    # Mentor details
    reason = Column(String(255), nullable=True)
    request_date = Column(DateTime, nullable=True)
    quota = Column(Integer, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow
    )
    
    # Relationships
    reviewer = relationship("User", backref="mentor_assignments")
    paper = relationship("Paper", backref="mentors")
    
    def __repr__(self):
        return f"<ConferenceMentor(id={self.id}, reviewer_id={self.reviewer_user_id})>"