"""
Backend/src/api/controllers/assignments_controller.py
Assignment API Routes - WITH AUTO-ASSIGNMENT
"""
from flask import Blueprint, request, jsonify
from domain.services.assignment_service import AssignmentService
from domain.services.auto_assignment_service import AutoAssignmentService
from domain.schemas.assignment_schema import (
    AssignmentCreateSchema, AssignmentResponseSchema
)
from domain.utils.auth_utils import require_auth, require_role
from marshmallow import ValidationError
from settings.rate_limit_config import limiter

assignments_bp = Blueprint('assignments', __name__)

create_schema = AssignmentCreateSchema()
response_schema = AssignmentResponseSchema()

@assignments_bp.route('/my-assignments', methods=['GET'])
@require_auth
@require_role('Reviewer')
def get_my_assignments():
    """
    Get assignments for current reviewer
    ---
    tags:
      - Assignments
    security:
      - Bearer: []
    parameters:
      - in: query
        name: status
        type: string
        required: false
        description: Filter by status (pending, in_progress, completed)
      - in: query
        name: conference_id
        type: integer
        required: false
        description: Filter by conference
    responses:
      200:
        description: List of assignments
    """
    try:
        reviewer_id = request.current_user['user_id']
        status_filter = request.args.get('status')
        conference_id = request.args.get('conference_id', type=int)
        
        assignments, error = AssignmentService.get_reviewer_assignments(
            reviewer_id=reviewer_id,
            status=status_filter,
            conference_id=conference_id
        )
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({
            'status': 'success',
            'data': {'assignments': assignments}
        }), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@assignments_bp.route('', methods=['POST'])
@require_auth
@require_role('Chair', 'Admin')
@limiter.limit("30 per minute")
def create_assignment():
    """
    Create reviewer assignment(s) - supports single or multiple reviewers
    ---
    Body:
    {
        "conference_id": 1,
        "paper_id": 123,
        "reviewer_id": 5  // single reviewer
    }
    OR
    {
        "paper_id": 123,
        "reviewer_ids": [5, 6, 7]  // multiple reviewers
    }
    """
    try:
        data = request.json
        paper_id = data.get('paper_id')
        
        if not paper_id:
            return jsonify({'status': 'error', 'message': 'paper_id is required'}), 400
        
        # Get conference_id from paper
        from infrastructure.databases.base import SessionLocal
        from infrastructure.models import Paper
        db = SessionLocal()
        try:
            paper = db.query(Paper).filter(Paper.id == paper_id).first()
            if not paper:
                return jsonify({'status': 'error', 'message': 'Paper not found'}), 404
            conference_id = paper.conference_id
        finally:
            db.close()
        
        # Handle both single reviewer_id and multiple reviewer_ids
        reviewer_ids = data.get('reviewer_ids', [])
        if not reviewer_ids and data.get('reviewer_id'):
            reviewer_ids = [data.get('reviewer_id')]
        
        if not reviewer_ids:
            return jsonify({'status': 'error', 'message': 'reviewer_id or reviewer_ids required'}), 400
        
        # Create assignments for all reviewers
        assignments = []
        errors = []
        
        for reviewer_id in reviewer_ids:
            assignment, error = AssignmentService.create_assignment(
                conference_id=conference_id,
                paper_id=paper_id,
                reviewer_id=reviewer_id,
                chair_user_id=request.current_user['user_id']
            )
            
            if error:
                errors.append(f"Reviewer {reviewer_id}: {error}")
            else:
                assignments.append(assignment)
        
        if errors and not assignments:
            return jsonify({'status': 'error', 'message': '; '.join(errors)}), 400
        
        return jsonify({
            'status': 'success',
            'message': f'Created {len(assignments)} assignment(s)' + (f' ({len(errors)} failed)' if errors else ''),
            'data': {
                'assignments': assignments,
                'errors': errors if errors else None
            }
        }), 201
        
    except ValidationError as e:
        return jsonify({'status': 'error', 'errors': e.messages}), 400
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@assignments_bp.route('/auto-assign', methods=['POST'])
@require_auth
@require_role('Chair', 'Admin')
@limiter.limit("10 per hour")
def auto_assign_reviewers():
    """
    Auto-assign reviewers to papers
    ---
    tags:
      - Assignments
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        schema:
          type: object
          required:
            - conference_id
          properties:
            conference_id:
              type: integer
              example: 1
            papers_per_reviewer:
              type: integer
              default: 3
              example: 3
            reviewers_per_paper:
              type: integer
              default: 3
              example: 3
    responses:
      200:
        description: Auto-assignment completed
        schema:
          type: object
          properties:
            status:
              type: string
            message:
              type: string
            data:
              type: object
              properties:
                assignments:
                  type: array
                statistics:
                  type: object
                errors:
                  type: array
      400:
        description: Error
    """
    try:
        data = request.json
        conference_id = data.get('conference_id')
        papers_per_reviewer = data.get('papers_per_reviewer', 3)
        reviewers_per_paper = data.get('reviewers_per_paper', 3)
        
        if not conference_id:
            return jsonify({'status': 'error', 'message': 'conference_id is required'}), 400
        
        assignments, stats, errors = AutoAssignmentService.auto_assign_reviewers(
            conference_id=conference_id,
            papers_per_reviewer=papers_per_reviewer,
            reviewers_per_paper=reviewers_per_paper
        )
        
        if assignments is None:
            return jsonify({'status': 'error', 'message': errors}), 400
        
        return jsonify({
            'status': 'success',
            'message': f'Auto-assignment completed: {len(assignments)} assignments created',
            'data': {
                'assignments': assignments,
                'statistics': stats,
                'errors': errors
            }
        }), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@assignments_bp.route('/suggestions/<int:paper_id>', methods=['GET'])
@require_auth
@require_role('Chair', 'Admin')
def get_reviewer_suggestions(paper_id):
    """
    Get reviewer suggestions for a paper
    ---
    tags:
      - Assignments
    security:
      - Bearer: []
    parameters:
      - in: path
        name: paper_id
        type: integer
        required: true
      - in: query
        name: limit
        type: integer
        default: 10
    responses:
      200:
        description: Reviewer suggestions
    """
    try:
        limit = request.args.get('limit', 10, type=int)
        
        suggestions, error = AutoAssignmentService.get_assignment_suggestions(
            paper_id=paper_id,
            limit=limit
        )
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({
            'status': 'success',
            'data': {
                'paper_id': paper_id,
                'suggestions': suggestions
            }
        }), 200
        
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
@limiter.limit("20 per hour")
def declare_conflict():
    """
    Reviewer declares conflict of interest
    ---
    tags:
      - Assignments
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        schema:
          type: object
          required:
            - paper_id
          properties:
            paper_id:
              type: integer
            reason:
              type: string
    responses:
      201:
        description: Conflict declared
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