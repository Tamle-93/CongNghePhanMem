# File: src/infrastructure/models/track_model.py
"""
Tracks Model - Tiểu ban trong hội nghị
"""

from sqlalchemy import Column, String, ForeignKey, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from infrastructure.databases.base import Base

class TrackModel(Base):
    __tablename__ = 'Tracks'
    __table_args__ = {'extend_existing': True}
    
    # Primary Key
    Id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Foreign Key
    Conference_Id = Column(
        UUID(as_uuid=True),
        ForeignKey('Conferences.Id', ondelete='CASCADE'),
        nullable=False
    )
    
    # Track Info
    Name = Column(String(100), nullable=False)
    Code = Column(String(20), nullable=False)
    
    # Timestamps
    CreatedDate = Column(DateTime, default=datetime.utcnow, nullable=False)
    UpdatedDate = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    IsDeleted = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    conference = relationship("ConferenceModel", back_populates="tracks")
    papers = relationship("PaperModel", back_populates="track", cascade="all, delete-orphan")
