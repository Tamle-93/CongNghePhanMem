# ============================================
# File: Backend/src/domain/schemas/paper_schema.py
# ============================================
"""
Paper Schemas
"""

from marshmallow import Schema, fields, validate

class PaperSubmissionSchema(Schema):
    """Schema for paper submission"""
    title = fields.Str(required=True, validate=validate.Length(min=5, max=500))
    abstract = fields.Str(required=True, validate=validate.Length(min=50, max=10000))
    keywords = fields.Str()
    conference_id = fields.Int(required=True)
    track_id = fields.Int(allow_none=True)
    authors = fields.List(fields.Dict(), required=True)
    # authors format: [{"name": "...", "email": "...", "order": 1, "is_corresponding": True, "affiliation": "UTH"}]
    # OR [{"user_id": 1, "order": 1, "is_corresponding": True, "affiliation": "UTH"}]

class PaperResponseSchema(Schema):
    """Schema for paper response"""
    id = fields.Int(dump_only=True)
    title = fields.Str()
    abstract = fields.Str()
    keywords = fields.Str()
    status = fields.Str()
    submitter_id = fields.Int()
    conference_id = fields.Int()
    track_id = fields.Int()
    pdf_path = fields.Str()
    created_at = fields.DateTime(dump_only=True)

class PaperUpdateSchema(Schema):
    """Schema for updating paper"""
    title = fields.Str(validate=validate.Length(min=10, max=500))
    abstract = fields.Str(validate=validate.Length(min=100, max=5000))
    keywords = fields.Str()
    track_id = fields.Int()
