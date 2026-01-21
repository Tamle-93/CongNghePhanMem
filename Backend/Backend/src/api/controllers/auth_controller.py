"""
Backend/src/api/controllers/auth_controller.py
Authentication API Routes - WITH SWAGGER DOCS
"""
from flask import Blueprint, request, jsonify
from flasgger import swag_from
from domain.services.auth_service import AuthService
from domain.schemas.user_schema import (
    UserRegistrationSchema,
    UserLoginSchema,
    UserResponseSchema
)
from domain.utils.auth_utils import require_auth
from marshmallow import ValidationError

auth_bp = Blueprint('auth', __name__)

registration_schema = UserRegistrationSchema()
login_schema = UserLoginSchema()
user_response_schema = UserResponseSchema()

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new user
    ---
    tags:
      - Authentication
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - username
            - password
            - email
            - full_name
          properties:
            username:
              type: string
              example: "author01"
            password:
              type: string
              example: "Author@123"
            email:
              type: string
              example: "author@uth.edu.vn"
            full_name:
              type: string
              example: "Nguyen Van A"
            roles:
              type: array
              items:
                type: string
              example: ["Author"]
    responses:
      201:
        description: User registered successfully
        schema:
          type: object
          properties:
            status:
              type: string
              example: "success"
            message:
              type: string
              example: "User registered successfully"
            data:
              type: object
              properties:
                user:
                  type: object
                token:
                  type: string
      400:
        description: Validation error
    """
    try:
        data = registration_schema.load(request.json)
        
        user, token_or_error = AuthService.register_user(
            username=data['username'],
            password=data['password'],
            email=data['email'],
            full_name=data['full_name'],
            roles=data.get('roles', ['Author'])
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
    tags:
      - Authentication
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - username
            - password
          properties:
            username:
              type: string
              example: "author01"
            password:
              type: string
              example: "Author@123"
    responses:
      200:
        description: Login successful
        schema:
          type: object
          properties:
            status:
              type: string
            data:
              type: object
              properties:
                user:
                  type: object
                token:
                  type: string
      401:
        description: Invalid credentials
    """
    try:
        data = login_schema.load(request.json)
        
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
    tags:
      - Authentication
    security:
      - Bearer: []
    responses:
      200:
        description: User information
        schema:
          type: object
          properties:
            status:
              type: string
            data:
              type: object
              properties:
                user:
                  type: object
      404:
        description: User not found
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
    Logout user
    ---
    tags:
      - Authentication
    security:
      - Bearer: []
    responses:
      200:
        description: Logged out successfully
    """
    return jsonify({
        'status': 'success',
        'message': 'Logged out successfully'
    }), 200