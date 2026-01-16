# Module: __init__.py
# Created automatically for UTH-ConfMS
# Backend/src/api/controllers/__init__.py - 
"""
Controllers Package - ALL CONTROLLERS EXPORTED
"""
from .auth_controller import auth_bp
from .papers_controller import papers_bp
from .assignments_controller import assignments_bp
from .conferences_controller import conferences_bp
from .reviews_controller import reviews_bp
from .decisions_controller import decisions_bp
from .users_controller import users_bp
from .admin_controller import admin_bp 

__all__ = [
    'auth_bp',
    'papers_bp',
    'assignments_bp',
    'conferences_bp',
    'reviews_bp',
    'decisions_bp',
    'users_bp',
    'admin_bp'  # ← ADDED
]