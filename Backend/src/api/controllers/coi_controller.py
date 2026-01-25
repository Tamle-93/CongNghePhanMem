"""
Backend/src/api/controllers/coi_controller.py
Conflict of Interest (COI) API Routes
"""

from flask import Blueprint, request, jsonify
from infrastructure.databases.base import SessionLocal
from infrastructure.models import ConflictOfInterest, User, Paper, AuditLog
from domain.utils.auth_utils import require_auth, require_role
from marshmallow import Schema, fields, ValidationError

coi_bp = Blueprint('coi', __name__)


class COIDeclareSchema(Schema):
    """Schema for COI declaration"""
    submission_id = fields.Int(required=True)
    reason = fields.Str(required=True)
    conference_id = fields.Int()


class COIQuerySchema(Schema):
    """Schema for COI query"""
    conference_id = fields.Int()
    submission_id = fields.Int()
    reviewer_id = fields.Int()
    page = fields.Int(load_default=1)
    per_page = fields.Int(load_default=10)


coi_declare_schema = COIDeclareSchema()
coi_query_schema = COIQuerySchema()


@coi_bp.route('/declare', methods=['POST'])
@require_auth
def declare_coi():
    """
    ✅ Declare conflict of interest for a paper
    Reviewers use this endpoint to declare COI for specific papers
    ---
    tags:
      - Conflict of Interest
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - submission_id
            - reason
          properties:
            submission_id:
              type: integer
              description: Paper ID
            reason:
              type: string
              description: Reason for COI (e.g., "Author is my colleague", "Previous collaborator")
            conference_id:
              type: integer
              description: Conference ID (optional, inferred from paper if not provided)
    responses:
      201:
        description: COI declared successfully
      400:
        description: Validation error or paper not found
      403:
        description: Not authorized
    """
    db = SessionLocal()
    
    try:
        data = coi_declare_schema.load(request.json)
        reviewer_id = request.current_user['user_id']
        submission_id = data['submission_id']
        reason = data['reason']
        
        # Verify paper exists
        paper = db.query(Paper).filter(Paper.id == submission_id).first()
        if not paper:
            return jsonify({
                'status': 'error',
                'message': 'Paper not found'
            }), 404
        
        conference_id = data.get('conference_id') or paper.conference_id
        
        # Check if COI already exists
        existing_coi = db.query(ConflictOfInterest).filter(
            ConflictOfInterest.reviewer_id == reviewer_id,
            ConflictOfInterest.paper_id == submission_id,
            ConflictOfInterest.conference_id == conference_id
        ).first()
        
        if existing_coi:
            # Update existing COI
            existing_coi.reason = reason
            db.commit()
            coi_id = existing_coi.id
        else:
            # Create new COI
            coi = ConflictOfInterest(
                reviewer_id=reviewer_id,
                paper_id=submission_id,
                conference_id=conference_id,
                reason=reason
            )
            db.add(coi)
            db.commit()
            coi_id = coi.id
        
        # Log to audit
        AuditLog.log_action(
            db_session=db,
            user_id=reviewer_id,
            action='COI_DECLARED',
            entity_type='ConflictOfInterest',
            entity_id=coi_id,
            changes={'paper_id': submission_id, 'reason': reason}
        )
        
        return jsonify({
            'status': 'success',
            'message': 'Conflict of interest declared successfully',
            'data': {
                'coi_id': coi_id,
                'paper_id': submission_id,
                'reviewer_id': reviewer_id,
                'reason': reason
            }
        }), 201
        
    except ValidationError as e:
        return jsonify({
            'status': 'error',
            'message': 'Validation error',
            'errors': e.messages
        }), 400
    except Exception as e:
        db.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        db.close()


@coi_bp.route('', methods=['GET'])
@require_auth
@require_role(['Chair', 'Admin'])
def list_cois():
    """
    List conflicts of interest
    Chair/Admin can view all COIs
    ---
    tags:
      - Conflict of Interest
    parameters:
      - name: conference_id
        in: query
        type: integer
      - name: submission_id
        in: query
        type: integer
      - name: reviewer_id
        in: query
        type: integer
      - name: page
        in: query
        type: integer
      - name: per_page
        in: query
        type: integer
    responses:
      200:
        description: COI list retrieved
    """
    db = SessionLocal()
    
    try:
        args = coi_query_schema.load(request.args)
        
        query = db.query(ConflictOfInterest)
        
        if 'conference_id' in args and args['conference_id']:
            query = query.filter(ConflictOfInterest.conference_id == args['conference_id'])
        
        if 'submission_id' in args and args['submission_id']:
            query = query.filter(ConflictOfInterest.paper_id == args['submission_id'])
        
        if 'reviewer_id' in args and args['reviewer_id']:
            query = query.filter(ConflictOfInterest.reviewer_id == args['reviewer_id'])
        
        total = query.count()
        
        page = args.get('page', 1)
        per_page = args.get('per_page', 10)
        
        cois = query.order_by(ConflictOfInterest.created_at.desc())\
                    .limit(per_page)\
                    .offset((page - 1) * per_page)\
                    .all()
        
        data = [{
            'id': coi.id,
            'paper_id': coi.paper_id,
            'paper_title': coi.paper.title if coi.paper else None,
            'reviewer_id': coi.reviewer_id,
            'reviewer_name': coi.reviewer.full_name if coi.reviewer else None,
            'conference_id': coi.conference_id,
            'reason': coi.reason,
            'created_at': coi.created_at.isoformat()
        } for coi in cois]
        
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


@coi_bp.route('/<int:coi_id>', methods=['DELETE'])
@require_auth
@require_role(['Chair', 'Admin'])
def delete_coi(coi_id):
    """Delete a COI declaration"""
    db = SessionLocal()
    
    try:
        coi = db.query(ConflictOfInterest).filter(ConflictOfInterest.id == coi_id).first()
        
        if not coi:
            return jsonify({
                'status': 'error',
                'message': 'COI not found'
            }), 404
        
        db.delete(coi)
        db.commit()
        
        # Log deletion
        AuditLog.log_action(
            db_session=db,
            user_id=request.current_user['user_id'],
            action='COI_DELETED',
            entity_type='ConflictOfInterest',
            entity_id=coi_id,
            changes={'paper_id': coi.paper_id}
        )
        
        return jsonify({
            'status': 'success',
            'message': 'COI deleted successfully'
        }), 200
        
    except Exception as e:
        db.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        db.close()
