"""
Backend/src/domain/schemas/submission_version_schema.py
Submission Version Schema - Marshmallow validation
"""

from marshmallow import Schema, fields, validate


class SubmissionVersionSchema(Schema):
    """Schema for submission versions"""
    
    id = fields.Int(dump_only=True)
    paper_id = fields.Int(required=True)
    version = fields.Int(dump_only=True)
    file_path = fields.Str(dump_only=True)
    file_size = fields.Int(dump_only=True)
    title = fields.Str()
    abstract = fields.Str()
    keywords = fields.Str()
    change_notes = fields.Str()
    created_at = fields.DateTime(dump_only=True)
    created_by = fields.Int()


class SubmissionVersionListSchema(Schema):
    """Schema for listing submission versions"""
    
    versions = fields.List(fields.Nested(SubmissionVersionSchema))
    total = fields.Int()
