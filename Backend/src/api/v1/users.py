"""
Backend/src/api/v1/users.py
User Management API Routes
"""

from flask import Blueprint, request, jsonify
from infrastructure.databases.base import SessionLocal
from infrastructure.models import User, AuditLogAI
from domain.schemas.user_schema import UserResponseSchema, UserUpdateSchema
from domain.utils.auth_utils import require_auth, require_role, hash_password
from marshmallow import ValidationError
import json

users_bp = Blueprint('users', __name__, url_prefix='/users')

response_schema = UserResponseSchema()
update_schema = UserUpdateSchema()

@users_bp.route('', methods=['GET'])
@require_auth
@require_role('Chair', 'Admin')
def list_users():
    """
    List all users
    ---
    GET /api/v1/users?role=Reviewer&page=1&per_page=20
    """
    db = SessionLocal()
    
    try:
        role = request.args.get('role')
        search = request.args.get('search')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        query = db.query(User).filter(User.is_deleted == False)
        
        if role:
            query = query.filter(User.role == role)
        
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                (User.username.ilike(search_pattern)) |
                (User.full_name.ilike(search_pattern)) |
                (User.email.ilike(search_pattern))
            )
        
        total = query.count()
        
        users = query.order_by(User.created_at.desc())\
                    .limit(per_page)\
                    .offset((page - 1) * per_page)\
                    .all()
        
        return jsonify({
            'status': 'success',
            'data': {
                'users': [response_schema.dump(u) for u in users],
                'total': total,
                'page': page,
                'per_page': per_page
            }
        }), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
    finally:
        db.close()

@users_bp.route('/<int:user_id>', methods=['GET'])
@require_auth
def get_user(user_id):
    """Get user by ID"""
    db = SessionLocal()
    
    try:
        # Users can view their own profile or Chair/Admin can view any
        if request.current_user['user_id'] != user_id:
            if request.current_user['role'] not in ['Chair', 'Admin']:
                return jsonify({'status': 'error', 'message': 'Permission denied'}), 403
        
        user = db.query(User).filter(
            User.id == user_id,
            User.is_deleted == False
        ).first()
        
        if not user:
            return jsonify({'status': 'error', 'message': 'User not found'}), 404
        
        return jsonify({
            'status': 'success',
            'data': response_schema.dump(user)
        }), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
    finally:
        db.close()

@users_bp.route('/<int:user_id>', methods=['PUT'])
@require_auth
def update_user(user_id):
    """Update user profile"""
    db = SessionLocal()
    
    try:
        # Users can update their own profile or Admin can update any
        if request.current_user['user_id'] != user_id:
            if request.current_user['role'] != 'Admin':
                return jsonify({'status': 'error', 'message': 'Permission denied'}), 403
        
        user = db.query(User).filter(
            User.id == user_id,
            User.is_deleted == False
        ).first()
        
        if not user:
            return jsonify({'status': 'error', 'message': 'User not found'}), 404
        
        # Validate data
        data = update_schema.load(request.json)
        
        # Update allowed fields
        if 'email' in data:
            # Check email uniqueness
            existing = db.query(User).filter(
                User.email == data['email'],
                User.id != user_id
            ).first()
            if existing:
                return jsonify({'status': 'error', 'message': 'Email already exists'}), 400
            user.email = data['email']
        
        if 'full_name' in data:
            user.full_name = data['full_name']
        
        if 'password' in data:
            user.password_hash = hash_password(data['password'])
        
        db.commit()
        db.refresh(user)
        
        # Log update
        AuditLogAI.log(
            db_session=db,
            user_id=request.current_user['user_id'],
            action_type='user_updated',
            table_name='users',
            record_id=user_id,
            data=json.dumps({"updated_fields": list(data.keys())})
        )
        
        return jsonify({
            'status': 'success',
            'message': 'User updated successfully',
            'data': response_schema.dump(user)
        }), 200
        
    except ValidationError as e:
        return jsonify({'status': 'error', 'errors': e.messages}), 400
    except Exception as e:
        db.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500
    finally:
        db.close()

@users_bp.route('/<int:user_id>', methods=['DELETE'])
@require_auth
@require_role('Admin')
def delete_user(user_id):
    """Delete user (soft delete) - Admin only"""
    db = SessionLocal()
    
    try:
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            return jsonify({'status': 'error', 'message': 'User not found'}), 404
        
        # Prevent self-deletion
        if user_id == request.current_user['user_id']:
            return jsonify({'status': 'error', 'message': 'Cannot delete yourself'}), 400
        
        user.is_deleted = True
        db.commit()
        
        # Log deletion
        AuditLogAI.log(
            db_session=db,
            user_id=request.current_user['user_id'],
            action_type='user_deleted',
            table_name='users',
            record_id=user_id,
            data=json.dumps({"username": user.username})
        )
        
        return jsonify({
            'status': 'success',
            'message': 'User deleted successfully'
        }), 200
        
    except Exception as e:
        db.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500
    finally:
        db.close()

@users_bp.route('/reviewers', methods=['GET'])
@require_auth
@require_role('Chair', 'Admin')
def list_reviewers():
    """Get all users with Reviewer or Chair role"""
    db = SessionLocal()
    
    try:
        reviewers = db.query(User).filter(
            User.role.in_(['Reviewer', 'Chair']),
            User.is_deleted == False
        ).order_by(User.full_name).all()
        
        return jsonify({
            'status': 'success',
            'data': [response_schema.dump(r) for r in reviewers]
        }), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
    finally:
        db.close()

@users_bp.route('/role/<role>', methods=['GET'])
@require_auth
@require_role('Chair', 'Admin')
def get_users_by_role(role):
    """Get all users with specific role"""
    db = SessionLocal()
    
    try:
        if role not in ['Author', 'Reviewer', 'Chair', 'Admin']:
            return jsonify({'status': 'error', 'message': 'Invalid role'}), 400
        
        users = db.query(User).filter(
            User.role == role,
            User.is_deleted == False
        ).order_by(User.full_name).all()
        
        return jsonify({
            'status': 'success',
            'data': {
                'role': role,
                'count': len(users),
                'users': [response_schema.dump(u) for u in users]
            }
        }), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
    finally:
        db.close()

@users_bp.route('/statistics', methods=['GET'])
@require_auth
@require_role('Admin')
def get_user_statistics():
    """Get user statistics"""
    db = SessionLocal()
    
    try:
        from sqlalchemy import func
        
        # Count by role
        role_stats = db.query(
            User.role,
            func.count(User.id).label('count')
        ).filter(User.is_deleted == False)\
         .group_by(User.role).all()
        
        stats = {
            'total_users': db.query(User).filter(User.is_deleted == False).count(),
            'by_role': {role: count for role, count in role_stats},
            'deleted_users': db.query(User).filter(User.is_deleted == True).count()
        }
        
        return jsonify({'status': 'success', 'data': stats}), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
    finally:
        db.close()