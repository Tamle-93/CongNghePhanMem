# File: Backend/main.py
# Team UTH-ConfMS
# MỤC ĐÍCH: Entry point của Backend Server

from flask import Flask
from flask_cors import CORS
from routes.auth_routes import auth_bp
from routes.admin_routes import admin_bp  # ← THÊM DÒNG NÀY
# from routes.review_routes import review_bp
# app.register_blueprint(review_bp)
# TODO: Import thêm các blueprint khác khi các member làm xong
# from routes.api_routes import api_bp
# from routes.paper_routes import paper_bp

# Khởi tạo Flask app
app = Flask(__name__)

# Cấu hình CORS (cho phép Frontend gọi API)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173", "http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Đăng ký các Blueprint (Routes)
app.register_blueprint(auth_bp)
app.register_blueprint(admin_bp)  # ← THÊM DÒNG NÀY

# TODO: Các member khác sẽ đăng ký blueprint của mình tại đây
# app.register_blueprint(api_bp)
# app.register_blueprint(paper_bp)

# Health check endpoint (Kiểm tra server có chạy không)
@app.route('/', methods=['GET'])
def index():
    return {
        "status": "success",
        "message": "UTH-ConfMS Backend API is running",
        "version": "1.0",
        "endpoints": {
            "auth": "/auth",
            "admin": "/admin",  # ← THÊM DÒNG NÀY
            "api": "/api",
            "papers": "/papers"
        }
    }, 200

# Error Handlers (Xử lý lỗi global)
@app.errorhandler(404)
def not_found(error):
    from utils.response import error_response
    from flask import jsonify
    return jsonify(error_response(
        message="Endpoint không tồn tại",
        code=404,
        details=str(error)
    )), 404

@app.errorhandler(500)
def internal_error(error):
    from utils.response import error_response
    from flask import jsonify
    return jsonify(error_response(
        message="Lỗi server nội bộ",
        code=500,
        details=str(error)
    )), 500

# Chạy server
if __name__ == '__main__':
    print("🚀 Starting UTH-ConfMS Backend Server...")
    print("📍 Server running at: http://localhost:5000")
    print("📖 API Documentation: http://localhost:5000/")
    print("🔐 Auth endpoints: http://localhost:5000/auth")
    print("👤 Admin endpoints: http://localhost:5000/admin")  # ← THÊM DÒNG NÀY
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )