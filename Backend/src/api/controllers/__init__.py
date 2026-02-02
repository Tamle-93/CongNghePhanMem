# src/api/controllers/__init__.py - COMPLETE

# Core Controllers
from .auth_controller import auth_bp
from .papers_controller import papers_bp
from .assignments_controller import assignments_bp
from .conferences_controller import conferences_bp
from .reviews_controller import reviews_bp
from .decisions_controller import decisions_bp
from .users_controller import users_bp
from .admin_controller import admin_bp

# Additional Controllers
from .coi_controller import coi_bp
from .audit_controller import audit_bp
from .feature_flags_controller import feature_flags_bp
from .reports_controller import reports_bp
from .ai_controller import ai_bp
from .notifications_controller import notifications_bp
from .tracks_controller import tracks_bp

__all__ = [
    # Core
    'auth_bp',
    'papers_bp',
    'assignments_bp',
    'conferences_bp',
    'reviews_bp',
    'decisions_bp',
    'users_bp',
    'admin_bp',
    # Additional
    'coi_bp',
    'audit_bp',
    'feature_flags_bp',
    'reports_bp',
    'ai_bp',
    'notifications_bp',
    'tracks_bp'
]