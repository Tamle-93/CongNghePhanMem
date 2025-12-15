# File: review_controller.py
# Nhiệm vụ: Viết code xử lý cho review_controller
# Team Member: Điền tên người phụ trách vào đây
# Backend/controllers/review_controller.py
from flask import Blueprint, request
from utils.response import success_response, error_response
from models.review_model import ReviewModel
review_bp = Blueprint("review_bp", __name__, url_prefix="/reviews")

@review_bp.route("/my", methods=["GET"])
def get_my_reviews():
       user_id = request.args.get("user_id", type=int)

    if not user_id:
        return error_response("Missing user_id", 400)

    data = ReviewModel.get_assignments_for_reviewer(user_id)
    return success_response(data, "My assigned papers")

@review_bp.route("/submit", methods=["POST"])
def submit_review():
    """
    WEEK 2 - Submit review
    Body: { "assignment_id": "...", "score": 8, "comment": "..." }
    """
    try:
        payload = request.get_json() or {}

        assignment_id = payload.get("assignment_id")
        score = payload.get("score")
        comment = payload.get("comment", "")

        if assignment_id is None or score is None:
            return error_response("Missing assignment_id or score", 400)

        try:
            score_val = float(score)
        except Exception:
            return error_response("Score must be a number", 400)

        if score_val < 0 or score_val > 10:
            return error_response("Score must be between 0 and 10", 400)

        ReviewModel.submit_review(
            assignment_id=assignment_id,
            score=score_val,
            comment_for_author=comment
        )

        return success_response(None, "Submit review success")

    except Exception as e:
        return error_response(str(e), 500)

    """
    MOCK DATA - MEMBER 5 - WEEK 1
    Reviewer: get assigned papers (mock)
    """
    mock_data = [
        {
            "assignment_id": 1,
            "paper_title": "AI in Healthcare",
            "assignment_status": "Assigned",
            "deadline_date": "2025-01-20"
        },
        {
            "assignment_id": 2,
            "paper_title": "Smart Traffic Control",
            "assignment_status": "Assigned",
            "deadline_date": "2025-01-22"
        }
    ]

    return success_response(mock_data, "Mock reviewer assignments - week 1")
