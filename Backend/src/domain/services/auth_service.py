# Backend/src/domain/services/auth_service.py
"""
Authentication Service - Business Logic
"""
from werkzeug.security import generate_password_hash, check_password_hash
from infrastructure.models.user_model import User
from infrastructure.models.role_model import Role
from infrastructure.models.user_role_model import UserRole
from infrastructure.models.audit_log_ai_model import AuditLogAI
from infrastructure.databases.base import db_session
from domain.utils.jwt_utils import generate_token
from datetime import datetime
import json

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
            # Validate roles
            if roles is None:
                roles = ['Author']
            
            # Check if username exists
            existing_user = db_session.query(User).filter_by(username=username).first()
            if existing_user:
                return None, "Username already exists"
            
            # Check if email exists
            existing_email = db_session.query(User).filter_by(email=email).first()
            if existing_email:
                return None, "Email already exists"
            
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
            token = generate_token(new_user.id)
            
            return new_user, token
            
        except Exception as e:
            db_session.rollback()
            return None, f"Registration failed: {str(e)}"
    
    @staticmethod
    def login_user(username, password):
        """
        Login user
        
        Returns:
            (User, token) if success
            (None, error_message) if failed
        """
        try:
            user = db_session.query(User).filter_by(username=username).first()
            
            if not user:
                return None, "Invalid username or password"
            
            if not check_password_hash(user.password_hash, password):
                return None, "Invalid username or password"
            
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
            
            # Generate token
            token = generate_token(user.id)
            
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