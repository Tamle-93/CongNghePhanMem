"""
Backend/src/api/controllers/audit_controller.py
Audit Log API Routes - for compliance and system monitoring
"""

from flask import Blueprint, request, jsonify
from infrastructure.databases.base import SessionLocal
from infrastructure.models import AuditLog, User
from domain.utils.auth_utils import require_auth, require_role
from marshmallow import Schema, fields, ValidationError
from datetime import datetime

audit_bp = Blueprint('audit', __name__)


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
    per_page = fields.Int(load_default=20)


audit_filter_schema = AuditLogFilterSchema()


@audit_bp.route('', methods=['GET'])
@require_auth
@require_role(['Chair', 'Admin'])
def get_audit_logs():
    """
    ✅ Get audit logs with filtering
    Only accessible by Chair and Admin roles
    ---
    tags:
      - Audit
    parameters:
      - name: user_id
        in: query
        type: integer
      - name: action
        in: query
        type: string
        description: Filter by action (e.g., PAPER_SUBMITTED, USER_LOGIN)
      - name: entity_type
        in: query
        type: string
        description: Filter by entity type (e.g., Paper, User, Review)
      - name: entity_id
        in: query
        type: integer
      - name: status
        in: query
        type: string
        description: Filter by status (success, failure, partial)
      - name: start_date
        in: query
        type: string
        format: date-time
        description: Start date for range query (ISO 8601)
      - name: end_date
        in: query
        type: string
        format: date-time
        description: End date for range query (ISO 8601)
      - name: page
        in: query
        type: integer
        default: 1
      - name: per_page
        in: query
        type: integer
        default: 20
    responses:
      200:
        description: Audit logs retrieved successfully
        schema:
          type: object
          properties:
            status:
              type: string
            data:
              type: array
            pagination:
              type: object
      401:
        description: Unauthorized (insufficient role)
    """
    db = SessionLocal()
    
    try:
        # Parse and validate filters
        filters = {}
        if request.args.get('user_id'):
            filters['user_id'] = int(request.args.get('user_id'))
        if request.args.get('action'):
            filters['action'] = request.args.get('action')
        if request.args.get('entity_type'):
            filters['entity_type'] = request.args.get('entity_type')
        if request.args.get('entity_id'):
            filters['entity_id'] = int(request.args.get('entity_id'))
        if request.args.get('status'):
            filters['status'] = request.args.get('status')
        
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        
        # Build query
        query = db.query(AuditLog)
        
        if 'user_id' in filters:
            query = query.filter(AuditLog.user_id == filters['user_id'])
        
        if 'action' in filters:
            query = query.filter(AuditLog.action == filters['action'])
        
        if 'entity_type' in filters:
            query = query.filter(AuditLog.entity_type == filters['entity_type'])
        
        if 'entity_id' in filters:
            query = query.filter(AuditLog.entity_id == filters['entity_id'])
        
        if 'status' in filters:
            query = query.filter(AuditLog.status == filters['status'])
        
        # Date range filtering
        if request.args.get('start_date'):
            try:
                start_date = datetime.fromisoformat(request.args.get('start_date'))
                query = query.filter(AuditLog.timestamp >= start_date)
            except ValueError:
                return jsonify({
                    'status': 'error',
                    'message': 'Invalid start_date format (use ISO 8601)'
                }), 400
        
        if request.args.get('end_date'):
            try:
                end_date = datetime.fromisoformat(request.args.get('end_date'))
                query = query.filter(AuditLog.timestamp <= end_date)
            except ValueError:
                return jsonify({
                    'status': 'error',
                    'message': 'Invalid end_date format (use ISO 8601)'
                }), 400
        
        total = query.count()
        
        # Pagination
        logs = query.order_by(AuditLog.timestamp.desc())\
                    .limit(per_page)\
                    .offset((page - 1) * per_page)\
                    .all()
        
        # Serialize logs
        data = [{
            'id': log.id,
            'user_id': log.user_id,
            'user_name': log.user.full_name if log.user else 'System',
            'action': log.action,
            'entity_type': log.entity_type,
            'entity_id': log.entity_id,
            'changes': log.changes,
            'status': log.status,
            'error_message': log.error_message,
            'ip_address': log.ip_address,
            'timestamp': log.timestamp.isoformat(),
            'description': log.description
        } for log in logs]
        
        return jsonify({
            'status': 'success',
            'data': data,
            'pagination': {
                'total': total,
                'page': page,
                'per_page': per_page,
                'pages': (total + per_page - 1) // per_page
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        db.close()


@audit_bp.route('/summary', methods=['GET'])
@require_auth
@require_role(['Chair', 'Admin'])
def get_audit_summary():
    """
    ✅ Get audit summary statistics
    ---
    tags:
      - Audit
    parameters:
      - name: days
        in: query
        type: integer
        default: 7
        description: Number of days to include in summary
    responses:
      200:
        description: Summary statistics
    """
    db = SessionLocal()
    
    try:
        days = int(request.args.get('days', 7))
        
        # Get logs from last N days
        from datetime import timedelta
        start_time = datetime.utcnow() - timedelta(days=days)
        
        logs = db.query(AuditLog).filter(
            AuditLog.timestamp >= start_time
        ).all()
        
        # Aggregate statistics
        actions = {}
        statuses = {'success': 0, 'failure': 0, 'partial': 0}
        users_count = set()
        
        for log in logs:
            # Count by action
            actions[log.action] = actions.get(log.action, 0) + 1
            
            # Count by status
            if log.status in statuses:
                statuses[log.status] += 1
            
            # Count unique users
            if log.user_id:
                users_count.add(log.user_id)
        
        return jsonify({
            'status': 'success',
            'data': {
                'period_days': days,
                'total_logs': len(logs),
                'actions': actions,
                'statuses': statuses,
                'active_users': len(users_count),
                'top_actions': sorted(
                    actions.items(),
                    key=lambda x: x[1],
                    reverse=True
                )[:5]
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        db.close()
