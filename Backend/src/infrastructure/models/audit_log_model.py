"""
Backend/src/infrastructure/models/audit_log_model.py
Comprehensive Audit Log Model - Track all system activities
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from infrastructure.databases.base import Base


class AuditLog(Base):
    """
    Comprehensive Audit Log Model
    Tracks user actions, entity changes, timestamps for compliance and audit trail
    """
    __tablename__ = 'audit_logs'
    __table_args__ = {'extend_existing': True}
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # User information
    user_id = Column(
        Integer,
        ForeignKey('users.id', ondelete='SET NULL'),
        nullable=True,
        index=True
    )
    
    # Action details
    action = Column(String(100), nullable=False, index=True)
    # Examples: 'PAPER_SUBMITTED', 'PAPER_WITHDRAWN', 'REVIEW_SUBMITTED', 
    #           'DECISION_MADE', 'ASSIGNMENT_CREATED', 'USER_REGISTERED', 'LOGIN'
    
    # Entity information
    entity_type = Column(String(50), nullable=False, index=True)
    # Examples: 'Paper', 'Review', 'Decision', 'Assignment', 'User', 'Conference'
    
    entity_id = Column(Integer, nullable=True, index=True)
    
    # Detailed changes (JSON)
    changes = Column(JSON, nullable=True)
    # Example: {"status": {"from": "draft", "to": "submitted"}, "title": "New Title"}
    
    # Status
    status = Column(String(20), nullable=True)  # 'success', 'failure', etc.
    
    # Error information if action failed
    error_message = Column(Text, nullable=True)
    
    # Network information
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(500), nullable=True)
    
    # Timestamps
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Additional context
    description = Column(Text, nullable=True)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], viewonly=True)
    
    def __repr__(self):
        return f"<AuditLog(id={self.id}, action={self.action}, user_id={self.user_id}, entity={self.entity_type}:{self.entity_id})>"
