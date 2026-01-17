# File: review_controller.py
# Nhiệm vụ: Viết code xử lý cho review_controller
# Team Member: Điền tên người phụ trách vào đây
from flask import Blueprint, request, jsonify
from domain.services.review_service import ReviewService
from schemas.schema.review_schema import ReviewCreateSchema

review_bp = Blueprint("review", __name__, url_prefix="/reviews")


@review_bp.route("/my", methods=["GET"])
def get_my_reviews():
    """
    Lấy danh sách bài được phân công cho reviewer
    """
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"message": "Missing user_id"}), 400

    data = ReviewService.get_assignments_for_reviewer(user_id)
    return jsonify(data), 200


@review_bp.route("/submit", methods=["POST"])
def submit_review():
    """
    Submit review:
    - score
    - comment
    - update status -> Reviewed
    """
    body = request.get_json()
    schema = ReviewCreateSchema(**body)

    ReviewService.submit_review(schema)
    return jsonify({"message": "Review submitted successfully"}), 200
