"""
Conflict Model - Conflict of Interest (COI) (standardized)
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from src.infrastructure.databases.base import Base


class Conflict(Base):
    __tablename__ = 'conflicts'
    __table_args__ = {'extend_existing': True}

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Conflict info
    conference_id = Column(Integer, ForeignKey('conferences.id', ondelete='CASCADE'), nullable=False)
    paper_id = Column(Integer, ForeignKey('papers.id', ondelete='CASCADE'), nullable=False)
    reviewer_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)

    reason = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    reviewer = relationship("User", back_populates="conflicts")
