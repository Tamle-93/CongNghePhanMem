# File: src/infrastructure/models/user_model.py
"""
Users Model - Người dùng hệ thống
"""

from sqlalchemy import Column, String, Boolean, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from infrastructure.databases.base import Base

class UserRole(enum.Enum):
    """Enum cho vai trò"""
    AUTHOR = "Author"
    REVIEWER = "Reviewer"
    CHAIR = "Chair"
    ADMIN = "Admin"

class UserModel(Base):
    __tablename__ = 'Users'
    __table_args__ = {'extend_existing': True}
    
    # Primary Key
    Id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # User Info
    Username = Column(String(50), unique=True, nullable=False, index=True)
    PasswordHash = Column(String(255), nullable=False)
    FullName = Column(String(100), nullable=False)
    Email = Column(String(255), unique=True, nullable=False, index=True)
    Role = Column(String(20), nullable=False, default='Author')
    
    # Security Data (JSONB)
    SecurityData = Column(JSONB, nullable=True)
    
    # Timestamps
    CreatedDate = Column(DateTime, default=datetime.utcnow, nullable=False)
    UpdatedDate = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    IsDeleted = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    submitted_papers = relationship(
        "PaperModel",
        back_populates="submitter",
        foreign_keys="PaperModel.Submitter_Users_Id"
    )
    
    chaired_conferences = relationship(
        "ConferenceModel",
        back_populates="chair"
    )
    
    assignments = relationship(
        "AssignmentModel",
        back_populates="reviewer"
    )
    
    decisions = relationship(
        "DecisionModel",
        back_populates="chair"
    )
    
    conflicts = relationship(
        "ConflictModel",
        back_populates="reviewer"
    )