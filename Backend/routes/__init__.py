# File: __init__.py
# Nhiệm vụ: Viết code xử lý cho __init__
# Team Member: Điền tên người phụ trách vào đây
# Backend/routes/__init__.py
from .api_routes import register_api_routes
from .auth_routes import auth_bp
from .paper_routes import paper_bp

def register_routes(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(paper_bp)
    register_api_routes(app)
