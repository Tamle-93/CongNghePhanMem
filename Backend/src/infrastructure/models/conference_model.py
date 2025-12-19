# File: src/infrastructure/models/conference_model.py
"""
Conferences Model - Hội nghị khoa học
"""

from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from infrastructure.databases.base import Base

class ConferenceModel(Base):
    __tablename__ = 'Conferences'
    __table_args__ = {'extend_existing': True}
    
    # Primary Key
    Id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Foreign Key
    Chair_Users_Id = Column(
        UUID(as_uuid=True),
        ForeignKey('Users.Id', ondelete='RESTRICT'),
        nullable=False
    )
    
    # Conference Info
    Name = Column(String(255), nullable=False)
    Description = Column(Text, nullable=True)
    SubmissionDeadline = Column(DateTime, nullable=False)
    ReviewDeadline = Column(DateTime, nullable=False)
    IsBlindReview = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    CreatedDate = Column(DateTime, default=datetime.utcnow, nullable=False)
    UpdatedDate = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    IsDeleted = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    chair = relationship("UserModel", back_populates="chaired_conferences")
    tracks = relationship("TrackModel", back_populates="conference", cascade="all, delete-orphan")
