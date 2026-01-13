# File: src/infrastructure/models/track_model.py
"""
Tracks Model - Tiểu ban trong hội nghị
"""

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from infrastructure.databases.base import Base

class Track(Base):
    __tablename__ = 'tracks'
    __table_args__ = {'extend_existing': True}
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign Key
    conference_id = Column(Integer, ForeignKey('conferences.id', ondelete='CASCADE'), nullable=False)
    
    # Track Info
    name = Column(String(100), nullable=False)
    code = Column(String(20), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    conference = relationship("Conference", back_populates="tracks")
    papers = relationship("Paper", back_populates="track", cascade="all, delete-orphan")
