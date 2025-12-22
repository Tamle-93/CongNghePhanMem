from datetime import datetime
import enum

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    Enum,
    Boolean
)
from sqlalchemy.orm import relationship
from database import Base
class PaperStatus(enum.Enum):
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"
    CAMERA_READY = "camera_ready"
class Paper(Base):
    """
    Scientific paper submitted to a conference
    """

    __tablename__ = "papers"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(500), nullable=False)
    abstract = Column(Text, nullable=False)
    keywords = Column(String(255))

    pdf_path = Column(String(500), nullable=False)
    camera_ready_path = Column(String(500))

    status = Column(
        Enum(PaperStatus),
        default=PaperStatus.SUBMITTED,
        nullable=False
    )

    is_withdrawn = Column(Boolean, default=False)

    submitter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    conference_id = Column(Integer, ForeignKey("conferences.id"), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    # Relationships
    submitter = relationship("User", back_populates="submitted_papers")
    conference = relationship("Conference", back_populates="papers")
    reviews = relationship(
        "Review",
        back_populates="paper",
        cascade="all, delete-orphan"
    )
    authors = relationship(
        "PaperAuthor",
        back_populates="paper",
        cascade="all, delete-orphan"
    )
