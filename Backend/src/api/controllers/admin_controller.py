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
                if status == 'active':
                    query = query.filter(Conference.is_active == True)
                elif status == 'inactive':
                    query = query.filter(Conference.is_active == False)
            
            conferences = query.all()
            
            result = []
            for conf in conferences:
                chair = db.query(User).filter(User.id == conf.chair_id).first() if conf.chair_id else None
                
                # Determine status from is_active field
                conf_status = 'active' if conf.is_active else 'inactive'
                
                result.append({
                    'id': conf.id,
                    'name': conf.name,
                    'acronym': conf.acronym if hasattr(conf, 'acronym') else '',
                    'year': conf.year if hasattr(conf, 'year') else None,
                    'organization': conf.organization if hasattr(conf, 'organization') else '',
                    'chair_name': chair.full_name if chair else None,
                    'status': conf_status,
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
        
        # Handle both JSON and form-data
        if request.content_type and 'multipart/form-data' in request.content_type:
            data = request.form.to_dict()
        elif request.content_type and 'application/json' in request.content_type:
            data = request.json
        else:
            # Try form first, then JSON
            data = request.form.to_dict() if request.form else (request.json or {})
        
        if not data:
            return jsonify({'status': 'error', 'message': 'No data provided'}), 400
        
        db = SessionLocal()
        try:
            # Parse datetime strings
            def parse_datetime(dt_str):
                if not dt_str:
                    return None
                try:
                    # Handle various formats
                    dt_str = dt_str.replace('Z', '+00:00')
                    if 'T' in dt_str:
                        return datetime.fromisoformat(dt_str)
                    return datetime.strptime(dt_str, '%Y-%m-%d %H:%M:%S')
                except:
                    try:
                        return datetime.strptime(dt_str, '%Y-%m-%d')
                    except:
                        return None
            
            conference = Conference(
                name=data.get('name', ''),
                chair_id=int(data['chair_id']) if data.get('chair_id') else None,
                description=data.get('description', ''),
                location=data.get('organization', ''),
                website_url=data.get('website', ''),
                submission_deadline=parse_datetime(data.get('submission_deadline')),
                review_deadline=parse_datetime(data.get('review_deadline')),
                decision_deadline=parse_datetime(data.get('notification_date')),
                conference_start_date=parse_datetime(data.get('conference_start')),
                conference_end_date=parse_datetime(data.get('conference_end')),
                is_active=True,
                created_at=datetime.now()
            )
            
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
                data=json.dumps({'name': conference.name})
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

@admin_bp.route('/conferences/<int:conference_id>', methods=['GET'])
@require_auth
@require_role('Admin')
def get_conference(conference_id):
    """Get single conference details"""
    try:
        from infrastructure.databases.base import SessionLocal
        from infrastructure.models import Conference, User
        
        db = SessionLocal()
        try:
            conference = db.query(Conference).filter(Conference.id == conference_id).first()
            
            if not conference:
                return jsonify({'status': 'error', 'message': 'Conference not found'}), 404
            
            # Get chair info
            chair = db.query(User).filter(User.id == conference.chair_id).first() if conference.chair_id else None
            
            return jsonify({
                'status': 'success',
                'data': {
                    'id': conference.id,
                    'name': conference.name,
                    'acronym': conference.acronym,
                    'description': conference.description,
                    'chair_id': conference.chair_id,
                    'chair_name': chair.full_name if chair else None,
                    'submission_deadline': conference.submission_deadline.isoformat() if conference.submission_deadline else None,
                    'review_deadline': conference.review_deadline.isoformat() if conference.review_deadline else None,
                    'is_active': conference.is_active if hasattr(conference, 'is_active') else True,
                    'created_at': conference.created_at.isoformat() if conference.created_at else None
                }
            }), 200
        finally:
            db.close()
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@admin_bp.route('/conferences/<int:conference_id>', methods=['PUT'])
@require_auth
@require_role('Admin')
def update_conference(conference_id):
    """Update conference details"""
    try:
        from infrastructure.databases.base import SessionLocal
        from infrastructure.models import Conference
        from datetime import datetime
        
        # Get data from JSON or form
        if request.content_type and 'application/json' in request.content_type:
            data = request.get_json()
        else:
            data = request.form.to_dict()
        
        db = SessionLocal()
        try:
            conference = db.query(Conference).filter(Conference.id == conference_id).first()
            
            if not conference:
                return jsonify({'status': 'error', 'message': 'Conference not found'}), 404
            
            # Update fields
            if 'name' in data:
                conference.name = data['name']
            if 'acronym' in data:
                conference.acronym = data['acronym']
            if 'description' in data:
                conference.description = data.get('description')
            if 'chair_id' in data and data['chair_id']:
                conference.chair_id = int(data['chair_id'])
            if 'submission_deadline' in data and data['submission_deadline']:
                conference.submission_deadline = datetime.fromisoformat(data['submission_deadline'].replace('Z', '+00:00'))
            if 'review_deadline' in data and data['review_deadline']:
                conference.review_deadline = datetime.fromisoformat(data['review_deadline'].replace('Z', '+00:00'))
            if 'is_active' in data:
                conference.is_active = data['is_active'] in [True, 'true', '1', 1]
            
            db.commit()
            
            # Log
            AuditLogAI.log(
                db_session=db,
                user_id=request.current_user['user_id'],
                action_type='admin_conference_updated',
                table_name='conferences',
                record_id=conference_id,
                data=json.dumps({'name': conference.name})
            )
            
            return jsonify({
                'status': 'success',
                'message': 'Conference updated successfully'
            }), 200
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
            
            conference.is_active = True
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
            
            conference.is_active = False
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
        
        # Validate required fields first
        if not data.get('email'):
            return jsonify({'status': 'error', 'message': 'Email is required'}), 400
        if not data.get('full_name'):
            return jsonify({'status': 'error', 'message': 'Full name is required'}), 400
        if not data.get('roles') or len(data.get('roles', [])) == 0:
            return jsonify({'status': 'error', 'message': 'At least one role is required'}), 400
        
        # Generate username from email if not provided
        if not data.get('username'):
            data['username'] = data['email'].split('@')[0]
        
        # Auto generate password if needed
        if data.get('auto_generate_password') or not data.get('password'):
            import secrets
            import string
            alphabet = string.ascii_letters + string.digits + '!@#$%'
            data['password'] = ''.join(secrets.choice(alphabet) for _ in range(12))
        
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

@admin_bp.route('/users/<int:user_id>', methods=['GET', 'PUT', 'DELETE'])
@require_auth
@require_role('Admin')
def manage_user(user_id):
    """Get, Update, or Delete user by ID"""
    
    # GET - Get user by ID
    if request.method == 'GET':
        try:
            user, error = AdminService.get_user_by_id(user_id)
            
            if error:
                return jsonify({'status': 'error', 'message': error}), 404
            
            return jsonify({
                'status': 'success',
                'data': user
            }), 200
            
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 500
    
    # PUT - Update user
    elif request.method == 'PUT':
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
    
    # DELETE - Delete user
    elif request.method == 'DELETE':
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