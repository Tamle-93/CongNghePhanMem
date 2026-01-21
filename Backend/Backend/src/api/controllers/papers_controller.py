"""
Backend/src/api/v1/papers.py
Paper Submission API Routes
"""

from flask import Blueprint, request, jsonify
from domain.services.paper_service import PaperService
from domain.schemas.paper_schema import (
    PaperSubmissionSchema, PaperResponseSchema, PaperUpdateSchema
)
from domain.utils.auth_utils import require_auth, require_role
from marshmallow import ValidationError
from werkzeug.utils import secure_filename

papers_bp = Blueprint('papers', __name__)

submission_schema = PaperSubmissionSchema()
response_schema = PaperResponseSchema()
update_schema = PaperUpdateSchema()

@papers_bp.route('', methods=['POST'])
@require_auth
def submit_paper():
    """
    Submit a new paper
    ---
    POST /api/v1/papers
    Headers: Authorization: Bearer <token>
    Content-Type: multipart/form-data
    
    Form Data:
        title: string (required)
        abstract: string (required)
        keywords: string
        conference_id: int (required)
        track_id: int (optional)
        authors: JSON string (required)
            [{"user_id": 1, "order": 1, "is_corresponding": true, "affiliation": "UTH"}]
        file: PDF file (required)
    """
    try:
        # Get form data
        data = {
            'title': request.form.get('title'),
            'abstract': request.form.get('abstract'),
            'keywords': request.form.get('keywords'),
            'conference_id': int(request.form.get('conference_id')),
            'track_id': int(request.form.get('track_id')) if request.form.get('track_id') else None,
            'authors': request.form.get('authors')
        }
        
        # Parse authors JSON
        import json
        authors = json.loads(data['authors'])
        data['authors'] = authors
        
        # Validate
        validated_data = submission_schema.load(data)
        
        # Get file
        if 'file' not in request.files:
            return jsonify({'status': 'error', 'message': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'status': 'error', 'message': 'No file selected'}), 400
        
        # Submit paper
        paper, error = PaperService.submit_paper(
            submitter_id=request.current_user['user_id'],
            conference_id=validated_data['conference_id'],
            title=validated_data['title'],
            abstract=validated_data['abstract'],
            keywords=validated_data.get('keywords', ''),
            track_id=validated_data.get('track_id'),
            authors=validated_data['authors'],
            file=file
        )
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({
            'status': 'success',
            'message': 'Paper submitted successfully',
            'data': paper
        }), 201
        
    except ValidationError as e:
        return jsonify({'status': 'error', 'errors': e.messages}), 400
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@papers_bp.route('', methods=['GET'])
@require_auth
def list_papers():
    """
    List papers with filters
    ---
    GET /api/v1/papers?conference_id=1&submitter_id=2&status=submitted&page=1&per_page=10
    """
    try:
        conference_id = request.args.get('conference_id', type=int)
        submitter_id = request.args.get('submitter_id', type=int)
        status = request.args.get('status')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        result, error = PaperService.list_papers(
            conference_id=conference_id,
            submitter_id=submitter_id,
            status=status,
            page=page,
            per_page=per_page
        )
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({'status': 'success', 'data': result}), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@papers_bp.route('/<int:paper_id>', methods=['GET'])
@require_auth
def get_paper(paper_id):
    """Get paper by ID"""
    try:
        paper, error = PaperService.get_paper(
            paper_id, 
            user_id=request.current_user['user_id']
        )
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 404
        
        return jsonify({'status': 'success', 'data': paper}), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@papers_bp.route('/<int:paper_id>', methods=['PUT'])
@require_auth
def update_paper(paper_id):
    """Update paper (before deadline)"""
    try:
        data = update_schema.load(request.json)
        
        paper, error = PaperService.update_paper(
            paper_id,
            request.current_user['user_id'],
            **data
        )
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({
            'status': 'success',
            'message': 'Paper updated successfully',
            'data': paper
        }), 200
        
    except ValidationError as e:
        return jsonify({'status': 'error', 'errors': e.messages}), 400
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@papers_bp.route('/<int:paper_id>/withdraw', methods=['POST'])
@require_auth
def withdraw_paper(paper_id):
    """Withdraw paper"""
    try:
        success, error = PaperService.withdraw_paper(
            paper_id,
            request.current_user['user_id']
        )
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({
            'status': 'success',
            'message': 'Paper withdrawn successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@papers_bp.route('/<int:paper_id>/camera-ready', methods=['POST'])
@require_auth
def upload_camera_ready(paper_id):
    """
    Upload camera-ready version
    ---
    POST /api/v1/papers/{paper_id}/camera-ready
    Content-Type: multipart/form-data
    
    Form Data:
        file: PDF file (required)
    """
    try:
        if 'file' not in request.files:
            return jsonify({'status': 'error', 'message': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'status': 'error', 'message': 'No file selected'}), 400
        
        paper, error = PaperService.upload_camera_ready(
            paper_id,
            request.current_user['user_id'],
            file
        )
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({
            'status': 'success',
            'message': 'Camera-ready version uploaded successfully',
            'data': paper
        }), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@papers_bp.route('/my-papers', methods=['GET'])
@require_auth
def get_my_papers():
    """Get all papers submitted by current user"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        conference_id = request.args.get('conference_id', type=int)
        
        result, error = PaperService.list_papers(
            submitter_id=request.current_user['user_id'],
            conference_id=conference_id,
            page=page,
            per_page=per_page
        )
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({'status': 'success', 'data': result}), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
