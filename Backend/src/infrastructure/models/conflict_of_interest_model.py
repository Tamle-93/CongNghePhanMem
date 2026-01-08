# ============================================
# File: Backend/src/infrastructure/models/conflict_of_interest_model.py
# ============================================
"""
Conflict of Interest Model
"""

from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from infrastructure.databases.base import Base


class ConflictOfInterest(Base):
    __tablename__ = 'conflict_of_interest'
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign Keys
    conference_id = Column(
        Integer, 
        ForeignKey('conferences.id', ondelete='CASCADE'),
        nullable=True
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
    
    # Conflict reason
    reason = Column(Text, nullable=True)
    
    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    conference = relationship("Conference", backref="conflicts")
    paper = relationship("Paper", backref="conflicts")
    reviewer = relationship("User", backref="conflicts")
    
    def __repr__(self):
        return f"<ConflictOfInterest(id={self.id}, reviewer_id={self.reviewer_id}, paper_id={self.paper_id})>"