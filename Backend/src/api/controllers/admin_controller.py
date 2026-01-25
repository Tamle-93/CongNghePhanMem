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

# ========================================
# CONFERENCE MANAGEMENT ENDPOINTS
# ========================================

@admin_bp.route('/conferences', methods=['GET'])
@require_auth
@require_role('Admin')
def list_conferences():
    """List all conferences for admin"""
    try:
        from infrastructure.databases.base import SessionLocal
        from infrastructure.models import Conference, User
        from sqlalchemy import or_
        
        search = request.args.get('search', '')
        status = request.args.get('status', '')
        
        db = SessionLocal()
        try:
            query = db.query(Conference).filter(Conference.is_deleted == False)
            
            if search:
                query = query.filter(or_(
                    Conference.name.ilike(f'%{search}%'),
                    Conference.acronym.ilike(f'%{search}%')
                ))
            
            if status:
                query = query.filter(Conference.status == status)
            
            conferences = query.all()
            
            result = []
            for conf in conferences:
                chair = db.query(User).filter(User.id == conf.chair_id).first() if conf.chair_id else None
                
                result.append({
                    'id': conf.id,
                    'name': conf.name,
                    'acronym': conf.acronym if hasattr(conf, 'acronym') else '',
                    'year': conf.year if hasattr(conf, 'year') else None,
                    'organization': conf.organization if hasattr(conf, 'organization') else '',
                    'chair_name': chair.full_name if chair else None,
                    'status': conf.status if hasattr(conf, 'status') else 'active',
                    'paper_count': len(conf.papers) if hasattr(conf, 'papers') else 0,
                    'created_at': conf.created_at.isoformat() if hasattr(conf, 'created_at') else None
                })
            
            return jsonify({
                'status': 'success',
                'data': {'conferences': result}
            }), 200
        finally:
            db.close()
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@admin_bp.route('/conferences', methods=['POST'])
@require_auth
@require_role('Admin')
def create_conference():
    """Create new conference"""
    try:
        from infrastructure.databases.base import SessionLocal
        from infrastructure.models import Conference
        from datetime import datetime
        
        data = request.form.to_dict() if request.files else request.json
        
        db = SessionLocal()
        try:
            conference = Conference(
                name=data['name'],
                acronym=data.get('acronym', ''),
                year=int(data.get('year', datetime.now().year)),
                chair_id=int(data['chair_id']) if data.get('chair_id') else None,
                description=data.get('description', ''),
                submission_deadline=datetime.fromisoformat(data['submission_deadline'].replace('Z', '+00:00')) if data.get('submission_deadline') else None,
                review_deadline=datetime.fromisoformat(data['review_deadline'].replace('Z', '+00:00')) if data.get('review_deadline') else None,
                created_at=datetime.now()
            )
            
            # Add optional fields if they exist in the model
            if hasattr(Conference, 'organization') and data.get('organization'):
                conference.organization = data['organization']
            if hasattr(Conference, 'field') and data.get('field'):
                conference.field = data['field']
            if hasattr(Conference, 'website') and data.get('website'):
                conference.website = data['website']
            if hasattr(Conference, 'notification_date') and data.get('notification_date'):
                conference.notification_date = datetime.fromisoformat(data['notification_date'].replace('Z', '+00:00'))
            if hasattr(Conference, 'conference_start') and data.get('conference_start'):
                conference.conference_start = datetime.fromisoformat(data['conference_start']).date()
            if hasattr(Conference, 'conference_end') and data.get('conference_end'):
                conference.conference_end = datetime.fromisoformat(data['conference_end']).date()
            if hasattr(Conference, 'status'):
                conference.status = 'active'
            
            db.add(conference)
            db.commit()
            db.refresh(conference)
            
            # Log
            AuditLogAI.log(
                db_session=db,
                user_id=request.current_user['user_id'],
                action_type='admin_conference_created',
                table_name='conferences',
                record_id=conference.id,
                data=json.dumps({'name': conference.name, 'acronym': conference.acronym})
            )
            
            return jsonify({
                'status': 'success',
                'message': 'Conference created successfully',
                'data': {'conference_id': conference.id}
            }), 201
        finally:
            db.close()
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@admin_bp.route('/conferences/<int:conference_id>/activate', methods=['PUT'])
@require_auth
@require_role('Admin')
def activate_conference(conference_id):
    """Activate conference"""
    try:
        from infrastructure.databases.base import SessionLocal
        from infrastructure.models import Conference
        
        db = SessionLocal()
        try:
            conference = db.query(Conference).filter(Conference.id == conference_id).first()
            
            if not conference:
                return jsonify({'status': 'error', 'message': 'Conference not found'}), 404
            
            if hasattr(conference, 'status'):
                conference.status = 'active'
                db.commit()
                
                # Log
                AuditLogAI.log(
                    db_session=db,
                    user_id=request.current_user['user_id'],
                    action_type='admin_conference_activated',
                    table_name='conferences',
                    record_id=conference_id,
                    data=json.dumps({'name': conference.name})
                )
            
            return jsonify({
                'status': 'success',
                'message': 'Conference activated successfully'
            }), 200
        finally:
            db.close()
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@admin_bp.route('/conferences/<int:conference_id>/deactivate', methods=['PUT'])
@require_auth
@require_role('Admin')
def deactivate_conference(conference_id):
    """Deactivate conference"""
    try:
        from infrastructure.databases.base import SessionLocal
        from infrastructure.models import Conference
        
        db = SessionLocal()
        try:
            conference = db.query(Conference).filter(Conference.id == conference_id).first()
            
            if not conference:
                return jsonify({'status': 'error', 'message': 'Conference not found'}), 404
            
            if hasattr(conference, 'status'):
                conference.status = 'inactive'
                db.commit()
                
                # Log
                AuditLogAI.log(
                    db_session=db,
                    user_id=request.current_user['user_id'],
                    action_type='admin_conference_deactivated',
                    table_name='conferences',
                    record_id=conference_id,
                    data=json.dumps({'name': conference.name})
                )
            
            return jsonify({
                'status': 'success',
                'message': 'Conference deactivated successfully'
            }), 200
        finally:
            db.close()
        
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

@admin_bp.route('/users/<int:user_id>/block', methods=['PUT'])
@require_auth
@require_role('Admin')
def block_user(user_id):
    """Block user account"""
    try:
        success, error = AdminService.block_user(user_id, request.current_user['user_id'])
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({
            'status': 'success',
            'message': 'User blocked successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@admin_bp.route('/users/<int:user_id>/unblock', methods=['PUT'])
@require_auth
@require_role('Admin')
def unblock_user(user_id):
    """Unblock user account"""
    try:
        success, error = AdminService.unblock_user(user_id, request.current_user['user_id'])
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({
            'status': 'success',
            'message': 'User unblocked successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@admin_bp.route('/stats', methods=['GET'])
@require_auth
@require_role('Admin')
def get_admin_stats():
    """Get admin dashboard statistics"""
    try:
        stats, error = AdminService.get_system_statistics()
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({'status': 'success', 'data': stats}), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@admin_bp.route('/stats/users', methods=['GET'])
@require_auth
@require_role('Admin')
def get_user_stats():
    """Get user statistics for dashboard"""
    try:
        from infrastructure.databases.base import SessionLocal
        from infrastructure.models import User
        
        db = SessionLocal()
        try:
            total = db.query(User).filter(User.is_deleted == False).count()
            active = db.query(User).filter(
                User.is_deleted == False,
                User.is_blocked == False
            ).count()
            blocked = db.query(User).filter(
                User.is_deleted == False,
                User.is_blocked == True
            ).count()
            
            return jsonify({
                'status': 'success',
                'data': {
                    'total': total,
                    'active': active,
                    'blocked': blocked
                }
            }), 200
        finally:
            db.close()
        
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