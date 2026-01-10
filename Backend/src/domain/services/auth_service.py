# ============================================
# File: Backend/src/domain/services/auth_service.py (UPDATED)
# ============================================
"""
Authentication Service - UPDATED for Multi-Role Support
"""
from infrastructure.databases.base import SessionLocal
from infrastructure.models import User, Role, UserRole, AuditLogAI
from domain.utils.auth_utils import hash_password, verify_password, generate_token
import json

class AuthService:
    
    @staticmethod
    def register_user(username: str, password: str, email: str, full_name: str, roles: list = None):
        """
        Register new user with multiple roles
        
        Args:
            username: str
            password: str
            email: str
            full_name: str
            roles: list of str - ['Author', 'Reviewer'] (default: ['Author'])
        
        Returns: (user_dict, token) or (None, error_message)
        """
        db = SessionLocal()
        
        try:
            # Check existing user
            existing_user = db.query(User).filter(
                (User.username == username) | (User.email == email)
            ).first()
            
            if existing_user:
                if existing_user.username == username:
                    return None, "Username already exists"
                return None, "Email already exists"
            
            # Default role
            if roles is None:
                roles = ['Author']
            
            # Validate roles
            valid_role_names = ['Author', 'Reviewer', 'Chair', 'Admin']
            for role_name in roles:
                if role_name not in valid_role_names:
                    return None, f"Invalid role: {role_name}"
            
            # Create user
            hashed_pw = hash_password(password)
            new_user = User(
                username=username,
                password_hash=hashed_pw,
                email=email,
                full_name=full_name
            )
            
            db.add(new_user)
            db.flush()  # Get user.id before commit
            
            # ✅ Assign roles to user
            for role_name in roles:
                role = db.query(Role).filter(Role.name == role_name).first()
                if not role:
                    # Create role if not exists (shouldn't happen if DB seeded properly)
                    role = Role(name=role_name, description=f"{role_name} role")
                    db.add(role)
                    db.flush()
                
                # Create UserRole (global role, not conference-specific)
                user_role = UserRole(
                    user_id=new_user.id,
                    role_id=role.id,
                    conference_id=None,  # Global role
                    is_active=True,
                    assigned_by=None  # Self-assigned during registration
                )
                db.add(user_role)
            
            db.commit()
            db.refresh(new_user)
            
            # Audit log
            AuditLogAI.log(
                db_session=db,
                user_id=new_user.id,
                action_type='user_registered',
                table_name='users',
                record_id=new_user.id,
                data=json.dumps({"username": username, "roles": roles})
            )
            
            # ✅ Generate token with roles array
            token = generate_token(new_user.id, new_user.roles)
            
            user_dict = {
                'id': new_user.id,
                'username': new_user.username,
                'email': new_user.email,
                'full_name': new_user.full_name,
                'roles': new_user.roles  # ✅ Array of roles
            }
            
            return user_dict, token
            
        except Exception as e:
            db.rollback()
            return None, f"Registration failed: {str(e)}"
        finally:
            db.close()
    
    
    @staticmethod
    def login_user(username: str, password: str):
        """
        Login user and return token with all roles
        """
        db = SessionLocal()
        
        try:
            user = db.query(User).filter(User.username == username).first()
            
            if not user:
                return None, "Invalid credentials"
            
            if not verify_password(password, user.password_hash):
                return None, "Invalid credentials"
            
            if user.is_deleted:
                return None, "Account has been deleted"
            
            # ✅ Generate token with roles array
            token = generate_token(user.id, user.roles)
            
            # Audit log
            AuditLogAI.log(
                db_session=db,
                user_id=user.id,
                action_type='user_login',
                table_name='users',
                record_id=user.id,
                data=json.dumps({"username": username, "roles": user.roles})
            )
            
            user_dict = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'full_name': user.full_name,
                'roles': user.roles  # ✅ Array of roles
            }
            
            return user_dict, token
            
        except Exception as e:
            return None, f"Login failed: {str(e)}"
        finally:
            db.close()
    
    
    @staticmethod
    def get_user_by_id(user_id: int):
        """
        Get user info by ID
        """
        db = SessionLocal()
        
        try:
            user = db.query(User).filter(
                User.id == user_id, 
                User.is_deleted == False
            ).first()
            
            if not user:
                return None, "User not found"
            
            user_dict = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'full_name': user.full_name,
                'roles': user.roles,  # ✅ Array of roles
                'created_at': user.created_at.isoformat()
            }
            
            return user_dict, None
            
        except Exception as e:
            return None, str(e)
        finally:
            db.close()
    
    
    # ✅ NEW: Assign role to user
    @staticmethod
    def assign_role(user_id: int, role_name: str, conference_id: int = None, assigned_by: int = None):
        """
        Assign a role to user (Admin only)
        
        Args:
            user_id: int - ID người nhận role
            role_name: str - 'Author', 'Reviewer', 'Chair', 'Admin'
            conference_id: int (optional) - Gán role cho conference cụ thể
            assigned_by: int - ID admin thực hiện gán
        
        Returns: (success: bool, message: str)
        """
        db = SessionLocal()
        
        try:
            # Check user exists
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return False, "User not found"
            
            # Check role exists
            role = db.query(Role).filter(Role.name == role_name).first()
            if not role:
                return False, f"Role '{role_name}' not found"
            
            # Check if already has this role
            existing = db.query(UserRole).filter(
                UserRole.user_id == user_id,
                UserRole.role_id == role.id,
                UserRole.conference_id == conference_id
            ).first()
            
            if existing:
                if existing.is_active:
                    return False, f"User already has role '{role_name}'"
                else:
                    # Reactivate
                    existing.is_active = True
                    existing.assigned_by = assigned_by
                    db.commit()
                    return True, f"Role '{role_name}' reactivated"
            
            # Create new UserRole
            user_role = UserRole(
                user_id=user_id,
                role_id=role.id,
                conference_id=conference_id,
                is_active=True,
                assigned_by=assigned_by
            )
            db.add(user_role)
            db.commit()
            
            # Audit log
            AuditLogAI.log(
                db_session=db,
                user_id=assigned_by or user_id,
                action_type='role_assigned',
                table_name='user_roles',
                record_id=user_id,
                data=json.dumps({
                    "user_id": user_id,
                    "role": role_name,
                    "conference_id": conference_id
                })
            )
            
            return True, f"Role '{role_name}' assigned successfully"
            
        except Exception as e:
            db.rollback()
            return False, f"Failed to assign role: {str(e)}"
        finally:
            db.close()
    
    
    # ✅ NEW: Revoke role from user
    @staticmethod
    def revoke_role(user_id: int, role_name: str, conference_id: int = None):
        """
        Revoke a role from user (Admin only)
        """
        db = SessionLocal()
        
        try:
            role = db.query(Role).filter(Role.name == role_name).first()
            if not role:
                return False, f"Role '{role_name}' not found"
            
            user_role = db.query(UserRole).filter(
                UserRole.user_id == user_id,
                UserRole.role_id == role.id,
                UserRole.conference_id == conference_id
            ).first()
            
            if not user_role:
                return False, "User does not have this role"
            
            # Soft delete
            user_role.is_active = False
            db.commit()
            
            return True, f"Role '{role_name}' revoked successfully"
            
        except Exception as e:
            db.rollback()
            return False, f"Failed to revoke role: {str(e)}"
        finally:
            db.close()