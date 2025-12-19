from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
# from database import Base 

class Track:
    __tablename__ = "tracks"

    id = Column(Integer, primary_key=True, index=True)
    conference_id = Column(Integer, ForeignKey("conferences.id"), nullable=False)
    
    name = Column(String(100), nullable=False)
    code = Column(String(20), nullable=True) # Ví dụ: AI, SE, CS
    description = Column(Text, nullable=True)
    
    # Quan hệ ngược lại với Conference
    conference = relationship("Conference", back_populates="tracks")
