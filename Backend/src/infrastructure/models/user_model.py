# ============================================
# File: Backend/src/infrastructure/models/user_model.py (UPDATED)
# ============================================
"""
Users Model - UPDATED with Multi-Role Support
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
    
    # ❌ KHÔNG CÒN CỘT role nữa - đã chuyển sang bảng user_roles
    # role = Column(String(20), nullable=False, default='Author')  # DEPRECATED
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False, nullable=False)
    
    # ✅ RELATIONSHIPS MỚI
    user_roles = relationship(
        "UserRole",
        foreign_keys="UserRole.user_id",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    
    # Các relationships khác giữ nguyên
    submitted_papers = relationship("Paper", back_populates="submitter", foreign_keys="Paper.submitter_id")
    authored_papers = relationship("PaperAuthor", back_populates="author")
    chaired_conferences = relationship("Conference", back_populates="chair")
    assignments = relationship("Assignment", back_populates="reviewer")
    decisions = relationship("Decision", back_populates="chair")
    
    # ✅ PROPERTY ĐỂ LẤY DANH SÁCH ROLES
    @property
    def roles(self):
        """
        Lấy danh sách tên roles của user (chỉ active roles)
        Returns: List[str] - ['Author', 'Reviewer', 'Chair']
        """
        return [ur.role.name for ur in self.user_roles if ur.is_active]
    
    @property
    def global_roles(self):
        """
        Lấy roles toàn cục (không gắn conference cụ thể)
        """
        return [ur.role.name for ur in self.user_roles if ur.is_active and ur.conference_id is None]
    
    def get_roles_in_conference(self, conference_id):
        """
        Lấy roles của user trong 1 conference cụ thể
        """
        roles = []
        for ur in self.user_roles:
            if ur.is_active:
                # Bao gồm cả global roles và conference-specific roles
                if ur.conference_id is None or ur.conference_id == conference_id:
                    roles.append(ur.role.name)
        return list(set(roles))  # Remove duplicates
    
    def has_role(self, role_name, conference_id=None):
        """
        Kiểm tra user có role cụ thể không
        Args:
            role_name: str - tên role (Author, Reviewer, Chair, Admin)
            conference_id: int (optional) - check trong conference cụ thể
        Returns: bool
        """
        for ur in self.user_roles:
            if ur.is_active and ur.role.name == role_name:
                if conference_id is None:
                    return True  # Check global
                if ur.conference_id is None or ur.conference_id == conference_id:
                    return True
        return False
    
    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', roles={self.roles})>"