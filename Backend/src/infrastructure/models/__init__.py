"""
Backend/src/infrastructure/models/__init__.py
Export all models - COMPLETE UPDATE
"""

from .user_model import User
from .umcauthres_model import UMCAuthRES
from .conference_model import Conference
from .conference_mentor_model import ConferenceMentor
from .track_model import Track
from .paper_model import Paper, PaperStatus
from .paper_author_model import PaperAuthor
from .assignment_model import Assignment
from .review_model import Review
from .brow_history_model import BrowHistory
from .decision_model import Decision
from .conflict_of_interest_model import ConflictOfInterest
from .audit_log_ai_model import AuditLogAI

__all__ = [
    'User',
    'UMCAuthRES',
    'Conference',
    'ConferenceMentor',
    'Track',
    'Paper',
    'PaperStatus',
    'PaperAuthor',
    'Assignment',
    'Review',
    'BrowHistory',
    'Decision',
    'ConflictOfInterest',
    'AuditLogAI',
]