"""
Backend/src/domain/schemas/feature_flag_schema.py
Feature Flag Schema - Marshmallow validation
"""

from marshmallow import Schema, fields


class FeatureFlagSchema(Schema):
    """Schema for feature flags"""
    
    id = fields.Int(dump_only=True)
    conference_id = fields.Int(required=True)
    feature_name = fields.Str(required=True)
    enabled = fields.Bool(required=True)
    config = fields.Str()
    description = fields.Str()
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class FeatureFlagToggleSchema(Schema):
    """Schema for toggling feature flags"""
    
    conference_id = fields.Int(required=True)
    feature_name = fields.Str(required=True)
    enabled = fields.Bool(required=True)
    config = fields.Str()


class FeatureFlagListSchema(Schema):
    """Schema for listing feature flags"""
    
    flags = fields.List(fields.Nested(FeatureFlagSchema))
    total = fields.Int()
