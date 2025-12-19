from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from database import Base


class Paper(Base):
    __tablename__ = "papers"

    id = Column(Integer, primary_key=True, index=True)

    # Metadata
    title = Column(String(255), nullable=False)
    abstract = Column(Text, nullable=False)

    # File
    pdf_path = Column(String(500), nullable=False)

    # Status
    status = Column(String(50), default="submitted", nullable=False)

    # Foreign keys
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    conference_id = Column(Integer, ForeignKey("conferences.id"), nullable=False)

    # Time
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )
  
    # Relationships
    author = relationship("User", back_populates="papers")
    conference = relationship("Conference", back_populates="papers")
    reviews = relationship(
        "Review",
        back_populates="paper",
        cascade="all, delete-orphan"
    )
    decision = relationship(
        "Decision",
        back_populates="paper",
        uselist=False
    )

    def __repr__(self):
        return f"<Paper id={self.id} title='{self.title}' status='{self.status}'>"
