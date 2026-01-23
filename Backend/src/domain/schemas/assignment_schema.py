"""Assignment Schemas"""
from marshmallow import Schema, fields

class AssignmentCreateSchema(Schema):
    paper_id = fields.Int(required=True)
    reviewer_id = fields.Int(required=True)
    conference_id = fields.Int(required=True)

class AssignmentResponseSchema(Schema):
    id = fields.Int(dump_only=True)
    paper_id = fields.Int()
    reviewer_id = fields.Int()
    conference_id = fields.Int()
    status = fields.Str()
    assigned_at = fields.DateTime(dump_only=True)
