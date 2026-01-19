# ============================================
# File: Backend/src/infrastructure/models/user_role_model.py
# ============================================
"""
UserRole Model - Quan hệ User-Role (Many-to-Many)
"""
from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from infrastructure.databases.base import Base

class UserRole(Base):
    """
    Bảng trung gian lưu quan hệ User - Role
    Hỗ trợ role theo conference (user có thể có role khác nhau ở mỗi conference)
    
    Examples:
        - User A là Author globally (conference_id = NULL)
        - User A là Chair của Conference 1 (conference_id = 1)
        - User A là Reviewer của Conference 2 (conference_id = 2)
    """
    __tablename__ = 'user_roles'
    __table_args__ = (
        
        UniqueConstraint('user_id', 'role_id', 'conference_id', name='uq_user_role_conference'),
        {'extend_existing': True}
    )
    
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Foreign Keys
    user_id = Column(
        Integer,
        ForeignKey('users.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    role_id = Column(
        Integer,
        ForeignKey('roles.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    conference_id = Column(
        Integer,
        ForeignKey('conferences.id', ondelete='CASCADE'),
        nullable=True,  
        default=None,
        index=True
    )
    
    # Additional Info
    is_active = Column(Boolean, default=True, nullable=False)
    assigned_by = Column(
        Integer,
        ForeignKey('users.id', ondelete='SET NULL'),
        nullable=True
    )
    assigned_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="user_roles")
    role = relationship("Role", lazy='joined')
    conference = relationship("Conference", lazy='joined')
    assigner = relationship("User", foreign_keys=[assigned_by])
    
    def __repr__(self):
        conf_str = f"conf={self.conference_id}" if self.conference_id else "global"
        role_name = self.role.name if self.role else 'N/A'
        return f"<UserRole(user={self.user_id}, role={role_name}, {conf_str})>"
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'role_id': self.role_id,
            'role_name': self.role.name if self.role else None,
            'conference_id': self.conference_id,
            'conference_name': self.conference.name if self.conference else None,
            'is_active': self.is_active,
            'assigned_at': self.assigned_at.isoformat() if self.assigned_at else None
        }