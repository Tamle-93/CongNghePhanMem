"""
Backend/src/api/v1/decisions.py
Decision API Routes
"""

from flask import Blueprint, request, jsonify
from domain.services.decision_service import DecisionService
from domain.schemas.decision_schema import (
    DecisionCreateSchema, DecisionResponseSchema
)
from domain.utils.auth_utils import require_auth, require_role
from marshmallow import ValidationError

decisions_bp = Blueprint('decisions', __name__)

create_schema = DecisionCreateSchema()
response_schema = DecisionResponseSchema()

@decisions_bp.route('', methods=['POST'])
@require_auth
@require_role('Chair', 'Admin')
def make_decision():
    """
    Make decision on a paper
    ---
    POST /api/v1/decisions
    Headers: Authorization: Bearer <token>
    Body:
    {
        "paper_id": 5,
        "result": "Accept",  // Accept, Reject, Revision
        "final_comment": "Congratulations! Your paper is accepted..."
    }
    """
    try:
        data = create_schema.load(request.json)
        
        decision, error = DecisionService.make_decision(
            paper_id=data['paper_id'],
            chair_user_id=request.current_user['user_id'],
            result=data['result'],
            final_comment=data.get('final_comment', '')
        )
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({
            'status': 'success',
            'message': 'Decision made successfully',
            'data': decision
        }), 201
        
    except ValidationError as e:
        return jsonify({'status': 'error', 'errors': e.messages}), 400
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@decisions_bp.route('/paper/<int:paper_id>', methods=['GET'])
@require_auth
def get_paper_decision(paper_id):
    """Get decision for a specific paper"""
    try:
        decision, error = DecisionService.get_decision(paper_id)
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 404
        
        return jsonify({'status': 'success', 'data': decision}), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@decisions_bp.route('/paper/<int:paper_id>/summary', methods=['GET'])
@require_auth
def get_paper_decision_summary(paper_id):
    """Get comprehensive decision summary with reviews"""
    try:
        summary, error = DecisionService.get_paper_decision_summary(paper_id)
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 404
        
        return jsonify({'status': 'success', 'data': summary}), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@decisions_bp.route('/conference/<int:conference_id>', methods=['GET'])
@require_auth
@require_role('Chair', 'Admin')
def get_conference_decisions(conference_id):
    """Get all decisions for a conference"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        result, error = DecisionService.get_conference_decisions(
            conference_id,
            page,
            per_page
        )
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({'status': 'success', 'data': result}), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@decisions_bp.route('/conference/<int:conference_id>/statistics', methods=['GET'])
@require_auth
@require_role('Chair', 'Admin')
def get_decision_statistics(conference_id):
    """Get decision statistics for a conference"""
    try:
        stats, error = DecisionService.get_decision_statistics(conference_id)
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({'status': 'success', 'data': stats}), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@decisions_bp.route('/conference/<int:conference_id>/notify', methods=['POST'])
@require_auth
@require_role('Chair', 'Admin')
def bulk_notify_authors(conference_id):
    """
    Send bulk notifications to all authors with decisions
    ---
    POST /api/v1/decisions/conference/{conference_id}/notify
    
    Returns list of notifications to be sent
    (Actual email sending should be implemented separately)
    """
    try:
        result, error = DecisionService.bulk_notify_authors(
            conference_id,
            request.current_user['user_id']
        )
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({
            'status': 'success',
            'message': f'{result["notification_count"]} notifications prepared',
            'data': result
        }), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
