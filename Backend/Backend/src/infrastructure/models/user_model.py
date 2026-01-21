# Backend/src/infrastructure/models/user_model.py - VERIFY METHODS
"""
Users Model - Multi-Role Support VERIFIED
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from infrastructure.databases.base import Base

class User(Base):
    __tablename__ = 'users'
    __table_args__ = {'extend_existing': True}
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # User Info
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False, nullable=False)
    
    # ✅ RELATIONSHIPS
    user_roles = relationship(
        "UserRole",
        foreign_keys="UserRole.user_id",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    
    submitted_papers = relationship("Paper", back_populates="submitter", foreign_keys="Paper.submitter_id")
    authored_papers = relationship("PaperAuthor", back_populates="author")
    chaired_conferences = relationship("Conference", back_populates="chair")
    assignments = relationship("Assignment", back_populates="reviewer")
    decisions = relationship("Decision", back_populates="chair")
    
    # ✅ PROPERTY: Get list of role names
    @property
    def roles(self):
        """
        Get list of active role names
        Returns: List[str] - ['Author', 'Reviewer', 'Chair']
        """
        return [ur.role.name for ur in self.user_roles if ur.is_active]
    
    @property
    def global_roles(self):
        """
        Get global roles (not tied to specific conference)
        """
        return [ur.role.name for ur in self.user_roles if ur.is_active and ur.conference_id is None]
    
    def get_roles_in_conference(self, conference_id):
        """
        Get roles in a specific conference
        
        Args:
            conference_id: int
            
        Returns: List[str] - roles in this conference
        """
        roles = []
        for ur in self.user_roles:
            if ur.is_active:
                # Include both global roles and conference-specific roles
                if ur.conference_id is None or ur.conference_id == conference_id:
                    roles.append(ur.role.name)
        return list(set(roles))  # Remove duplicates
    
    def has_role(self, role_name, conference_id=None):
        """
        Check if user has a specific role
        
        Args:
            role_name: str - 'Author', 'Reviewer', 'Chair', 'Admin'
            conference_id: int (optional) - check in specific conference
            
        Returns: bool
        """
        for ur in self.user_roles:
            if ur.is_active and ur.role.name == role_name:
                if conference_id is None:
                    return True  # Global check
                if ur.conference_id is None or ur.conference_id == conference_id:
                    return True
        return False
    
    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', roles={self.roles})>"
