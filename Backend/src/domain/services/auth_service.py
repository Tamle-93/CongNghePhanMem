# Backend/src/domain/services/auth_service.py
"""
Authentication Service - Business Logic with JWT and Refresh Token support
"""
from werkzeug.security import generate_password_hash, check_password_hash
from infrastructure.models.user_model import User
from infrastructure.models.role_model import Role
from infrastructure.models.user_role_model import UserRole
from infrastructure.models.audit_log_ai_model import AuditLogAI
from infrastructure.models.audit_log_model import AuditLog
from infrastructure.models.refresh_token_model import RefreshToken
from infrastructure.databases.base import db_session
from domain.utils.auth_utils import generate_token
from datetime import datetime, timedelta
import json
import hashlib

class AuthService:
    
    @staticmethod
    def register_user(username, password, email, full_name, roles=None):
        """
        Register new user with roles
        
        Args:
            username: str
            password: str (plain text)
            email: str
            full_name: str
            roles: list of role names, default ['Author']
        
        Returns:
            (User, token) if success
            (None, error_message) if failed
        """
        try:
            # Strip whitespace from username and email
            username = username.strip()
            email = email.strip()
            
            # Validate roles
            if roles is None:
                roles = ['Author']
            
            # Check if username exists
            existing_user = db_session.query(User).filter_by(username=username).first()
            if existing_user:
                return None, "USERNAME_EXISTS"
            
            # Check if email exists
            existing_email = db_session.query(User).filter_by(email=email).first()
            if existing_email:
                return None, "EMAIL_EXISTS"
            
            # Create new user
            new_user = User(
                username=username,
                email=email,
                full_name=full_name,
                password_hash=generate_password_hash(password)
            )
            db_session.add(new_user)
            db_session.flush()  # Get user.id
            
            #  Assign roles (GLOBAL - without conference_id)
            for role_name in roles:
                role = db_session.query(Role).filter_by(name=role_name).first()
                if not role:
                    db_session.rollback()
                    return None, f"Invalid role: {role_name}"
                
                
                user_role = UserRole(
                    user_id=new_user.id,
                    role_id=role.id,
                    conference_id=None,  #
                    is_active=True,
                    assigned_by=None,  
                    assigned_at=datetime.utcnow()
                )
                db_session.add(user_role)
            
            # Audit log
            audit_log = AuditLogAI(
                user_id=new_user.id,
                action_type='user_registered',
                table_name='users',
                record_id=new_user.id,
                data=json.dumps({
                    'username': username,
                    'email': email,
                    'full_name': full_name,
                    'roles': roles
                })
            )
            db_session.add(audit_log)
            
          
            db_session.commit()
            
            # Generate JWT token
            token = generate_token(new_user.id, new_user.roles)
            
            # ✅ Generate refresh token
            refresh_token_obj = RefreshToken(
                user_id=new_user.id,
                token=RefreshToken.generate_token(),
                expires_at=datetime.utcnow() + timedelta(days=7),  # 7 days
                is_revoked=False
            )
            db_session.add(refresh_token_obj)
            db_session.commit()
            
            return new_user, token
            
        except Exception as e:
            db_session.rollback()
            return None, f"Registration failed: {str(e)}"
    
    @staticmethod
    def login_user(username, password):
        """
        Login user with username OR email
        
        Returns:
            (User, token) if success
            (None, error_message) if failed
        """
        try:
            # Strip whitespace from username/email
            username = username.strip()
            
            # Try to find user by username OR email
            user = db_session.query(User).filter(
                (User.username == username) | (User.email == username)
            ).first()
            
            if not user:
                return None, "Invalid username/email or password"
            
            if not check_password_hash(user.password_hash, password):
                return None, "Invalid username/email or password"
            
            # Audit log
            audit_log = AuditLogAI(
                user_id=user.id,
                action_type='user_login',
                table_name='users',
                record_id=user.id,
                data=json.dumps({'username': username})
            )
            db_session.add(audit_log)
            db_session.commit()
            
            # Generate token - INCLUDE ROLES!
            token = generate_token(user.id, user.roles)
            
            # ✅ Generate refresh token
            refresh_token_obj = RefreshToken(
                user_id=user.id,
                token=RefreshToken.generate_token(),
                expires_at=datetime.utcnow() + timedelta(days=7),  # 7 days
                is_revoked=False
            )
            db_session.add(refresh_token_obj)
            db_session.commit()
            
            return user, token
            
        except Exception as e:
            return None, f"Login failed: {str(e)}"
    
    @staticmethod
    def get_user_by_id(user_id):
        """
        Get user by ID
        
        Returns:
            (User, None) if found
            (None, error_message) if not found
        """
        try:
            user = db_session.query(User).filter_by(id=user_id).first()
            
            if not user:
                return None, "User not found"
            
            return user, None
            
        except Exception as e:
            return None, f"Error: {str(e)}"
    
    @staticmethod
    def refresh_access_token(refresh_token):
        """
        ✅ Refresh access token using refresh token
        
        Args:
            refresh_token: str - The refresh token from client
        
        Returns:
            (new_access_token, refresh_token_obj) if success
            (None, error_message) if failed
        """
        try:
            # Find refresh token
            token_obj = db_session.query(RefreshToken)\
                .filter(RefreshToken.token == refresh_token)\
                .first()
            
            if not token_obj:
                return None, "Invalid refresh token"
            
            # Check if revoked
            if token_obj.is_revoked:
                return None, "Refresh token has been revoked"
            
            # Check if expired
            if not token_obj.is_valid():
                return None, "Refresh token has expired"
            
            # Get user
            user = db_session.query(User).filter(User.id == token_obj.user_id).first()
            if not user:
                return None, "User not found"
            
            # Generate new access token
            new_access_token = generate_token(user.id, user.roles)
            
            # Log this action
            AuditLog.log_action(
                db_session=db_session,
                user_id=user.id,
                action='TOKEN_REFRESHED',
                entity_type='RefreshToken',
                entity_id=token_obj.id,
                status='success'
            )
            
            return new_access_token, None
            
        except Exception as e:
            return None, f"Token refresh failed: {str(e)}"
    
    @staticmethod
    def revoke_refresh_token(refresh_token):
        """Revoke a refresh token (logout)"""
        try:
            token_obj = db_session.query(RefreshToken)\
                .filter(RefreshToken.token == refresh_token)\
                .first()
            
            if not token_obj:
                return False, "Token not found"
            
            token_obj.is_revoked = True
            db_session.commit()
            
            # Log logout
            AuditLog.log_action(
                db_session=db_session,
                user_id=token_obj.user_id,
                action='USER_LOGOUT',
                entity_type='RefreshToken',
                entity_id=token_obj.id,
                status='success'
            )
            
            return True, None
            
        except Exception as e:
            return False, str(e)
    
    @staticmethod
    def send_password_reset_email(email):
        try:
            from infrastructure.models.user_model import User
        
            user = User.query.filter_by(email=email).first()
        
            if not user:
                return False, "Email not found"
        
            # Generate reset token (6 digits)
            import random
            reset_token = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        
            # Save token to user (cần thêm field reset_token và reset_token_expires)
            user.reset_token = reset_token
            user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
            db.session.commit()
        
            # Gửi email (sử dụng email_service)
            from domain.services.email_service import EmailService
            EmailService.send_password_reset_email(email, reset_token)
        
            return True, "Email sent"
        
        except Exception as e:
            return False, str(e)

    @staticmethod
    def reset_password(email, reset_token, new_password):
        """Reset password with token"""
        try:
            from infrastructure.models.user_model import User
        
            user = User.query.filter_by(email=email).first()
        
            if not user:
                return False, "User not found"
        
            # Check token
            if user.reset_token != reset_token:
                return False, "Invalid reset token"
        
            # Check expiration
            if user.reset_token_expires < datetime.utcnow():
                return False, "Reset token expired"
        
            # Update password
            user.password = generate_password_hash(new_password)
            user.reset_token = None
            user.reset_token_expires = None
            db.session.commit()
        
            return True, "Password reset successfully"
        
        except Exception as e:
            return False, str(e)