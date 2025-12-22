"""
Conflict Model - Conflict of Interest (COI)
"""

from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from infrastructure.databases.base import Base


class ConflictModel(Base):
    __tablename__ = 'Conflicts'
    __table_args__ = {'extend_existing': True}

    # Primary Key
    Id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Conflict info
    ConferenceId = Column(UUID(as_uuid=True), nullable=False)
    PaperId = Column(UUID(as_uuid=True), nullable=False)
    ReviewerId = Column(UUID(as_uuid=True), nullable=False)

    Reason = Column(Text, nullable=True)
    # same institution, advisor, co-author, self-declared, etc.

    CreatedAt = Column(DateTime, default=datetime.utcnow)
