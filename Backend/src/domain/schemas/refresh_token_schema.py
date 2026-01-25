"""
Backend/src/domain/schemas/refresh_token_schema.py
Refresh Token Schema - Marshmallow validation
"""

from marshmallow import Schema, fields


class RefreshTokenRequestSchema(Schema):
    """Schema for refresh token request"""
    
    refresh_token = fields.Str(required=True)


class RefreshTokenResponseSchema(Schema):
    """Schema for refresh token response"""
    
    access_token = fields.Str()
    token_type = fields.Str()
    expires_in = fields.Int()
