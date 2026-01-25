"""
Backend/src/infrastructure/models/refresh_token_model.py
Refresh Token Model - For JWT token refresh capability
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
from infrastructure.databases.base import Base
import secrets


class RefreshToken(Base):
    """
    Refresh Token Model
    Stores refresh tokens for JWT token renewal without full re-login
    """
    __tablename__ = 'refresh_tokens'
    __table_args__ = {'extend_existing': True}
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign Keys
    user_id = Column(
        Integer,
        ForeignKey('users.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    
    # Token storage (should be hashed in production)
    token = Column(String(500), nullable=False, unique=True, index=True)
    token_hash = Column(String(500), nullable=True)  # SHA256 hash of token
    
    # Token status
    is_revoked = Column(Boolean, default=False, nullable=False)
    
    # Expiration
    expires_at = Column(DateTime, nullable=False)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    ip_address = Column(String(50), nullable=True)  # IP where token was created
    user_agent = Column(String(500), nullable=True)  # Browser/client info
    
    # Relationships
    user = relationship("User", backref="refresh_tokens")
    
    @staticmethod
    def generate_token():
        """Generate a secure random refresh token"""
        return secrets.token_urlsafe(32)
    
    def is_valid(self):
        """Check if token is still valid"""
        return not self.is_revoked and datetime.utcnow() < self.expires_at
    
    def __repr__(self):
        return f"<RefreshToken(user_id={self.user_id}, expires_at={self.expires_at})>"
