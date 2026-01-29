"""
Backend/src/api/controllers/tracks_controller.py
Track API Routes
"""

from flask import Blueprint, request, jsonify
from domain.services.conference_service import ConferenceService
from domain.utils.auth_utils import require_auth, require_role
from infrastructure.databases.base import SessionLocal
from infrastructure.models import Track, Conference

tracks_bp = Blueprint('tracks', __name__)

@tracks_bp.route('', methods=['POST'])
@require_auth
@require_role('Chair', 'Admin')
def create_track():
    """Create a new track"""
    try:
        data = request.json
        conference_id = data.get('conference_id')
        name = data.get('name')
        name_en = data.get('name_en', '')
        description = data.get('description', '')
        code = data.get('code', '')
        
        if not name:
            return jsonify({'status': 'error', 'message': 'Track name is required'}), 400
        
        if not conference_id:
            return jsonify({'status': 'error', 'message': 'Conference ID is required'}), 400
        
        db = SessionLocal()
        try:
            # Verify conference exists
            conference = db.query(Conference).filter(Conference.id == conference_id).first()
            if not conference:
                return jsonify({'status': 'error', 'message': 'Conference not found'}), 404
            
            # Create track
            track = Track(
                conference_id=conference_id,
                name=name,
                code=code or name[:3].upper(),
                description=description
            )
            db.add(track)
            db.commit()
            db.refresh(track)
            
            return jsonify({
                'status': 'success',
                'message': 'Track created successfully',
                'data': {
                    'id': track.id,
                    'name': track.name,
                    'code': track.code,
                    'description': track.description,
                    'conference_id': track.conference_id
                }
            }), 201
            
        finally:
            db.close()
            
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@tracks_bp.route('/<int:track_id>', methods=['GET'])
def get_track(track_id):
    """Get track by ID"""
    try:
        db = SessionLocal()
        try:
            track = db.query(Track).filter(Track.id == track_id).first()
            if not track:
                return jsonify({'status': 'error', 'message': 'Track not found'}), 404
            
            return jsonify({
                'status': 'success',
                'data': {
                    'id': track.id,
                    'name': track.name,
                    'code': track.code,
                    'description': track.description,
                    'conference_id': track.conference_id
                }
            }), 200
        finally:
            db.close()
            
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@tracks_bp.route('/<int:track_id>', methods=['PUT'])
@require_auth
@require_role('Chair', 'Admin')
def update_track(track_id):
    """Update a track"""
    try:
        data = request.json
        db = SessionLocal()
        try:
            track = db.query(Track).filter(Track.id == track_id).first()
            if not track:
                return jsonify({'status': 'error', 'message': 'Track not found'}), 404
            
            if 'name' in data:
                track.name = data['name']
            if 'code' in data:
                track.code = data['code']
            if 'description' in data:
                track.description = data['description']
            
            db.commit()
            
            return jsonify({
                'status': 'success',
                'message': 'Track updated successfully',
                'data': {
                    'id': track.id,
                    'name': track.name,
                    'code': track.code,
                    'description': track.description
                }
            }), 200
        finally:
            db.close()
            
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@tracks_bp.route('/<int:track_id>', methods=['DELETE'])
@require_auth
@require_role('Chair', 'Admin')
def delete_track(track_id):
    """Delete a track"""
    try:
        db = SessionLocal()
        try:
            track = db.query(Track).filter(Track.id == track_id).first()
            if not track:
                return jsonify({'status': 'error', 'message': 'Track not found'}), 404
            
            # Soft delete
            track.is_deleted = True
            db.commit()
            
            return jsonify({
                'status': 'success',
                'message': 'Track deleted successfully'
            }), 200
        finally:
            db.close()
            
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
