# File: review_controller.py
# Nhiệm vụ: Viết code xử lý cho review_controller
# Team Member: Điền tên người phụ trách vào đây
# Backend/controllers/review_controller.py
from flask import Blueprint
from utils.response import success_response

review_bp = Blueprint("review_bp", __name__, url_prefix="/reviews")

@review_bp.route("/my", methods=["GET"])
def get_my_reviews():
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

# ==============================
# MEMBER 4 - ASSIGN REVIEWER
# ==============================

@review_bp.route("/assign", methods=["POST"])
def assign_reviewer():
    """
    Assign reviewer to a paper
    Member 4 - Assignment feature
    Week 1: init endpoint (mock)
    """
    # MOCK RESPONSE - will implement logic later
    mock_result = {
        "paper_id": 1,
        "reviewer_id": 2,
        "status": "Assigned"
    }

    return success_response(mock_result, "Reviewer assigned successfully (mock)")

