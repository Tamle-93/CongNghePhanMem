4
# ============================================
# File: Backend/src/api/controllers/conferences_controller.py
# ============================================
"""
Conference API Routes
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
from domain.services.conference_service import ConferenceService
from domain.schemas.conference_schema import (
    ConferenceCreateSchema, ConferenceResponseSchema, TrackCreateSchema
)
from domain.utils.auth_utils import require_auth, require_role
from marshmallow import ValidationError
from infrastructure.databases.postgres import db

conferences_bp = Blueprint('conferences', __name__)

conference_create_schema = ConferenceCreateSchema()
conference_response_schema = ConferenceResponseSchema()
track_create_schema = TrackCreateSchema()

@conferences_bp.route('', methods=['POST'])
@require_auth
@require_role('Chair', 'Admin')
def create_conference():
    """
    Create a new conference
    ---
    POST /api/controllers/conferences
    Headers: Authorization: Bearer <token>
    Body:
    {
        "name": "UTH Conference 2025",
        "description": "Annual scientific conference",
        "submission_deadline": "2025-03-01T00:00:00",
        "review_deadline": "2025-04-01T00:00:00",
        "start_date": "2025-05-01T00:00:00",
        "end_date": "2025-05-03T00:00:00",
        "is_blind_review": true
    }
    """
    try:
        data = conference_create_schema.load(request.json)
        
        conference, error = ConferenceService.create_conference(
            chair_id=request.current_user['user_id'],
            **data
        )
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({
            'status': 'success',
            'message': 'Conference created successfully',
            'data': conference
        }), 201
        
    except ValidationError as e:
        return jsonify({'status': 'error', 'errors': e.messages}), 400
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@conferences_bp.route('', methods=['GET'])
def list_conferences():
    """
    List all conferences
    ---
    GET /api/conferences?page=1&per_page=10&only_active=true
    
    LOGIC:
    - Nếu user là Author: chỉ show ACTIVE/đang mở conferences
    - Nếu user là Chair/Admin: show tất cả (active + inactive)
    """
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        only_active = request.args.get('only_active', 'true').lower() == 'true'
        
        # Get user role từ JWT token nếu có
        user_role = None
        try:
            from domain.utils.auth_utils import require_auth
            # Try to get current user
            auth_header = request.headers.get('Authorization', '')
            if auth_header.startswith('Bearer '):
                # Có token = user đã login
                # Không có role param = là Author (default)
                user_role = 'Author'
        except:
            user_role = 'Author'  # Default: Anonymous = Author
        
        result, error = ConferenceService.list_conferences(
            page=page, 
            per_page=per_page,
            only_active=only_active  # Pass filter param
        )
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({
            'status': 'success',
            'data': result
        }), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
        return jsonify({'status': 'success', 'data': result}), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@conferences_bp.route('/<int:conference_id>', methods=['GET'])
def get_conference(conference_id):
    """Get conference by ID"""
    try:
        conference, error = ConferenceService.get_conference(conference_id)
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 404
        
        return jsonify({'status': 'success', 'data': conference}), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@conferences_bp.route('/<int:conference_id>', methods=['PUT'])
@require_auth
@require_role('Chair', 'Admin')
def update_conference(conference_id):
    """Update conference"""
    try:
        data = request.json
        
        conference, error = ConferenceService.update_conference(
            conference_id,
            request.current_user['user_id'],
            **data
        )
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({
            'status': 'success',
            'message': 'Conference updated successfully',
            'data': conference
        }), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@conferences_bp.route('/<int:conference_id>', methods=['DELETE'])
@require_auth
@require_role('Chair', 'Admin')
def delete_conference(conference_id):
    """Delete conference"""
    try:
        success, error = ConferenceService.delete_conference(
            conference_id,
            request.current_user['user_id']
        )
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({
            'status': 'success',
            'message': 'Conference deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@conferences_bp.route('/<int:conference_id>/tracks', methods=['POST'])
@require_auth
@require_role('Chair', 'Admin')
def create_track(conference_id):
    """Create a track for conference"""
    try:
        data = track_create_schema.load(request.json)
        data['conference_id'] = conference_id
        
        track, error = ConferenceService.create_track(
            conference_id=conference_id,
            name=data['name'],
            code=data['code'],
            user_id=request.current_user['user_id']
        )
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({
            'status': 'success',
            'message': 'Track created successfully',
            'data': track
        }), 201
        
    except ValidationError as e:
        return jsonify({'status': 'error', 'errors': e.messages}), 400
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@conferences_bp.route('/<int:conference_id>/tracks', methods=['GET'])
def get_conference_tracks(conference_id):
    """Get all tracks for a conference"""
    try:
        tracks, error = ConferenceService.get_conference_tracks(conference_id)
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({'status': 'success', 'data': tracks}), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@conferences_bp.route('/<int:conference_id>/deadlines', methods=['GET'])
def get_conference_deadlines(conference_id):
    """✅ Get all deadlines for a conference"""
    try:
        from infrastructure.models import Conference
        
        conference = db.query(Conference).filter(Conference.id == conference_id).first()
        if not conference:
            return jsonify({'status': 'error', 'message': 'Conference not found'}), 404
        
        # Format deadlines
        deadlines = []
        
        if conference.submission_deadline:
            deadlines.append({
                'id': 'submission',
                'name': 'Hạn nộp bài báo',
                'date': conference.submission_deadline.isoformat(),
                'status': 'active' if conference.submission_deadline > datetime.utcnow() else 'passed'
            })
        
        if conference.review_deadline:
            deadlines.append({
                'id': 'review',
                'name': 'Hạn nộp phản biện',
                'date': conference.review_deadline.isoformat(),
                'status': 'active' if conference.review_deadline > datetime.utcnow() else 'passed'
            })
        
        if conference.decision_deadline:
            deadlines.append({
                'id': 'decision',
                'name': 'Hạn thông báo quyết định',
                'date': conference.decision_deadline.isoformat(),
                'status': 'active' if conference.decision_deadline > datetime.utcnow() else 'passed'
            })
        
        return jsonify({'status': 'success', 'data': deadlines}), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
