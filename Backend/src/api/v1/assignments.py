"""
Backend/src/api/v1/assignments.py
Assignment API Routes
"""

from flask import Blueprint, request, jsonify
from domain.services.assignment_service import AssignmentService
from domain.schemas.assignment_schema import (
    AssignmentCreateSchema, AssignmentResponseSchema
)
from domain.utils.auth_utils import require_auth, require_role
from marshmallow import ValidationError

assignments_bp = Blueprint('assignments', __name__, url_prefix='/assignments')

create_schema = AssignmentCreateSchema()
response_schema = AssignmentResponseSchema()

@assignments_bp.route('', methods=['POST'])
@require_auth
@require_role('Chair', 'Admin')
def create_assignment():
    """
    Create reviewer assignment
    ---
    POST /api/v1/assignments
    Headers: Authorization: Bearer <token>
    Body:
    {
        "conference_id": 1,
        "paper_id": 5,
        "reviewer_id": 3
    }
    """
    try:
        data = create_schema.load(request.json)
        
        assignment, error = AssignmentService.create_assignment(
            conference_id=data['conference_id'],
            paper_id=data['paper_id'],
            reviewer_id=data['reviewer_id'],
            chair_user_id=request.current_user['user_id']
        )
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({
            'status': 'success',
            'message': 'Assignment created successfully',
            'data': assignment
        }), 201
        
    except ValidationError as e:
        return jsonify({'status': 'error', 'errors': e.messages}), 400
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@assignments_bp.route('/paper/<int:paper_id>', methods=['GET'])
@require_auth
def get_paper_assignments(paper_id):
    """Get all assignments for a paper"""
    try:
        assignments, error = AssignmentService.get_assignments_for_paper(paper_id)
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({
            'status': 'success',
            'data': {
                'paper_id': paper_id,
                'assignments': assignments
            }
        }), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@assignments_bp.route('/reviewer/<int:reviewer_id>', methods=['GET'])
@require_auth
def get_reviewer_assignments(reviewer_id):
    """Get all assignments for a reviewer"""
    try:
        # Check permission
        if request.current_user['user_id'] != reviewer_id:
            user_role = request.current_user['role']
            if user_role not in ['Chair', 'Admin']:
                return jsonify({'status': 'error', 'message': 'Permission denied'}), 403
        
        conference_id = request.args.get('conference_id', type=int)
        
        assignments, error = AssignmentService.get_assignments_for_reviewer(
            reviewer_id, 
            conference_id
        )
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({
            'status': 'success',
            'data': {
                'reviewer_id': reviewer_id,
                'assignments': assignments
            }
        }), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@assignments_bp.route('/my-assignments', methods=['GET'])
@require_auth
def get_my_assignments():
    """Get assignments for current user (reviewer)"""
    try:
        conference_id = request.args.get('conference_id', type=int)
        
        assignments, error = AssignmentService.get_assignments_for_reviewer(
            request.current_user['user_id'],
            conference_id
        )
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({'status': 'success', 'data': assignments}), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@assignments_bp.route('/conference/<int:conference_id>', methods=['GET'])
@require_auth
@require_role('Chair', 'Admin')
def get_conference_assignments(conference_id):
    """Get all assignments in a conference"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        result, error = AssignmentService.get_assignments_for_conference(
            conference_id,
            page,
            per_page
        )
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({'status': 'success', 'data': result}), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@assignments_bp.route('/<int:assignment_id>', methods=['PUT'])
@require_auth
@require_role('Chair', 'Admin')
def update_assignment(assignment_id):
    """Update assignment (change reviewer, status)"""
    try:
        data = request.json
        
        assignment, error = AssignmentService.update_assignment(
            assignment_id,
            request.current_user['user_id'],
            **data
        )
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({
            'status': 'success',
            'message': 'Assignment updated successfully',
            'data': assignment
        }), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@assignments_bp.route('/<int:assignment_id>', methods=['DELETE'])
@require_auth
@require_role('Chair', 'Admin')
def delete_assignment(assignment_id):
    """Delete assignment"""
    try:
        success, error = AssignmentService.delete_assignment(
            assignment_id,
            request.current_user['user_id']
        )
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({
            'status': 'success',
            'message': 'Assignment deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@assignments_bp.route('/conflict', methods=['POST'])
@require_auth
def declare_conflict():
    """
    Reviewer declares conflict of interest
    ---
    POST /api/v1/assignments/conflict
    Body:
    {
        "paper_id": 5,
        "reason": "Co-author relationship"
    }
    """
    try:
        data = request.json
        paper_id = data.get('paper_id')
        reason = data.get('reason', '')
        
        if not paper_id:
            return jsonify({'status': 'error', 'message': 'paper_id required'}), 400
        
        conflict, error = AssignmentService.declare_conflict(
            paper_id,
            request.current_user['user_id'],
            reason
        )
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({
            'status': 'success',
            'message': 'Conflict declared successfully',
            'data': conflict
        }), 201
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@assignments_bp.route('/conference/<int:conference_id>/progress', methods=['GET'])
@require_auth
@require_role('Chair', 'Admin')
def get_review_progress(conference_id):
    """Get review progress statistics"""
    try:
        progress, error = AssignmentService.get_review_progress(conference_id)
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({'status': 'success', 'data': progress}), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500