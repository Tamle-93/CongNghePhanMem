"""
Backend/src/infrastructure/models/email_log_model.py
Email Log Model - Track sent emails for idempotency and audit
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from infrastructure.databases.base import Base
import uuid


class EmailLog(Base):
    """
    Email Log Model
    Tracks all emails sent for deduplication and compliance
    """
    __tablename__ = 'email_logs'
    __table_args__ = {'extend_existing': True}
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # Idempotency key to prevent duplicate emails
    idempotency_key = Column(String(100), nullable=False, unique=True, index=True)
    
    # Recipient information
    recipient_email = Column(String(255), nullable=False, index=True)
    
    # Email content
    subject = Column(String(500), nullable=False)
    body = Column(Text, nullable=False)
    
    # Email type/template
    email_type = Column(String(100), nullable=False, index=True)
    # Examples: 'SUBMISSION_CONFIRMATION', 'REVIEW_ASSIGNMENT', 'DECISION_NOTIFICATION', etc.
    
    # Related entity
    related_entity_type = Column(String(50), nullable=True)  # 'Paper', 'Review', 'Decision'
    related_entity_id = Column(Integer, nullable=True)
    
    # User information
    user_id = Column(
        Integer,
        ForeignKey('users.id', ondelete='SET NULL'),
        nullable=True,
        index=True
    )
    
    # Status tracking
    status = Column(String(20), default='pending', nullable=False, index=True)
    # 'pending', 'sent', 'failed', 'bounced'
    
    # Retry information
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    last_error = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    sent_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", backref="email_logs")
    
    @staticmethod
    def generate_idempotency_key(recipient, email_type, entity_type, entity_id):
        """Generate idempotency key to prevent duplicate emails"""
        key_base = f"{recipient}:{email_type}:{entity_type}:{entity_id}"
        # Using a hash for consistent key generation
        import hashlib
        return hashlib.md5(key_base.encode()).hexdigest()
    
    def __repr__(self):
        return f"<EmailLog(id={self.id}, recipient={self.recipient_email}, status={self.status})>"
