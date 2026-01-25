"""
Backend/src/infrastructure/models/submission_version_model.py
Submission Version Model - Track version history of submitted papers
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from infrastructure.databases.base import Base


class SubmissionVersion(Base):
    """
    Submission Version Model
    Tracks all versions of paper submissions for audit trail
    """
    __tablename__ = 'submission_versions'
    __table_args__ = {'extend_existing': True}
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign Keys
    paper_id = Column(
        Integer,
        ForeignKey('papers.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    
    # Version tracking
    version = Column(Integer, nullable=False, default=1, index=True)
    
    # File storage
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=True)  # Size in bytes
    
    # Metadata
    title = Column(String(500), nullable=True)
    abstract = Column(Text, nullable=True)
    keywords = Column(String(500), nullable=True)
    
    # Change notes
    change_notes = Column(Text, nullable=True)  # What changed in this version
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=True)  # Who uploaded this version
    
    # Relationships
    paper = relationship("Paper", backref="versions")
    creator = relationship("User", backref="submitted_versions", foreign_keys=[created_by])
    
    def __repr__(self):
        return f"<SubmissionVersion(id={self.id}, paper_id={self.paper_id}, version={self.version})>"
