"""Role Model"""
from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from infrastructure.databases.base import Base

class Role(Base):
    __tablename__ = 'roles'
    __table_args__ = {'extend_existing': True}
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(20), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<Role(id={self.id}, name='{self.name}')>"