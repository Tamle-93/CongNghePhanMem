# ============================================
# File: Backend/src/infrastructure/models/brow_history_model.py
# ============================================
"""
Browse History Model - Track when users view papers/reviews
"""

from sqlalchemy import Column, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from infrastructure.databases.base import Base


class BrowHistory(Base):
    __tablename__ = 'brow_history'
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Who viewed
    viewer_id = Column(
        Integer, 
        ForeignKey('users.id', ondelete='CASCADE'),
        nullable=True
    )
    
    # What was viewed
    paper_id = Column(
        Integer, 
        ForeignKey('papers.id', ondelete='CASCADE'),
        nullable=True
    )
    
    # Context/snapshot
    old_content = Column(Text, nullable=True)
    
    # When
    timestamp = Column(
        DateTime, 
        default=datetime.utcnow, 
        nullable=False, 
        index=True
    )
    
    # Relationships
    viewer = relationship("User", backref="browse_history")
    paper = relationship("Paper", backref="view_history")
    
    def __repr__(self):
        return f"<BrowHistory(id={self.id}, viewer_id={self.viewer_id}, paper_id={self.paper_id})>"