"""
Backend/src/api/controllers/users_controller.py
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
    GET /api/controllers/users?role=Reviewer&page=1&per_page=20
    """
    db = SessionLocal()
    
    try:
        role = request.args.get('role')
        search = request.args.get('search')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        query = db.query(User).filter(User.is_deleted == False)
        
        if role:
            # ✅ FIXED: Filter by role through UserRole relationship with explicit join conditions
            from infrastructure.models import UserRole, Role
            query = query.join(UserRole, User.id == UserRole.user_id)\
                        .join(Role, UserRole.role_id == Role.id)\
                        .filter(
                            (Role.name == role) & (UserRole.is_active == True)
                        )
        
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
        # ✅ FIXED: Use UserRole relationship to filter by roles
        from infrastructure.models import UserRole, Role
        reviewers = db.query(User).join(UserRole).join(Role).filter(
            Role.name.in_(['Reviewer', 'Chair']),
            UserRole.is_active == True,
            User.is_deleted == False
        ).distinct().order_by(User.full_name).all()
        
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
        
        # ✅ FIXED: Use UserRole relationship to filter by roles
        from infrastructure.models import UserRole, Role
        users = db.query(User).join(UserRole).join(Role).filter(
            Role.name == role,
            UserRole.is_active == True,
            User.is_deleted == False
        ).distinct().order_by(User.full_name).all()
        
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
        from infrastructure.models import UserRole, Role
        
        # ✅ FIXED: Count by role using UserRole relationship
        role_stats = db.query(
            Role.name,
            func.count(User.id).label('count')
        ).join(UserRole).join(Role).filter(
            UserRole.is_active == True,
            User.is_deleted == False
        ).group_by(Role.name).all()
        
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

@users_bp.route('/public-stats', methods=['GET'])
@require_auth
def get_public_user_stats():
    """Get public user statistics (total users)"""
    db = SessionLocal()
    
    try:
        total_users = db.query(User).filter(User.is_deleted == False).count()
        return jsonify({'status': 'success', 'data': {'total_users': total_users}}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
    finally:
        db.close()

@users_bp.route('/change-password', methods=['PUT'])
@require_auth
def change_password():
    """Change current user's password"""
    from werkzeug.security import check_password_hash
    
    db = SessionLocal()
    
    try:
        data = request.json
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        if not current_password or not new_password:
            return jsonify({'status': 'error', 'message': 'Vui lòng nhập đầy đủ mật khẩu'}), 400
        
        if len(new_password) < 6:
            return jsonify({'status': 'error', 'message': 'Mật khẩu mới phải có ít nhất 6 ký tự'}), 400
        
        user_id = request.current_user['user_id']
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            return jsonify({'status': 'error', 'message': 'Người dùng không tồn tại'}), 404
        
        # Verify current password
        if not check_password_hash(user.password_hash, current_password):
            return jsonify({'status': 'error', 'message': 'Mật khẩu hiện tại không đúng'}), 400
        
        # Update password
        user.password_hash = hash_password(new_password)
        db.commit()
        
        # Log
        AuditLogAI.log(
            db_session=db,
            user_id=user_id,
            action_type='password_changed',
            table_name='users',
            record_id=user_id,
            data=json.dumps({})
        )
        
        return jsonify({
            'status': 'success',
            'message': 'Đổi mật khẩu thành công!'
        }), 200
        
    except Exception as e:
        db.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500
    finally:
        db.close()


@users_bp.route('/invite-reviewer', methods=['POST'])
@require_auth
@require_role('Chair', 'Admin')
def invite_reviewer():
    """
    ============================================
    Mời người dùng trở thành Reviewer
    ============================================
    
    CHỨC NĂNG:
    1. Kiểm tra email đã tồn tại trong hệ thống chưa
    2. Nếu đã tồn tại: cập nhật role thành Reviewer
    3. Nếu chưa: tạo tài khoản mới với role Reviewer
    4. Gửi email thông báo
    
    API: POST /api/users/invite-reviewer
    Body: { "email": "reviewer@example.com", "name": "Tên người dùng" }
    
    RETURNS:
    - success: { status: 'success', data: { user: {...}, is_new: bool } }
    - error: { status: 'error', message: '...' }
    """
    from domain.services.email_service import EmailService
    from werkzeug.security import generate_password_hash
    import secrets
    import string
    
    db = SessionLocal()
    
    try:
        data = request.json
        email = data.get('email', '').strip().lower()
        name = data.get('name', '').strip()
        
        # Validate email
        if not email or '@' not in email:
            return jsonify({'status': 'error', 'message': 'Email không hợp lệ'}), 400
        
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == email).first()
        
        if existing_user:
            # User exists - check if already reviewer
            # ✅ FIXED: Check if user has Reviewer role
            if 'Reviewer' in existing_user.roles:
                return jsonify({
                    'status': 'success',
                    'message': 'Người dùng đã là Reviewer',
                    'data': {
                        'user': response_schema.dump(existing_user),
                        'is_new': False,
                        'already_reviewer': True
                    }
                }), 200
            
            # ✅ FIXED: Add Reviewer role using UserRole relationship
            from infrastructure.models import UserRole, Role
            reviewer_role = db.query(Role).filter(Role.name == 'Reviewer').first()
            if not reviewer_role:
                return jsonify({'status': 'error', 'message': 'Reviewer role not found'}), 500
            
            # Get current roles before adding new one
            old_roles = existing_user.roles if existing_user.roles else []
            
            new_user_role = UserRole(
                user_id=existing_user.id,
                role_id=reviewer_role.id,
                conference_id=None,  # Global Reviewer role
                is_active=True
            )
            db.add(new_user_role)
            db.commit()
            
            # Log the role change
            AuditLogAI.log(
                db_session=db,
                user_id=request.current_user['user_id'],
                action_type='role_added',
                table_name='users',
                record_id=existing_user.id,
                data=json.dumps({
                    'email': email,
                    'old_roles': old_roles,
                    'new_role': 'Reviewer',
                    'invited_by': request.current_user['username']
                })
            )
            
            return jsonify({
                'status': 'success',
                'message': f'Đã cập nhật {email} thành Reviewer',
                'data': {
                    'user': response_schema.dump(existing_user),
                    'is_new': False,
                    'already_reviewer': False
                }
            }), 200
        
        # Create new user with random password
        alphabet = string.ascii_letters + string.digits
        random_password = ''.join(secrets.choice(alphabet) for _ in range(12))
        
        new_user = User(
            email=email,
            username=email.split('@')[0] + '_' + secrets.token_hex(3),  # Unique username
            full_name=name or email.split('@')[0],
            password_hash=generate_password_hash(random_password),
            role='Reviewer',
            is_active=True,
            is_deleted=False
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Log the invitation
        AuditLogAI.log(
            db_session=db,
            user_id=request.current_user['user_id'],
            action_type='reviewer_invited',
            table_name='users',
            record_id=new_user.id,
            data=json.dumps({
                'email': email,
                'name': name,
                'invited_by': request.current_user['username']
            })
        )
        
        # Send invitation email (optional - may fail if email not configured)
        try:
            EmailService.send_email(
                to=email,
                subject='Lời mời tham gia Hội đồng Phản biện - UTH Conference',
                body=f"""Kính gửi {name or 'Quý chuyên gia'},

Bạn đã được mời tham gia Hội đồng Phản biện (PC) của hệ thống UTH Conference Management.

Thông tin đăng nhập tạm thời:
- Email: {email}
- Mật khẩu: {random_password}

Vui lòng đăng nhập và đổi mật khẩu ngay sau khi nhận được email này.

Trân trọng,
Ban tổ chức""",
                email_type='REVIEWER_INVITATION',
                entity_type='User',
                entity_id=new_user.id,
                user_id=new_user.id
            )
        except Exception as email_error:
            print(f"Warning: Could not send invitation email: {email_error}")
        
        return jsonify({
            'status': 'success',
            'message': f'Đã mời {email} làm Reviewer thành công',
            'data': {
                'user': response_schema.dump(new_user),
                'is_new': True,
                'temp_password': random_password  # Only returned for new users so admin can share
            }
        }), 201
        
    except Exception as e:
        db.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500
    finally:
        db.close()