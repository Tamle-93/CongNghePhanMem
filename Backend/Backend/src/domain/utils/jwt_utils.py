# Backend/src/domain/utils/jwt_utils.py
"""
JWT Token Utilities
"""
import jwt
from datetime import datetime, timedelta
from flask import current_app

def generate_token(user_id, expires_in=24):
    """
    Generate JWT token for user
    
    Args:
        user_id: int - User ID
        expires_in: int - Token expiration in hours (default 24h)
    
    Returns:
        str - JWT token
    """
    try:
        payload = {
            'user_id': user_id,
            'iat': datetime.utcnow(),  # Issued at
            'exp': datetime.utcnow() + timedelta(hours=expires_in)  # Expiration
        }
        
        # Get secret key from app config
        secret_key = current_app.config.get('SECRET_KEY', 'your-secret-key-change-this')
        
        token = jwt.encode(
            payload,
            secret_key,
            algorithm='HS256'
        )
        
        return token
        
    except Exception as e:
        raise Exception(f"Token generation failed: {str(e)}")


def decode_token(token):
    """
    Decode and validate JWT token
    
    Args:
        token: str - JWT token
    
    Returns:
        dict - Decoded payload with user_id
        None if invalid/expired
    """
    try:
        secret_key = current_app.config.get('SECRET_KEY', 'your-secret-key-change-this')
        
        payload = jwt.decode(
            token,
            secret_key,
            algorithms=['HS256']
        )
        
        return payload
        
    except jwt.ExpiredSignatureError:
        return None  # Token expired
    except jwt.InvalidTokenError:
        return None  # Invalid token
    except Exception as e:
        return None


def verify_token(token):
    """
    Verify token and return user_id
    
    Args:
        token: str - JWT token
    
    Returns:
        int - user_id if valid
        None if invalid
    """
    payload = decode_token(token)
    
    if payload and 'user_id' in payload:
        return payload['user_id']
    
    return None


def refresh_token(old_token, expires_in=24):
    """
    Refresh an existing token
    
    Args:
        old_token: str - Existing JWT token
        expires_in: int - New token expiration in hours
    
    Returns:
        str - New JWT token
        None if old token invalid
    """
    user_id = verify_token(old_token)
    
    if user_id:
        return generate_token(user_id, expires_in)
    
    return None