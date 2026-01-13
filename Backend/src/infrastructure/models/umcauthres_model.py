# ============================================
# File: Backend/src/infrastructure/models/umcauthres_model.py
# ============================================
"""
UMC Authentication Resources Model
"""

from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime

from infrastructure.databases.base import Base


class UMCAuthRES(Base):
    __tablename__ = 'la_umcauthres'
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    paper_id = Column(String(255), nullable=True)
    sender_domain_id = Column(String(255), nullable=True)
    content = Column(Text, nullable=True)
    upload_cache_uid = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    foreign_key = Column(String(255), nullable=True)
    
    def __repr__(self):
        return f"<UMCAuthRES(id={self.id}, paper_id='{self.paper_id}')>"