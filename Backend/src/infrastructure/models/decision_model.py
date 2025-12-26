# File: src/infrastructure/models/decision_model.py
"""
Decisions Model - Quyết định về bài báo
"""

from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from src.infrastructure.databases.base import Base

class Decision(Base):
    __tablename__ = 'decisions'
    __table_args__ = {'extend_existing': True}
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign Keys
    paper_id = Column(Integer, ForeignKey('papers.id', ondelete='CASCADE'), nullable=False)
    conference_id = Column(Integer, ForeignKey('conferences.id', ondelete='SET NULL'))
    chair_id = Column(Integer, ForeignKey('users.id', ondelete='RESTRICT'), nullable=False)
    
    # Decision Info
    result = Column(String(20), nullable=True)
    final_comment = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    paper = relationship("Paper", back_populates="decision")
    chair = relationship("User", back_populates="decisions")