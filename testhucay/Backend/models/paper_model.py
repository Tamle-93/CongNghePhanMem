from datetime import datetime
import enum
from sqlalchemy import (
    Column, Integer, String, Text, DateTime,
    ForeignKey, Enum, Boolean
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


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    role = Column(String(50), nullable=False)

    papers = relationship("Paper", back_populates="submitter")
    reviews = relationship("Review", back_populates="reviewer")


class Conference(Base):
    __tablename__ = "conferences"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)

    papers = relationship("Paper", back_populates="conference")


class Paper(Base):
    __tablename__ = "papers"

    id = Column(Integer, primary_key=True)
    title = Column(String(500), nullable=False)
    abstract = Column(Text, nullable=False)
    keywords = Column(String(255))
    pdf_path = Column(String(500), nullable=False)

    status = Column(Enum(PaperStatus), default=PaperStatus.SUBMITTED)

    submitter_id = Column(Integer, ForeignKey("users.id"))
    conference_id = Column(Integer, ForeignKey("conferences.id"))

    created_at = Column(DateTime, default=datetime.utcnow)

    submitter = relationship("User", back_populates="papers")
    conference = relationship("Conference", back_populates="papers")
    reviews = relationship("Review", back_populates="paper")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True)
    score = Column(Integer, nullable=False)
    comment = Column(Text)

    reviewer_id = Column(Integer, ForeignKey("users.id"))
    paper_id = Column(Integer, ForeignKey("papers.id"))

    reviewer = relationship("User", back_populates="reviews")
    paper = relationship("Paper", back_populates="reviews")

