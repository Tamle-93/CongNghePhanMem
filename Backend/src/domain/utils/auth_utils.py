# Backend/src/domain/utils/auth_utils.py - FIXED
"""
Authentication Utilities - UPDATED for Multi-Role Support
"""
import bcrypt
import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify
from config import get_config

config = get_config()

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def generate_token(user_id: int, roles: list, expires_in_hours: int = 24) -> str:
    """
    Generate JWT token with user_id and roles list
    
    Args:
        user_id: int
        roles: list of str - ['Author', 'Reviewer', 'Chair']
        expires_in_hours: int
        
    Returns: JWT token string
    """
    # ✅ Ensure roles is a list
    if not isinstance(roles, list):
        roles = [roles] if roles else ['Author']
    
    payload = {
        'user_id': user_id,
        'roles': roles,  # ✅ Array of roles
        'exp': datetime.utcnow() + timedelta(hours=expires_in_hours),
        'iat': datetime.utcnow()
    }
    
    return jwt.encode(payload, config.JWT_SECRET_KEY, algorithm='HS256')

def decode_token(token: str) -> dict:
    """Decode JWT token"""
    try:
        return jwt.decode(token, config.JWT_SECRET_KEY, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid token")

def require_auth(f):
    """
    Middleware: Check if user is authenticated
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        # Debug logging
        print(f"\n[AUTH] Request headers: {dict(request.headers)}")
        print(f"[AUTH] Authorization header: {token}")
        
        if not token:
            print("[AUTH] ❌ NO TOKEN PROVIDED - returning 401")
            return jsonify({'status': 'error', 'message': 'No token provided'}), 401
        
        if token.startswith('Bearer '):
            token = token[7:]
        
        try:
            payload = decode_token(token)
            request.current_user = payload
            print(f"[AUTH] ✅ Token decoded successfully for user {payload.get('user_id')}")
        except ValueError as e:
            print(f"[AUTH] ❌ Token decode error: {str(e)}")
            return jsonify({'status': 'error', 'message': str(e)}), 401
        
        return f(*args, **kwargs)
    
    return decorated_function

def require_role(*allowed_roles):
    """
    Middleware: Check if user has at least one of the required roles
    
    Usage:
        @require_role('Author', 'Chair')  # Allow Author OR Chair
        def submit_paper():
            pass
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not hasattr(request, 'current_user'):
                return jsonify({
                    'status': 'error', 
                    'message': 'Authentication required'
                }), 401
            
            # ✅ Get roles from token (now an array)
            user_roles = request.current_user.get('roles', [])
            
            # ✅ Ensure it's a list
            if not isinstance(user_roles, list):
                user_roles = [user_roles] if user_roles else []
            
            # ✅ Check if user has at least one matching role
            if not any(role in allowed_roles for role in user_roles):
                return jsonify({
                    'status': 'error',
                    'message': 'Insufficient permissions',
                    'required_roles': list(allowed_roles),
                    'your_roles': user_roles
                }), 403
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator

def require_conference_role(*allowed_roles):
    """
    Middleware: Check if user has role in specific conference
    
    Expects conference_id in route params
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not hasattr(request, 'current_user'):
                return jsonify({
                    'status': 'error', 
                    'message': 'Authentication required'
                }), 401
            
            # Get conference_id from kwargs or request args
            conference_id = kwargs.get('conference_id') or request.args.get('conference_id')
            
            if not conference_id:
                return jsonify({
                    'status': 'error', 
                    'message': 'conference_id is required'
                }), 400
            
            # Query DB to check user roles in this conference
            from infrastructure.databases.base import SessionLocal
            from infrastructure.models import User
            
            db = SessionLocal()
            try:
                user = db.query(User).filter(User.id == request.current_user['user_id']).first()
                if not user:
                    return jsonify({'status': 'error', 'message': 'User not found'}), 404
                
                # Check roles in conference
                user_roles_in_conf = user.get_roles_in_conference(int(conference_id))
                
                if not any(role in allowed_roles for role in user_roles_in_conf):
                    return jsonify({
                        'status': 'error',
                        'message': 'Insufficient permissions in this conference',
                        'required_roles': list(allowed_roles),
                        'your_roles_in_conference': user_roles_in_conf
                    }), 403
                
                return f(*args, **kwargs)
            finally:
                db.close()
        
        return decorated_function
    return decorator

def has_role(user_id: int, role_name: str, conference_id=None) -> bool:
    """
    Helper function: Check if user has specific role
    
    Args:
        user_id: int
        role_name: str - 'Author', 'Reviewer', 'Chair', 'Admin'
        conference_id: int (optional) - check in specific conference
        
    Returns: bool
    """
    from infrastructure.databases.base import SessionLocal
    from infrastructure.models import User
    
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return False
        return user.has_role(role_name, conference_id)
    finally:
        db.close()
