"""
Backend/src/infrastructure/models/feature_flag_model.py
Feature Flag Model - Enable/disable AI features per conference
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from infrastructure.databases.base import Base


class FeatureFlag(Base):
    """
    Feature Flag Model
    Manages AI and optional features per conference
    """
    __tablename__ = 'feature_flags'
    __table_args__ = {'extend_existing': True}
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign Keys
    conference_id = Column(
        Integer,
        ForeignKey('conferences.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    
    # Feature name and control
    feature_name = Column(String(100), nullable=False, index=True)
    enabled = Column(Boolean, default=False, nullable=False)
    
    # Feature configuration (JSON-like settings stored as string)
    config = Column(String(2000), nullable=True)  # JSON string for feature-specific config
    
    # Metadata
    description = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    conference = relationship("Conference", backref="feature_flags")
    
    def __repr__(self):
        return f"<FeatureFlag(conference_id={self.conference_id}, feature={self.feature_name}, enabled={self.enabled})>"
