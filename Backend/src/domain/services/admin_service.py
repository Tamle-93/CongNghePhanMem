# Backend/src/domain/services/admin_service.py
"""
Admin Service - User & System Management
"""
from infrastructure.databases.base import SessionLocal
from infrastructure.models import User, Role, UserRole, Conference, Paper, Review, AuditLogAI
from werkzeug.security import generate_password_hash
from datetime import datetime
import json
 
class AdminService:
    """Admin management service"""
    
    @staticmethod
    def get_system_statistics():
        """Get overall system statistics"""
        db = SessionLocal()
        
        try:
            from sqlalchemy import func
            
            # User stats
            total_users = db.query(User).filter(User.is_deleted == False).count()
            user_by_role = db.query(
                UserRole.role_id,
                func.count(UserRole.user_id).label('count')
            ).filter(UserRole.is_active == True).group_by(UserRole.role_id).all()
            
            # Conference stats
            total_conferences = db.query(Conference).filter(Conference.is_deleted == False).count()
            
            # Paper stats
            total_papers = db.query(Paper).filter(Paper.is_deleted == False).count()
            papers_by_status = db.query(
                Paper.status,
                func.count(Paper.id).label('count')
            ).filter(Paper.is_deleted == False).group_by(Paper.status).all()
            
            # Review stats
            total_reviews = db.query(Review).filter(Review.is_deleted == False).count()
            
            return {
                'users': {
                    'total': total_users,
                    'by_role': {str(role_id): count for role_id, count in user_by_role}
                },
                'conferences': {
                    'total': total_conferences
                },
                'papers': {
                    'total': total_papers,
                    'by_status': {str(status): count for status, count in papers_by_status}
                },
                'reviews': {
                    'total': total_reviews
                }
            }, None
            
        except Exception as e:
            return None, str(e)
        finally:
            db.close()
    
    @staticmethod
    def list_all_users(page=1, per_page=20, role_filter=None, search=None):
        """List all users with filters"""
        db = SessionLocal()
        
        try:
            query = db.query(User).filter(User.is_deleted == False)
            
            # Role filter - specify explicit join condition
            if role_filter:
                query = query.join(UserRole, User.id == UserRole.user_id)\
                            .join(Role, UserRole.role_id == Role.id)\
                            .filter(
                                Role.name == role_filter,
                                UserRole.is_active == True
                            )
            
            # Search filter
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
            
            return {
                'users': [AdminService._serialize_user(u) for u in users],
                'total': total,
                'page': page,
                'per_page': per_page
            }, None
            
        except Exception as e:
            return None, str(e)
        finally:
            db.close()
    
    @staticmethod
    def create_user(username, password, email, full_name, roles):
        """Create new user (Admin only)"""
        db = SessionLocal()
        
        try:
            # Check if username/email exists
            existing = db.query(User).filter(
                (User.username == username) | (User.email == email)
            ).first()
            
            if existing:
                return None, "Username or email already exists"
            
            # Create user
            user = User(
                username=username,
                password_hash=generate_password_hash(password),
                email=email,
                full_name=full_name
            )
            
            db.add(user)
            db.flush()
            
            # Assign roles
            for role_name in roles:
                role = db.query(Role).filter(Role.name == role_name).first()
                if not role:
                    continue
                
                user_role = UserRole(
                    user_id=user.id,
                    role_id=role.id,
                    conference_id=None,
                    is_active=True
                )
                db.add(user_role)
            
            db.commit()
            db.refresh(user)
            
            # Log
            AuditLogAI.log(
                db_session=db,
                user_id=user.id,
                action_type='admin_user_created',
                table_name='users',
                record_id=user.id,
                data=json.dumps({'username': username, 'roles': roles})
            )
            
            return AdminService._serialize_user(user), None
            
        except Exception as e:
            db.rollback()
            return None, str(e)
        finally:
            db.close()
    
    @staticmethod
    def get_user_by_id(user_id):
        """Get single user by ID"""
        db = SessionLocal()
        
        try:
            user = db.query(User).filter(User.id == user_id).first()
            
            if not user:
                return None, "User not found"
            
            return AdminService._serialize_user(user), None
            
        except Exception as e:
            return None, str(e)
        finally:
            db.close()
    
    @staticmethod
    def update_user(user_id, admin_id, **updates):
        """Update user (Admin only)"""
        db = SessionLocal()
        
        try:
            user = db.query(User).filter(User.id == user_id).first()
            
            if not user:
                return None, "User not found"
            
            # Prevent self-modification of critical fields
            if user_id == admin_id and 'roles' in updates:
                return None, "Cannot modify your own roles"
            
            # Update basic fields
            if 'email' in updates:
                existing = db.query(User).filter(
                    User.email == updates['email'],
                    User.id != user_id
                ).first()
                if existing:
                    return None, "Email already exists"
                user.email = updates['email']
            
            if 'full_name' in updates:
                user.full_name = updates['full_name']
            
            if 'password' in updates:
                user.password_hash = generate_password_hash(updates['password'])
            
            # Update roles
            if 'roles' in updates:
                # Deactivate all current roles
                db.query(UserRole).filter(
                    UserRole.user_id == user_id,
                    UserRole.conference_id == None
                ).update({'is_active': False})
                
                # Add new roles
                for role_name in updates['roles']:
                    role = db.query(Role).filter(Role.name == role_name).first()
                    if not role:
                        continue
                    
                    # Check if exists
                    ur = db.query(UserRole).filter(
                        UserRole.user_id == user_id,
                        UserRole.role_id == role.id,
                        UserRole.conference_id == None
                    ).first()
                    
                    if ur:
                        ur.is_active = True
                    else:
                        ur = UserRole(
                            user_id=user_id,
                            role_id=role.id,
                            conference_id=None,
                            is_active=True,
                            assigned_by=admin_id
                        )
                        db.add(ur)
            
            db.commit()
            db.refresh(user)
            
            # Log
            AuditLogAI.log(
                db_session=db,
                user_id=admin_id,
                action_type='admin_user_updated',
                table_name='users',
                record_id=user_id,
                data=json.dumps(updates)
            )
            
            return AdminService._serialize_user(user), None
            
        except Exception as e:
            db.rollback()
            return None, str(e)
        finally:
            db.close()
    
    @staticmethod
    def delete_user(user_id, admin_id):
        """Soft delete user (Admin only)"""
        db = SessionLocal()
        
        try:
            if user_id == admin_id:
                return False, "Cannot delete yourself"
            
            user = db.query(User).filter(User.id == user_id).first()
            
            if not user:
                return False, "User not found"
            
            user.is_deleted = True
            db.commit()
            
            # Log
            AuditLogAI.log(
                db_session=db,
                user_id=admin_id,
                action_type='admin_user_deleted',
                table_name='users',
                record_id=user_id,
                data=json.dumps({'username': user.username})
            )
            
            return True, None
            
        except Exception as e:
            db.rollback()
            return False, str(e)
        finally:
            db.close()
    
    @staticmethod
    def block_user(user_id, admin_id):
        """Block user account (Admin only)"""
        db = SessionLocal()
        
        try:
            if user_id == admin_id:
                return False, "Cannot block yourself"
            
            user = db.query(User).filter(User.id == user_id).first()
            
            if not user:
                return False, "User not found"
            
            if user.is_blocked:
                return False, "User is already blocked"
            
            user.is_blocked = True
            db.commit()
            
            # Log
            AuditLogAI.log(
                db_session=db,
                user_id=admin_id,
                action_type='admin_user_blocked',
                table_name='users',
                record_id=user_id,
                data=json.dumps({'username': user.username})
            )
            
            return True, None
            
        except Exception as e:
            db.rollback()
            return False, str(e)
        finally:
            db.close()
    
    @staticmethod
    def unblock_user(user_id, admin_id):
        """Unblock user account (Admin only)"""
        db = SessionLocal()
        
        try:
            user = db.query(User).filter(User.id == user_id).first()
            
            if not user:
                return False, "User not found"
            
            if not user.is_blocked:
                return False, "User is not blocked"
            
            user.is_blocked = False
            db.commit()
            
            # Log
            AuditLogAI.log(
                db_session=db,
                user_id=admin_id,
                action_type='admin_user_unblocked',
                table_name='users',
                record_id=user_id,
                data=json.dumps({'username': user.username})
            )
            
            return True, None
            
        except Exception as e:
            db.rollback()
            return False, str(e)
        finally:
            db.close()
    
    @staticmethod
    def get_audit_logs(page=1, per_page=50, user_id=None, action_type=None):
        """Get audit logs"""
        db = SessionLocal()
        
        try:
            query = db.query(AuditLogAI)
            
            if user_id:
                query = query.filter(AuditLogAI.action_user_id == user_id)
            
            if action_type:
                query = query.filter(AuditLogAI.action_type == action_type)
            
            total = query.count()
            
            logs = query.order_by(AuditLogAI.timestamp.desc())\
                       .limit(per_page)\
                       .offset((page - 1) * per_page)\
                       .all()
            
            return {
                'logs': [AdminService._serialize_log(log) for log in logs],
                'total': total,
                'page': page,
                'per_page': per_page
            }, None
            
        except Exception as e:
            return None, str(e)
        finally:
            db.close()
    
    @staticmethod
    def _serialize_user(user):
        """Serialize user with roles"""
        # Determine status from is_blocked field - handle None/False properly
        is_blocked = getattr(user, 'is_blocked', None)
        if is_blocked is None:
            is_blocked = False
        
        return {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'full_name': user.full_name,
            'organization': getattr(user, 'organization', None) or getattr(user, 'affiliation', None),
            'roles': user.roles,
            'status': 'blocked' if is_blocked else 'active',
            'created_at': user.created_at.isoformat(),
            'is_deleted': user.is_deleted
        }
    
    @staticmethod
    def _serialize_log(log):
        """Serialize audit log"""
        return {
            'id': log.id,
            'user_id': log.action_user_id,
            'action_type': log.action_type,
            'table_name': log.table_name,
            'record_id': log.record_id,
            'data': log.data,
            'timestamp': log.timestamp.isoformat()
        }