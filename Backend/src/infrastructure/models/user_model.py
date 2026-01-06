# File: src/infrastructure/models/user_model.py
"""
Users Model - Người dùng hệ thống (standardized)
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
    role = Column(String(20), nullable=False, default='Author')

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False, nullable=False)

    # Relationships
    submitted_papers = relationship(
        "Paper",
        back_populates="submitter",
        foreign_keys="Paper.submitter_id"
    )

    authored_papers = relationship(
        "PaperAuthor",
        back_populates="author"
    )

    chaired_conferences = relationship(
        "Conference",
        back_populates="chair"
    )

    assignments = relationship(
        "Assignment",
        back_populates="reviewer"
    )

    decisions = relationship(
        "Decision",
        back_populates="chair"
    )

    conflicts = relationship(
        "ConflictOfInterest",
        back_populates="reviewer"
    )