# ============================================
# File: Backend/src/domain/schemas/conference_schema.py
# ============================================
"""
Conference Schemas
"""

from marshmallow import Schema, fields, validate, validates_schema, ValidationError
from datetime import datetime

class ConferenceCreateSchema(Schema):
    """Schema for creating a conference"""
    name = fields.Str(required=True, validate=validate.Length(min=5, max=255))
    description = fields.Str()
    submission_deadline = fields.DateTime(required=True)
    review_deadline = fields.DateTime(required=True)
    start_date = fields.DateTime()
    end_date = fields.DateTime()
    is_blind_review = fields.Bool(load_default=True)
    
    @validates_schema
    def validate_dates(self, data, **kwargs):
        """Validate date logic"""
        if data.get('submission_deadline') and data.get('review_deadline'):
            if data['review_deadline'] <= data['submission_deadline']:
                raise ValidationError(
                    "Review deadline must be after submission deadline",
                    'review_deadline'
                )
        
        if data.get('start_date') and data.get('end_date'):
            if data['end_date'] <= data['start_date']:
                raise ValidationError(
                    "End date must be after start date",
                    'end_date'
                )

class ConferenceResponseSchema(Schema):
    """Schema for conference response"""
    id = fields.Int(dump_only=True)
    name = fields.Str()
    description = fields.Str()
    chair_id = fields.Int()
    submission_deadline = fields.DateTime()
    review_deadline = fields.DateTime()
    start_date = fields.DateTime()
    end_date = fields.DateTime()
    is_blind_review = fields.Bool()
    created_at = fields.DateTime(dump_only=True)

class TrackCreateSchema(Schema):
    """Schema for creating a track"""
    name = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    code = fields.Str(required=True, validate=validate.Length(min=2, max=20))
    conference_id = fields.Int(required=True)
