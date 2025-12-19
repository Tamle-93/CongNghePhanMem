# File: api_routes.py
# Nhiệm vụ: Viết code xử lý cho api_routes
# Team Member: Điền tên người phụ trách vào đây
# Backend/routes/api_routes.py
from controllers.review_controller import review_bp

def register_api_routes(app):
    app.register_blueprint(review_bp)
