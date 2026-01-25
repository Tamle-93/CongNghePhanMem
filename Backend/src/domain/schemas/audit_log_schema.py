"""
Backend/src/domain/schemas/audit_log_schema.py
Audit Log Schema - Marshmallow validation
"""

from marshmallow import Schema, fields


class AuditLogSchema(Schema):
    """Schema for audit logs"""
    
    id = fields.Int(dump_only=True)
    user_id = fields.Int()
    action = fields.Str(required=True)
    entity_type = fields.Str(required=True)
    entity_id = fields.Int()
    changes = fields.Dict()
    status = fields.Str()
    error_message = fields.Str()
    ip_address = fields.Str()
    user_agent = fields.Str()
    timestamp = fields.DateTime(dump_only=True)
    description = fields.Str()


class AuditLogListSchema(Schema):
    """Schema for listing audit logs"""
    
    logs = fields.List(fields.Nested(AuditLogSchema))
    total = fields.Int()
    page = fields.Int()
    per_page = fields.Int()


class AuditLogFilterSchema(Schema):
    """Schema for filtering audit logs"""
    
    user_id = fields.Int()
    action = fields.Str()
    entity_type = fields.Str()
    entity_id = fields.Int()
    status = fields.Str()
    start_date = fields.DateTime()
    end_date = fields.DateTime()
    page = fields.Int(load_default=1)
    per_page = fields.Int(load_default=10)
