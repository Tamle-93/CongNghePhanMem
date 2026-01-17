# Module: review_controller.py
# Created automatically for UTH-ConfMS
# Backend/src/api/controllers/review_controller.py

from flask import Blueprint, request, jsonify

from domain.services.review_service import ReviewService
from domain.schema.review_schema import ReviewCreateSchema

review_bp = Blueprint("review", __name__)


@review_bp.route("/reviews", methods=["GET"])
def get_reviews_for_reviewer():
    """
    API lấy danh sách assignment cho reviewer
    Query param: user_id
    """
    user_id = request.args.get("user_id")

    if not user_id:
        return jsonify({"message": "user_id is required"}), 400

    result = ReviewService.get_assignments_for_reviewer(user_id)
    return jsonify(result), 200


@review_bp.route("/reviews", methods=["POST"])
def submit_review():
    """
    API submit review cho một assignment
    Body:
    {
        "assignment_id": "...",
        "score": 8,
        "comment": "Good paper"
    }
    """
    data = request.get_json()

    try:
        review_data = ReviewCreateSchema(**data)
    except Exception as e:
        return jsonify({"message": str(e)}), 400

    ReviewService.submit_review(review_data)
    return jsonify({"message": "Review submitted successfully"}), 201
