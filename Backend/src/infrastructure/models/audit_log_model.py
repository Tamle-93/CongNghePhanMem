from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from src.infrastructure.databases.base import Base

class AuditLog(Base):
    __tablename__ = 'audit_logs_ai'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    action_user_id = Column(Integer, ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    action_type = Column(String(100), nullable=False)
    input_hash = Column(String(500), nullable=True)
    model_version = Column(String(50), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    note = Column(String(255), nullable=True)

    action_user = relationship("User")