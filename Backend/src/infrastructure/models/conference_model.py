# Backend/src/infrastructure/models/conference_model.py
"""
Conference Model - Hội nghị khoa học
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from infrastructure.databases.base import Base

class Conference(Base):
    """
    Conference - Hội nghị khoa học
    
    Attributes:
        - Basic Info: name, description, location
        - Deadlines: submission, review, decision, camera_ready, registration
        - Settings: blind_review_type, max_reviewers_per_paper
        - Status: is_active, is_deleted
    """
    __tablename__ = 'conferences'
    __table_args__ = {'extend_existing': True}
    
    # Primary Key
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Basic Information
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)  # Physical or Virtual location
    website_url = Column(String(500), nullable=True)
    
    # ⭐ DEADLINES - TẤT CẢ GIAI ĐOẠN
    submission_deadline = Column(
        DateTime, 
        nullable=False,
        comment="Hạn nộp bài (Paper Submission Deadline)"
    )
    
    review_deadline = Column(
        DateTime, 
        nullable=False,
        comment="Hạn phản biện (Review Deadline)"
    )
    
    decision_deadline = Column(
        DateTime, 
        nullable=True,
        comment="Hạn ra quyết định (Decision Deadline)"
    )
    
    camera_ready_deadline = Column(
        DateTime, 
        nullable=True,
        comment="Hạn nộp bản hoàn chỉnh (Camera-Ready Deadline)"
    )
    
    registration_deadline = Column(
        DateTime, 
        nullable=True,
        comment="Hạn đăng ký tham dự (Registration Deadline)"
    )
    
    conference_start_date = Column(
        DateTime, 
        nullable=True,
        comment="Ngày bắt đầu hội nghị"
    )
    
    conference_end_date = Column(
        DateTime, 
        nullable=True,
        comment="Ngày kết thúc hội nghị"
    )
    
    # Review Settings
    blind_review_type = Column(
        String(20), 
        default='double-blind',
        nullable=False,
        comment="single-blind, double-blind, or open"
    )
    
    max_reviewers_per_paper = Column(
        Integer, 
        default=3,
        nullable=False,
        comment="Số lượng reviewers tối đa cho mỗi bài"
    )
    
    min_reviewers_per_paper = Column(
        Integer, 
        default=2,
        nullable=False,
        comment="Số lượng reviewers tối thiểu cho mỗi bài"
    )
    
    # Chair (Person in charge)
    chair_id = Column(
        Integer, 
        ForeignKey('users.id', ondelete='SET NULL'),
        nullable=True,
        index=True
    )
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    chair = relationship("User", foreign_keys=[chair_id])
    tracks = relationship("Track", back_populates="conference", cascade="all, delete-orphan")
    papers = relationship("Paper", back_populates="conference")
    
    def __repr__(self):
        return f"<Conference(id={self.id}, name='{self.name}')>"
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'location': self.location,
            'website_url': self.website_url,
            
            # Deadlines
            'submission_deadline': self.submission_deadline.isoformat() if self.submission_deadline else None,
            'review_deadline': self.review_deadline.isoformat() if self.review_deadline else None,
            'decision_deadline': self.decision_deadline.isoformat() if self.decision_deadline else None,
            'camera_ready_deadline': self.camera_ready_deadline.isoformat() if self.camera_ready_deadline else None,
            'registration_deadline': self.registration_deadline.isoformat() if self.registration_deadline else None,
            'conference_start_date': self.conference_start_date.isoformat() if self.conference_start_date else None,
            'conference_end_date': self.conference_end_date.isoformat() if self.conference_end_date else None,
            
            # Settings
            'blind_review_type': self.blind_review_type,
            'max_reviewers_per_paper': self.max_reviewers_per_paper,
            'min_reviewers_per_paper': self.min_reviewers_per_paper,
            
            # Chair
            'chair_id': self.chair_id,
            'chair_name': self.chair.full_name if self.chair else None,
            
            # Status
            'is_active': self.is_active,
            'is_deleted': self.is_deleted,
            
            # Timestamps
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
    
    @property
    def is_submission_open(self):
        """Check if submission is still open"""
        return datetime.utcnow() < self.submission_deadline
    
    @property
    def is_review_phase(self):
        """Check if in review phase"""
        now = datetime.utcnow()
        return self.submission_deadline <= now < self.review_deadline
    
    @property
    def is_decision_phase(self):
        """Check if in decision phase"""
        if not self.decision_deadline:
            return False
        now = datetime.utcnow()
        return self.review_deadline <= now < self.decision_deadline
    
    @property
    def status_text(self):
        """Get current conference status as text"""
        now = datetime.utcnow()
        
        if self.is_deleted:
            return "Deleted"
        
        if not self.is_active:
            return "Inactive"
        
        if now < self.submission_deadline:
            return "Accepting Submissions"
        
        if now < self.review_deadline:
            return "Under Review"
        
        if self.decision_deadline and now < self.decision_deadline:
            return "Decision Phase"
        
        if self.camera_ready_deadline and now < self.camera_ready_deadline:
            return "Camera-Ready Phase"
        
        if self.conference_start_date and now < self.conference_start_date:
            return "Upcoming"
        
        if self.conference_end_date and now < self.conference_end_date:
            return "In Progress"
        
        return "Completed"