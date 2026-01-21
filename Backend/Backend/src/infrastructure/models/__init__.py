"""
Backend/src/infrastructure/models/__init__.py
Export all models - COMPLETE FIXED VERSION
"""

# ========== CORE MODELS ==========
from .user_model import User
from .role_model import Role
from .user_role_model import UserRole

# ========== CONFERENCE & PAPERS ==========
from .conference_model import Conference
from .conference_mentor_model import ConferenceMentor
from .track_model import Track
from .paper_model import Paper, PaperStatus
from .paper_author_model import PaperAuthor

# ========== REVIEW PROCESS ==========
from .assignment_model import Assignment
from .review_model import Review
from .decision_model import Decision
from .conflict_of_interest_model import ConflictOfInterest

# ========== SYSTEM ==========
from .brow_history_model import BrowHistory
from .audit_log_ai_model import AuditLogAI
from .umcauthres_model import UMCAuthRES

__all__ = [
    # Core
    'User',
    'Role',
    'UserRole',
    
    # Conference & Papers
    'Conference',
    'ConferenceMentor',
    'Track',
    'Paper',
    'PaperStatus',
    'PaperAuthor',
    
    # Review Process
    'Assignment',
    'Review',
    'Decision',
    'ConflictOfInterest',
    
    # System
    'BrowHistory',
    'AuditLogAI',
    'UMCAuthRES',
]