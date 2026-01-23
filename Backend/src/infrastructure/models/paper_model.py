"""
Backend/src/infrastructure/models/paper_model.py
Paper Model - FIXED with correct Enum and relationships
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum as PyEnum
from infrastructure.databases.base import Base

class PaperStatus(str, PyEnum):
    """Paper status enum"""
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    REVIEWED = "reviewed"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"

class Paper(Base):
    """Paper Model - Bài báo khoa học"""
    __tablename__ = 'papers'
    __table_args__ = {'extend_existing': True}
    
    # Primary Key
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Paper Info
    title = Column(String(500), nullable=False, index=True)
    abstract = Column(Text, nullable=True)
    keywords = Column(String(500), nullable=True)
    pdf_path = Column(String(500), nullable=True)
    camera_ready_path = Column(String(500), nullable=True)
    
    # Status - FIXED: Use Enum correctly
    status = Column(
        Enum(PaperStatus, native_enum=True, name='paperstatus'),
        default=PaperStatus.DRAFT,
        nullable=False,
        index=True
    )
    
    is_withdrawn = Column(Boolean, default=False, nullable=False)
    
    # Foreign Keys
    submitter_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    conference_id = Column(Integer, ForeignKey('conferences.id'), nullable=False, index=True)
    track_id = Column(Integer, ForeignKey('tracks.id'), nullable=True, index=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships - FIXED: Remove overlaps
    submitter = relationship("User", foreign_keys=[submitter_id])
    conference = relationship("Conference", back_populates="papers")
    track = relationship("Track", back_populates="papers")
    authors = relationship("PaperAuthor", back_populates="paper", cascade="all, delete-orphan")
    assignments = relationship("Assignment", back_populates="paper", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="paper", cascade="all, delete-orphan")
    decision = relationship("Decision", back_populates="paper", uselist=False)
    
    def __repr__(self):
        return f"<Paper(id={self.id}, title='{self.title[:50]}...', status={self.status.value})>"
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'title': self.title,
            'abstract': self.abstract,
            'keywords': self.keywords,
            'status': self.status.value,
            'is_withdrawn': self.is_withdrawn,
            'submitter_id': self.submitter_id,
            'conference_id': self.conference_id,
            'track_id': self.track_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }