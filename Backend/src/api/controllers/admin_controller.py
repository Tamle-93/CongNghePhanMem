# Backend/src/api/controllers/admin_controller.py
"""
Admin API Routes
"""
from flask import Blueprint, request, jsonify
from domain.services.admin_service import AdminService
from domain.utils.auth_utils import require_auth, require_role
from marshmallow import ValidationError

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/statistics', methods=['GET'])
@require_auth
@require_role('Admin')
def get_statistics():
    """Get system statistics"""
    try:
        stats, error = AdminService.get_system_statistics()
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({'status': 'success', 'data': stats}), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@admin_bp.route('/users', methods=['GET'])
@require_auth
@require_role('Admin')
def list_users():
    """List all users"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        role_filter = request.args.get('role')
        search = request.args.get('search')
        
        result, error = AdminService.list_all_users(
            page=page,
            per_page=per_page,
            role_filter=role_filter,
            search=search
        )
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({'status': 'success', 'data': result}), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@admin_bp.route('/users', methods=['POST'])
@require_auth
@require_role('Admin')
def create_user():
    """
    Create new user
    ---
    POST /api//admin/users
    Body:
    {
        "username": "newuser",
        "password": "Password123",
        "email": "user@example.com",
        "full_name": "New User",
        "roles": ["Author", "Reviewer"]
    }
    """
    try:
        data = request.json
        
        required = ['username', 'password', 'email', 'full_name', 'roles']
        for field in required:
            if field not in data:
                return jsonify({'status': 'error', 'message': f'{field} is required'}), 400
        
        user, error = AdminService.create_user(
            username=data['username'],
            password=data['password'],
            email=data['email'],
            full_name=data['full_name'],
            roles=data['roles']
        )
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({
            'status': 'success',
            'message': 'User created successfully',
            'data': user
        }), 201
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@require_auth
@require_role('Admin')
def update_user(user_id):
    """Update user"""
    try:
        data = request.json
        
        user, error = AdminService.update_user(
            user_id,
            request.current_user['user_id'],
            **data
        )
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({
            'status': 'success',
            'message': 'User updated successfully',
            'data': user
        }), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@require_auth
@require_role('Admin')
def delete_user(user_id):
    """Delete user"""
    try:
        success, error = AdminService.delete_user(
            user_id,
            request.current_user['user_id']
        )
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({
            'status': 'success',
            'message': 'User deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@admin_bp.route('/audit-logs', methods=['GET'])
@require_auth
@require_role('Admin')
def get_audit_logs():
    """Get audit logs"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        user_id = request.args.get('user_id', type=int)
        action_type = request.args.get('action_type')
        
        result, error = AdminService.get_audit_logs(
            page=page,
            per_page=per_page,
            user_id=user_id,
            action_type=action_type
        )
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({'status': 'success', 'data': result}), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500