# Backend/src/domain/services/auth_service.py
"""
============================================
Authentication Service - Business Logic
============================================

MỤC ĐÍCH:
- Xử lý đăng nhập/đăng ký người dùng
- Quản lý JWT tokens và Refresh tokens
- Bảo vệ chống brute-force với lockout mechanism

CHỨC NĂNG CHÍNH:
1. login(): Đăng nhập với username/email + password
   - Validate credentials
   - Check account lockout
   - Generate JWT + Refresh token
   - Log to AuditLogAI

2. register(): Đăng ký tài khoản mới
   - Validate unique email/username
   - Hash password với werkzeug.security
   - Assign default role (Author)

3. refresh_token(): Làm mới JWT token
4. logout(): Vô hiệu hóa refresh token
5. change_password(): Đổi mật khẩu
6. reset_password(): Reset mật khẩu qua email

SECURITY FEATURES:
- Password hashing: werkzeug.security (scrypt)
- JWT tokens với expiration
- Refresh tokens lưu trong DB
- Brute-force protection với lockout tăng dần:
  * 5 fails = khóa 5 phút
  * +2 fails = khóa 15 phút
  * Tiếp tục: 30 phút, 1 giờ, 2 giờ, 8 giờ
"""
from werkzeug.security import generate_password_hash, check_password_hash
from domain.utils.auth_utils import generate_token
from infrastructure.models.user_model import User
from infrastructure.models.role_model import Role
from infrastructure.models.user_role_model import UserRole
from infrastructure.models.audit_log_ai_model import AuditLogAI
from infrastructure.models.audit_log_model import AuditLog
from infrastructure.models.refresh_token_model import RefreshToken
from infrastructure.databases.base import db_session
from datetime import datetime, timedelta
import json
import hashlib


# ============================================
# LOGIN ATTEMPT TRACKING (Brute-force Protection)
# ============================================
# In-memory cache - consider Redis for production/multi-server
_login_attempts = {}  # {username: {'count': int, 'last_attempt': datetime, 'lockout_level': int}}


class AuthService:
    """
    Authentication Service
    ======================
    Xử lý toàn bộ nghiệp vụ xác thực người dùng
    
    LOCKOUT MECHANISM:
    - Sau 5 lần đăng nhập sai: khóa 5 phút
    - Mỗi 2 lần sai thêm: tăng thời gian khóa
    - Max lockout: 8 giờ
    """
    
    # Lockout durations in minutes: level 1 = 5min, level 2 = 15min, etc.
    LOCKOUT_DURATIONS = [5, 15, 30, 60, 120, 480]  # minutes
    MAX_ATTEMPTS_BEFORE_LOCKOUT = 5
    ADDITIONAL_ATTEMPTS_PER_LEVEL = 2
    
    @staticmethod
    def _get_lockout_duration(level):
        """
        Lấy thời gian khóa (phút) theo level
        
        PARAMS:
        - level: Mức độ vi phạm (1, 2, 3...)
        
        RETURNS:
        - Số phút bị khóa
        """
        if level <= 0:
            return 0
        idx = min(level - 1, len(AuthService.LOCKOUT_DURATIONS) - 1)
        return AuthService.LOCKOUT_DURATIONS[idx]
    
    @staticmethod
    def _check_account_lockout(username):
        """
        Kiểm tra tài khoản có đang bị khóa không
        
        PARAMS:
        - username: Tên đăng nhập cần kiểm tra
        
        RETURNS:
        - (is_locked: bool, remaining_seconds: float, message: str)
        """
        if username not in _login_attempts:
            return False, 0, None
        
        attempt_info = _login_attempts[username]
        lockout_level = attempt_info.get('lockout_level', 0)
        
        if lockout_level == 0:
            return False, 0, None
        
        lockout_duration = AuthService._get_lockout_duration(lockout_level)
        lockout_until = attempt_info['last_attempt'] + timedelta(minutes=lockout_duration)
        
        if datetime.utcnow() < lockout_until:
            remaining = (lockout_until - datetime.utcnow()).total_seconds()
            minutes = int(remaining // 60)
            seconds = int(remaining % 60)
            return True, remaining, f"Tài khoản bị khóa tạm thời. Vui lòng thử lại sau {minutes} phút {seconds} giây."
        
        # Lockout expired, reset for next level
        return False, 0, None
    
    @staticmethod
    def _record_failed_attempt(username):
        """
        Ghi nhận lần đăng nhập thất bại
        
        PROCESS:
        1. Tăng counter số lần fail
        2. Nếu đủ ngưỡng -> tăng lockout level
        3. Lưu timestamp để tính thời gian khóa
        """
        now = datetime.utcnow()
        
        if username not in _login_attempts:
            _login_attempts[username] = {'count': 1, 'last_attempt': now, 'lockout_level': 0}
        else:
            info = _login_attempts[username]
            # Check if previous lockout expired
            if info['lockout_level'] > 0:
                lockout_duration = AuthService._get_lockout_duration(info['lockout_level'])
                lockout_until = info['last_attempt'] + timedelta(minutes=lockout_duration)
                if now >= lockout_until:
                    # Lockout expired, count this as additional attempt
                    info['count'] = 1
                else:
                    info['count'] += 1
            else:
                info['count'] += 1
            
            info['last_attempt'] = now
            
            # Check if we should increase lockout level
            if info['lockout_level'] == 0 and info['count'] >= AuthService.MAX_ATTEMPTS_BEFORE_LOCKOUT:
                info['lockout_level'] = 1
                info['count'] = 0
            elif info['lockout_level'] > 0 and info['count'] >= AuthService.ADDITIONAL_ATTEMPTS_PER_LEVEL:
                info['lockout_level'] += 1
                info['count'] = 0
        
        return _login_attempts[username]
    
    @staticmethod
    def _clear_login_attempts(username):
        """Clear login attempts on successful login"""
        if username in _login_attempts:
            del _login_attempts[username]
    
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
            
            # Validate roles - only Author is allowed for self-registration
            # Admin, Chair, Reviewer must be assigned by administrators
            ALLOWED_SELF_REGISTER_ROLES = ['Author']
            if roles is None:
                roles = ['Author']
            else:
                # Filter out restricted roles
                roles = [r for r in roles if r in ALLOWED_SELF_REGISTER_ROLES]
                if not roles:
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
        Includes account lockout after failed attempts
        
        Returns:
            (User, token) if success
            (None, error_message) if failed
        """
        try:
            # Strip whitespace from username/email
            username = username.strip()
            
            # Check if account is locked
            is_locked, remaining, lock_message = AuthService._check_account_lockout(username)
            if is_locked:
                return None, lock_message
            
            # Try to find user by username OR email
            user = db_session.query(User).filter(
                (User.username == username) | (User.email == username)
            ).first()
            
            if not user:
                AuthService._record_failed_attempt(username)
                attempts_info = _login_attempts.get(username, {})
                remaining_attempts = AuthService.MAX_ATTEMPTS_BEFORE_LOCKOUT - attempts_info.get('count', 0)
                if attempts_info.get('lockout_level', 0) > 0:
                    remaining_attempts = AuthService.ADDITIONAL_ATTEMPTS_PER_LEVEL - attempts_info.get('count', 0)
                return None, f"Sai tài khoản hoặc mật khẩu. Còn {max(0, remaining_attempts)} lần thử."
            
            # Check if user is blocked
            if hasattr(user, 'is_blocked') and user.is_blocked:
                return None, "Tài khoản đã bị khóa vĩnh viễn. Vui lòng liên hệ admin."
            
            if not check_password_hash(user.password_hash, password):
                AuthService._record_failed_attempt(username)
                attempts_info = _login_attempts.get(username, {})
                if attempts_info.get('lockout_level', 0) > 0:
                    lockout_duration = AuthService._get_lockout_duration(attempts_info['lockout_level'])
                    return None, f"Sai mật khẩu. Tài khoản bị khóa {lockout_duration} phút."
                remaining_attempts = AuthService.MAX_ATTEMPTS_BEFORE_LOCKOUT - attempts_info.get('count', 0)
                return None, f"Sai tài khoản hoặc mật khẩu. Còn {max(0, remaining_attempts)} lần thử."
            
            # Login successful - clear attempts
            AuthService._clear_login_attempts(username)
            
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