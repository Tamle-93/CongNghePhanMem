# ============================================
# File: Backend/src/domain/schemas/review_schema.py
# ============================================
"""
Review Schemas
"""

from marshmallow import Schema, fields, validate

class ReviewSubmissionSchema(Schema):
    """Schema for submitting a review"""
    assignment_id = fields.Int(required=False)  # Optional - can use paper_id instead
    paper_id = fields.Int(required=False)  # Alternative to assignment_id
    score = fields.Int(
        required=True,
        validate=validate.Range(min=1, max=10, error="Score must be between 1 and 10")
    )
    comments_for_author = fields.Str()
    confidential_content = fields.Str()

class ReviewResponseSchema(Schema):
    """Schema for review response"""
    id = fields.Int(dump_only=True)
    assignment_id = fields.Int()
    paper_id = fields.Int()
    score = fields.Int()
    comments_for_author = fields.Str()
    confidential_content = fields.Str()
    created_at = fields.DateTime(dump_only=True)
