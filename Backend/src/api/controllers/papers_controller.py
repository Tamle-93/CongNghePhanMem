"""
Backend/src/api/controllers/papers_controller.py
Paper Submission API Routes
"""

from flask import Blueprint, request, jsonify, send_file
from domain.services.paper_service import PaperService
from domain.schemas.paper_schema import (
    PaperSubmissionSchema, PaperResponseSchema, PaperUpdateSchema
)
from domain.utils.auth_utils import require_auth, require_role
from marshmallow import ValidationError
from werkzeug.utils import secure_filename
import os

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
    POST /api/controllers/papers
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
        import json
        
        # Get file first to validate early
        if 'file' not in request.files:
            return jsonify({'status': 'error', 'message': 'Vui lòng tải lên file PDF'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'status': 'error', 'message': 'Vui lòng chọn file PDF'}), 400
        
        # Get and validate form data
        title = request.form.get('title', '').strip()
        abstract = request.form.get('abstract', '').strip()
        keywords = request.form.get('keywords', '').strip()
        conference_id_str = request.form.get('conference_id', '')
        track_id_str = request.form.get('track_id')
        authors_str = request.form.get('authors', '[]')
        
        # Validate required fields first
        if not title:
            return jsonify({'status': 'error', 'message': 'Tiêu đề bài báo không được để trống'}), 400
        if not abstract:
            return jsonify({'status': 'error', 'message': 'Tóm tắt không được để trống'}), 400
        if not conference_id_str:
            return jsonify({'status': 'error', 'message': 'Vui lòng chọn hội nghị'}), 400
        
        # Parse conference_id
        try:
            conference_id = int(conference_id_str)
        except (ValueError, TypeError):
            return jsonify({'status': 'error', 'message': 'ID hội nghị không hợp lệ'}), 400
        
        # Parse track_id if provided
        track_id = None
        if track_id_str:
            try:
                track_id = int(track_id_str)
            except (ValueError, TypeError):
                return jsonify({'status': 'error', 'message': 'ID phân ban không hợp lệ'}), 400
        
        # Parse authors JSON
        try:
            authors = json.loads(authors_str)
            if not isinstance(authors, list):
                authors = [authors]
            if len(authors) == 0:
                return jsonify({'status': 'error', 'message': 'Vui lòng thêm ít nhất một tác giả'}), 400
        except json.JSONDecodeError:
            return jsonify({'status': 'error', 'message': 'Dữ liệu tác giả không hợp lệ'}), 400
        
        # Validate each author has required fields
        for i, author in enumerate(authors):
            if not isinstance(author, dict):
                return jsonify({'status': 'error', 'message': f'Tác giả #{i+1} không hợp lệ'}), 400
            # At least name or user_id must be present
            name = author.get('name', '').strip() if isinstance(author.get('name'), str) else ''
            user_id = author.get('user_id')
            if not name and not user_id:
                return jsonify({'status': 'error', 'message': f'Tác giả #{i+1} thiếu tên hoặc ID'}), 400
        
        # Prepare data for schema validation
        data = {
            'title': title,
            'abstract': abstract,
            'keywords': keywords,
            'conference_id': conference_id,
            'track_id': track_id,
            'authors': authors
        }
        
        # Validate with marshmallow schema
        validated_data = submission_schema.load(data)
        
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
        # Convert marshmallow validation errors to user-friendly messages
        error_messages = []
        for field, msgs in e.messages.items():
            if isinstance(msgs, list):
                error_messages.extend(msgs)
            else:
                error_messages.append(str(msgs))
        
        error_detail = ', '.join(error_messages) if error_messages else 'Dữ liệu không hợp lệ'
        return jsonify({'status': 'error', 'message': error_detail}), 400
    except Exception as e:
        print(f"❌ Paper submission error: {str(e)}")
        return jsonify({'status': 'error', 'message': f'Lỗi: {str(e)}'}), 500

@papers_bp.route('', methods=['GET'])
@require_auth
def list_papers():
    """
    List papers with filters
    ---
    GET /api/controllers/papers?conference_id=1&submitter_id=2&status=submitted&page=1&per_page=10
    
    LOGIC:
    - Nếu URL có X-Active-Role header = 'Author': chỉ show papers của user đó
    - Nếu X-Active-Role = 'Chair'/'Admin'/'Reviewer': show tất cả
    - Fallback: nếu không có active role, check roles và quyết định
    """
    try:
        conference_id = request.args.get('conference_id', type=int)
        submitter_id = request.args.get('submitter_id', type=int)
        status = request.args.get('status')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # CHECK X-Active-Role header (từ frontend role switcher)
        active_role = request.headers.get('X-Active-Role', '')
        
        # AUTO-FILTER: Nếu active role là Author, tự động filter theo user hiện tại
        if active_role == 'Author':
            submitter_id = request.current_user['user_id']
        # Nếu không có X-Active-Role header, fallback: pure Author thì filter
        elif not active_role:
            user_roles = request.current_user.get('roles', [])
            if user_roles == ['Author']:  # ONLY Author, no other roles
                submitter_id = request.current_user['user_id']
        
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



@papers_bp.route('/<int:paper_id>/camera-ready', methods=['POST'])
@require_auth
def upload_camera_ready(paper_id):
    """
    Upload camera-ready version
    ---
    POST /api/papers/{paper_id}/camera-ready
    Content-Type: multipart/form-data
    
    Form Data:
        camera_ready_file: PDF file (required)
    """
    try:
        # Debug logging
        print(f"[DEBUG] Camera-ready upload for paper {paper_id}")
        print(f"[DEBUG] Current user: {request.current_user}")
        print(f"[DEBUG] Files in request: {list(request.files.keys())}")
        print(f"[DEBUG] Form data: {list(request.form.keys())}")
        print(f"[DEBUG] Content-Type: {request.content_type}")
        
        file = request.files.get('camera_ready_file') or request.files.get('file')
        if not file:
            print(f"[ERROR] No file found in request. Available files: {list(request.files.keys())}")
            return jsonify({
                'status': 'error', 
                'message': 'Không tìm thấy file. Vui lòng chọn file PDF để upload.',
                'debug': f'Available files: {list(request.files.keys())}'
            }), 400
        if file.filename == '':
            return jsonify({'status': 'error', 'message': 'Vui lòng chọn file'}), 400
        
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
        import traceback
        print(f"[ERROR] Camera-ready upload failed: {e}")
        print(traceback.format_exc())
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

@papers_bp.route('/<int:paper_id>/withdraw', methods=['POST'])
@require_auth
def withdraw_paper(paper_id):
    """
    ✅ Withdraw a paper (before deadline)
    Authors can only withdraw their own papers before submission deadline
    ---
    POST /api/controllers/papers/{id}/withdraw
    Headers: Authorization: Bearer <token>
    
    Responses:
        200: Paper withdrawn successfully
        400: Cannot withdraw (after deadline, after decision, etc.)
        403: Permission denied
        404: Paper not found
    """
    try:
        success, error = PaperService.withdraw_paper(
            paper_id=paper_id,
            user_id=request.current_user['user_id']
        )
        
        if not success:
            return jsonify({
                'status': 'error',
                'message': error
            }), 400 if error != "Permission denied" else 403
        
        return jsonify({
            'status': 'success',
            'message': 'Paper withdrawn successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@papers_bp.route('/<int:paper_id>/decision', methods=['POST'])
@require_auth
@require_role('Chair', 'Admin')
def make_paper_decision(paper_id):
    """
    Make decision on a paper (alternative endpoint)
    ---
    POST /api/papers/{paper_id}/decision
    Headers: Authorization: Bearer <token>
    Body:
    {
        "decision": "accepted",  // accepted, revision_required, rejected
        "feedback": "Congratulations...",
        "decision_date": "2024-01-15T10:00:00Z"
    }
    """
    from domain.services.decision_service import DecisionService
    
    try:
        data = request.json or {}
        
        # Map frontend decision values to backend
        decision_map = {
            'accepted': 'Accept',
            'revision_required': 'Revision', 
            'rejected': 'Reject',
            # Also accept backend values directly
            'Accept': 'Accept',
            'Revision': 'Revision',
            'Reject': 'Reject'
        }
        
        result = decision_map.get(data.get('decision'), 'Accept')
        
        decision, error = DecisionService.make_decision(
            paper_id=paper_id,
            chair_user_id=request.current_user['user_id'],
            result=result,
            final_comment=data.get('feedback', '')
        )
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({
            'status': 'success',
            'message': 'Decision saved successfully',
            'data': decision
        }), 201
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@papers_bp.route('/<int:paper_id>/pdf', methods=['GET'])
@require_auth
def download_paper_pdf(paper_id):
    """
    Download/View PDF của paper
    ---
    GET /api/papers/{paper_id}/pdf
    Headers: Authorization: Bearer <token>
    
    Returns: PDF file
    """
    try:
        # Get paper info
        paper, error = PaperService.get_paper(paper_id, request.current_user['user_id'])
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 404
        
        # Get PDF path - check both file_path and pdf_path
        relative_path = paper.get('pdf_path') or paper.get('file_path')
        if not relative_path:
            return jsonify({'status': 'error', 'message': 'PDF file not found'}), 404
        
        # Build absolute path from working directory
        # The path in DB is like 'uploads/papers/paper_226_UTHcnpm.pdf'
        if os.path.isabs(relative_path):
            pdf_path = relative_path
        else:
            pdf_path = os.path.join(os.getcwd(), relative_path)
        
        # Check if file exists
        if not os.path.exists(pdf_path):
            return jsonify({'status': 'error', 'message': f'PDF file not found on server: {pdf_path}'}), 404
        
        # Return file
        return send_file(
            pdf_path,
            mimetype='application/pdf',
            as_attachment=False,  # View in browser
            download_name=f"paper_{paper_id}.pdf"
        )
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'status': 'error', 'message': str(e)}), 500