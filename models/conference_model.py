 from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
# Giả sử bạn có file database.py để khai báo Base
# from database import Base 

class Conference:
    __tablename__ = "conferences"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    short_name = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    
    # Các mốc thời gian dựa trên sơ đồ
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    submission_deadline = Column(DateTime, nullable=False)
    review_deadline = Column(DateTime, nullable=False)
    decision_date = Column(DateTime, nullable=True)
    camera_ready_deadline = Column(DateTime, nullable=True)
    
    # Cấu hình bảo mật và AI (theo yêu cầu phi chức năng)
    is_double_blind = Column(Boolean, default=True)
    allow_ai_synopsis = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Quan hệ với các Track
    tracks = relationship("Track", back_populates="conference")
  
