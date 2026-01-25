"""Decision Schemas"""
from marshmallow import Schema, fields, validate

class DecisionCreateSchema(Schema):
    paper_id = fields.Int(required=True)
    result = fields.Str(required=True, validate=validate.OneOf(['Accept', 'Reject', 'Revision']))
    final_comment = fields.Str()

class DecisionResponseSchema(Schema):
    id = fields.Int(dump_only=True)
    paper_id = fields.Int()
    result = fields.Str()
    final_comment = fields.Str()
    chair_user_id = fields.Int()
    created_at = fields.DateTime(dump_only=True)
