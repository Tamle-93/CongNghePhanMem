"""
Backend/src/api/v1/reviews.py
Review API Routes
"""

from flask import Blueprint, request, jsonify
from domain.services.review_service import ReviewService
from domain.schemas.review_schema import (
    ReviewSubmissionSchema, ReviewResponseSchema
)
from domain.utils.auth_utils import require_auth, require_role
from marshmallow import ValidationError

reviews_bp = Blueprint('reviews', __name__)

submission_schema = ReviewSubmissionSchema()
response_schema = ReviewResponseSchema()

@reviews_bp.route('', methods=['POST'])
@require_auth
def submit_review():
    """
    Submit or update a review
    ---
    POST /api/v1/reviews
    Headers: Authorization: Bearer <token>
    Body:
    {
        "assignment_id": 1,
        "score": 8,
        "comments_for_author": "Good paper with minor issues...",
        "confidential_content": "Confidential comments for PC..."
    }
    """
    try:
        data = submission_schema.load(request.json)
        
        review, error = ReviewService.submit_review(
            assignment_id=data['assignment_id'],
            reviewer_id=request.current_user['user_id'],
            score=data['score'],
            comments_for_author=data.get('comments_for_author', ''),
            confidential_content=data.get('confidential_content', '')
        )
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({
            'status': 'success',
            'message': 'Review submitted successfully',
            'data': review
        }), 201
        
    except ValidationError as e:
        return jsonify({'status': 'error', 'errors': e.messages}), 400
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@reviews_bp.route('/<int:review_id>', methods=['GET'])
@require_auth
def get_review(review_id):
    """Get review by ID"""
    try:
        review, error = ReviewService.get_review(
            review_id,
            request.current_user['user_id']
        )
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 404
        
        return jsonify({'status': 'success', 'data': review}), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@reviews_bp.route('/paper/<int:paper_id>', methods=['GET'])
@require_auth
def get_paper_reviews(paper_id):
    """Get all reviews for a paper"""
    try:
        reviews, error = ReviewService.get_reviews_for_paper(
            paper_id,
            request.current_user['user_id']
        )
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 403
        
        return jsonify({
            'status': 'success',
            'data': {
                'paper_id': paper_id,
                'reviews': reviews
            }
        }), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@reviews_bp.route('/my-reviews', methods=['GET'])
@require_auth
def get_my_reviews():
    """Get all reviews submitted by current user"""
    try:
        conference_id = request.args.get('conference_id', type=int)
        
        reviews, error = ReviewService.get_reviews_by_reviewer(
            request.current_user['user_id'],
            conference_id
        )
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({'status': 'success', 'data': reviews}), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@reviews_bp.route('/reviewer/<int:reviewer_id>', methods=['GET'])
@require_auth
@require_role('Chair', 'Admin')
def get_reviewer_reviews(reviewer_id):
    """Get all reviews by a specific reviewer (Chair/Admin only)"""
    try:
        conference_id = request.args.get('conference_id', type=int)
        
        reviews, error = ReviewService.get_reviews_by_reviewer(
            reviewer_id,
            conference_id
        )
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({
            'status': 'success',
            'data': {
                'reviewer_id': reviewer_id,
                'reviews': reviews
            }
        }), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@reviews_bp.route('/<int:review_id>', methods=['DELETE'])
@require_auth
def delete_review(review_id):
    """Delete review (before decision)"""
    try:
        success, error = ReviewService.delete_review(
            review_id,
            request.current_user['user_id']
        )
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({
            'status': 'success',
            'message': 'Review deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@reviews_bp.route('/conference/<int:conference_id>/statistics', methods=['GET'])
@require_auth
@require_role('Chair', 'Admin')
def get_review_statistics(conference_id):
    """Get review statistics for conference"""
    try:
        stats, error = ReviewService.get_review_statistics(conference_id)
        
        if error:
            return jsonify({'status': 'error', 'message': error}), 400
        
        return jsonify({'status': 'success', 'data': stats}), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
