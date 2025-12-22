"""
Assignment Model - Phân công bài báo 
"""

from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from infrastructure.databases.base import Base


class AssignmentModel(Base):
    __tablename__ = 'Assignments'
    __table_args__ = {'extend_existing': True}

    # Primary Key
    Id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Foreign keys (logical, chưa cần relationship)
    ConferenceId = Column(UUID(as_uuid=True), nullable=False)
    PaperId = Column(UUID(as_uuid=True), nullable=False)
    ReviewerId = Column(UUID(as_uuid=True), nullable=False)

    # Assignment info
    IsAutoAssigned = Column(Boolean, default=False)
    Status = Column(String(30), default='Assigned')  
    # Assigned / Accepted / Declined / Completed

    # Time
    AssignedAt = Column(DateTime, default=datetime.utcnow)
