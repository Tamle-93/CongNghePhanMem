"""
Backend/src/infrastructure/models/audit_utils.py
Utility methods for audit logging
"""

from infrastructure.models.audit_log_model import AuditLog
from datetime import datetime


class AuditLogger:
    """Utility class for audit logging throughout the system"""
    
    @staticmethod
    def log_action(db_session, user_id, action, entity_type, entity_id, 
                   changes=None, status='success', error_message=None, 
                   ip_address=None, user_agent=None, description=None):
        """
        Log an action to the audit log
        
        Args:
            db_session: Database session
            user_id: User performing the action
            action: Action name (e.g., 'PAPER_SUBMITTED', 'REVIEW_SUBMITTED')
            entity_type: Type of entity affected (e.g., 'Paper', 'Review')
            entity_id: ID of the entity
            changes: Dictionary of changes made
            status: 'success' or 'failure'
            error_message: Error message if action failed
            ip_address: IP address of the request
            user_agent: User agent string
            description: Additional description
        """
        try:
            audit_log = AuditLog(
                user_id=user_id,
                action=action,
                entity_type=entity_type,
                entity_id=entity_id,
                changes=changes,
                status=status,
                error_message=error_message,
                ip_address=ip_address,
                user_agent=user_agent,
                description=description,
                timestamp=datetime.utcnow()
            )
            db_session.add(audit_log)
            db_session.commit()
            return True
        except Exception as e:
            print(f"Failed to log audit: {str(e)}")
            return False


# Monkey-patch AuditLog class with log_action static method
AuditLog.log_action = staticmethod(AuditLogger.log_action)
