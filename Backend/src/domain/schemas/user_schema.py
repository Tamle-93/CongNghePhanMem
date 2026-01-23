# Backend/src/domain/schemas/user_schema.py
"""
User Schemas for API - FIXED with roles
"""
from marshmallow import Schema, fields, validate, validates, ValidationError
import re


class UserRegistrationSchema(Schema):
    """Schema for user registration"""
    username = fields.Str(
        required=True,
        validate=validate.Length(min=3, max=50)
    )
    password = fields.Str(
        required=True,
        validate=validate.Length(min=8)
    )
    email = fields.Email(required=True)
    full_name = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=100)
    )
    roles = fields.List(
        fields.Str(),
        missing=['Author']  # Default role
    )
    
    @validates('password')
    def validate_password(self, value):
        """Validate password strength"""
        if not re.search(r'[A-Z]', value):
            raise ValidationError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', value):
            raise ValidationError('Password must contain at least one lowercase letter')
        if not re.search(r'[0-9]', value):
            raise ValidationError('Password must contain at least one digit')
        if not re.search(r'[@$!%*?&#]', value):
            raise ValidationError('Password must contain at least one special character')


class UserLoginSchema(Schema):
    """Schema for user login"""
    username = fields.Str(required=True)
    password = fields.Str(required=True)


class UserResponseSchema(Schema):
    """
    Schema for user response - CRITICAL FIX
    Must include roles!
    """
    id = fields.Int(dump_only=True)
    username = fields.Str()
    email = fields.Email()
    full_name = fields.Str()
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    
    # ✅ CRITICAL: Include roles field
    roles = fields.Method("get_roles")
    
    def get_roles(self, obj):
        """
        Extract roles from user object
        
        Args:
            obj: User object with user_roles relationship
            
        Returns:
            List[str]: List of role names
        """
        # Method 1: If user has @property roles
        if hasattr(obj, 'roles'):
            return obj.roles
        
        # Method 2: Manual extraction from user_roles
        if hasattr(obj, 'user_roles'):
            return [ur.role.name for ur in obj.user_roles if ur.is_active]
        
        # Fallback
        return []


class UserUpdateSchema(Schema):
    """Schema for updating user information"""
    full_name = fields.Str(
        validate=validate.Length(min=2, max=100),
        required=False
    )
    email = fields.Email(required=False)
    password = fields.Str(
        validate=validate.Length(min=8),
        required=False
    )
    
    @validates('password')
    def validate_password(self, value):
        """Validate password strength"""
        if not re.search(r'[A-Z]', value):
            raise ValidationError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', value):
            raise ValidationError('Password must contain at least one lowercase letter')
        if not re.search(r'[0-9]', value):
            raise ValidationError('Password must contain at least one digit')
        if not re.search(r'[@$!%*?&#]', value):
            raise ValidationError('Password must contain at least one special character')


class ChangePasswordSchema(Schema):
    """Schema for changing password"""
    current_password = fields.Str(required=True)
    new_password = fields.Str(
        required=True,
        validate=validate.Length(min=8)
    )
    confirm_password = fields.Str(required=True)
    
    @validates('new_password')
    def validate_new_password(self, value):
        """Validate new password strength"""
        if not re.search(r'[A-Z]', value):
            raise ValidationError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', value):
            raise ValidationError('Password must contain at least one lowercase letter')
        if not re.search(r'[0-9]', value):
            raise ValidationError('Password must contain at least one digit')
        if not re.search(r'[@$!%*?&#]', value):
            raise ValidationError('Password must contain at least one special character')