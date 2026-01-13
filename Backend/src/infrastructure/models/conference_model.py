# File: src/infrastructure/models/conference_model.py
"""
Conferences Model - Hội nghị khoa học (standardized)
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from infrastructure.databases.base import Base

class Conference(Base):
    __tablename__ = 'conferences'
    __table_args__ = {'extend_existing': True}

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign Key - chair user
    chair_id = Column(Integer, ForeignKey('users.id', ondelete='RESTRICT'), nullable=False)

    # Conference Info
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    submission_deadline = Column(DateTime, nullable=False)
    review_deadline = Column(DateTime, nullable=False)
    is_blind_review = Column(Boolean, default=True, nullable=False)
    start_date = Column(DateTime)
    end_date = Column(DateTime)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False, nullable=False)

    # Relationships
    chair = relationship("User", back_populates="chaired_conferences")
    tracks = relationship("Track", back_populates="conference", cascade="all, delete-orphan")
    papers = relationship("Paper", back_populates="conference", cascade="all, delete-orphan")
