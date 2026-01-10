# ============================================
# File: Backend/src/api/v1/auth.py
# ============================================
"""
Authentication API Routes
"""

from flask import Blueprint, request, jsonify
from domain.services.auth_service import AuthService
from domain.schemas.user_schema import (
    UserRegistrationSchema,
    UserLoginSchema,
    UserResponseSchema
)
from domain.utils.auth_utils import require_auth
from marshmallow import ValidationError


auth_bp = Blueprint('auth', __name__, url_prefix='/auth') 
# Schemas
registration_schema = UserRegistrationSchema()
login_schema = UserLoginSchema()
user_response_schema = UserResponseSchema()


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new user
    ---
    Request Body:
        {
            "username": "author01",
            "password": "SecurePass123",
            "email": "author@uth.edu.vn",
            "full_name": "Nguyen Van A",
            "role": "Author"  // Optional: Author, Reviewer, Chair, Admin
        }
    
    Response:
        {
            "status": "success",
            "message": "User registered successfully",
            "data": {
                "user": {...},
                "token": "jwt_token_here"
            }
        }
    """
    try:
        # Validate input
        data = registration_schema.load(request.json)
        
        # Register user
        user, token_or_error = AuthService.register_user(
            username=data['username'],
            password=data['password'],
            email=data['email'],
            full_name=data['full_name'],
            role=data.get('role', 'Author')
        )
        
        if user is None:
            return jsonify({
                'status': 'error',
                'message': token_or_error
            }), 400
        
        return jsonify({
            'status': 'success',
            'message': 'User registered successfully',
            'data': {
                'user': user_response_schema.dump(user),
                'token': token_or_error
            }
        }), 201
        
    except ValidationError as e:
        return jsonify({
            'status': 'error',
            'message': 'Validation error',
            'errors': e.messages
        }), 400
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login user
    ---
    Request Body:
        {
            "username": "author01",
            "password": "SecurePass123"
        }
    
    Response:
        {
            "status": "success",
            "data": {
                "user": {...},
                "token": "jwt_token_here"
            }
        }
    """
    try:
        # Validate input
        data = login_schema.load(request.json)
        
        # Login user
        user, token_or_error = AuthService.login_user(
            username=data['username'],
            password=data['password']
        )
        
        if user is None:
            return jsonify({
                'status': 'error',
                'message': token_or_error
            }), 401
        
        return jsonify({
            'status': 'success',
            'message': 'Login successful',
            'data': {
                'user': user_response_schema.dump(user),
                'token': token_or_error
            }
        }), 200
        
    except ValidationError as e:
        return jsonify({
            'status': 'error',
            'message': 'Validation error',
            'errors': e.messages
        }), 400
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@auth_bp.route('/me', methods=['GET'])
@require_auth
def get_current_user():
    """
    Get current authenticated user
    ---
    Headers:
        Authorization: Bearer <token>
    
    Response:
        {
            "status": "success",
            "data": {
                "user": {...}
            }
        }
    """
    try:
        user_id = request.current_user['user_id']
        
        user, error = AuthService.get_user_by_id(user_id)
        
        if error:
            return jsonify({
                'status': 'error',
                'message': error
            }), 404
        
        return jsonify({
            'status': 'success',
            'data': {
                'user': user_response_schema.dump(user)
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@auth_bp.route('/logout', methods=['POST'])
@require_auth
def logout():
    """
    Logout user (client should delete token)
    ---
    Response:
        {
            "status": "success",
            "message": "Logged out successfully"
        }
    """
    # In JWT, logout is handled client-side by deleting the token
    # Optionally, you can implement token blacklisting here
    
    return jsonify({
        'status': 'success',
        'message': 'Logged out successfully'
    }), 200

