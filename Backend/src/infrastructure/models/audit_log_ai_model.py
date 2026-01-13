"""
Backend/src/infrastructure/models/audit_log_ai_model.py
Audit Log AI Model - Track system activities
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from infrastructure.databases.base import Base


class AuditLogAI(Base):
    """
    Enhanced Audit Log with AI context
    Tracks all important system activities
    """
    
    __tablename__ = 'audit_log_ai'
    __table_args__ = {'extend_existing': True}
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # Who performed the action
    action_user_id = Column(
        Integer, 
        ForeignKey('users.id', ondelete='SET NULL'),
        nullable=True  # Can be NULL for system actions
    )
    
    # What action was performed
    action_type = Column(String(100), nullable=False, index=True)
    # Examples: 'user_login', 'paper_submitted', 'review_submitted', 
    #           'assignment_created', 'decision_made'
    
    # Which table/entity was affected
    table_name = Column(String(50), nullable=False)
    
    # Which specific record
    record_id = Column(Integer, nullable=True)
    
    # Additional data (JSON format)
    data = Column(Text, nullable=True)
    
    # When it happened
    timestamp = Column(
        DateTime, 
        default=datetime.utcnow, 
        nullable=False, 
        index=True
    )
    
    # Relationship
    user = relationship("User", backref="ai_audit_logs")
    
    def __repr__(self):
        return f"<AuditLogAI(id={self.id}, action='{self.action_type}', table='{self.table_name}')>"
    
    @classmethod
    def log(cls, db_session, user_id, action_type, table_name, 
            record_id=None, data=None):
        """
        Helper method to create audit log entry
        
        Usage:
            AuditLogAI.log(
                db_session=db,
                user_id=current_user.id,
                action_type='paper_submitted',
                table_name='papers',
                record_id=paper.id,
                data=json.dumps({"title": paper.title})
            )
        """
        log_entry = cls(
            action_user_id=user_id,
            action_type=action_type,
            table_name=table_name,
            record_id=record_id,
            data=data
        )
        db_session.add(log_entry)
        db_session.commit()
        return log_entry