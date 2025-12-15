# File: auth_routes.py
# Nhiệm vụ: Viết code xử lý cho auth_routes
# Team Member: Le Minh
# File: Backend/routes/auth_routes.py
# Team UTH-ConfMS
# MỤC ĐÍCH: Định nghĩa các endpoints API cho Authentication

from flask import Blueprint
from controllers.auth_controller import AuthController

# Tạo Blueprint cho Auth routes
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

# Khởi tạo controller
auth_controller = AuthController()

# ============= PUBLIC ENDPOINTS (Không cần token) =============

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    POST /auth/register
    Body: {
        "username": "john_doe",
        "password": "MyPassword123!",
        "fullname": "John Doe",
        "email": "john@example.com"
    }
    
    Response 201: {
        "status": "success",
        "message": "Đăng ký thành công",
        "data": {
            "id": 1,
            "username": "john_doe",
            "fullname": "John Doe",
            "email": "john@example.com",
            "role": "Author",
            "createddate": "2025-12-11T10:00:00"
        }
    }
    """
    return auth_controller.register()


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    POST /auth/login
    Body: {
        "username": "john_doe",
        "password": "MyPassword123!"
    }
    
    Response 200: {
        "status": "success",
        "message": "Đăng nhập thành công",
        "data": {
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "user": {
                "id": 1,
                "username": "john_doe",
                "fullname": "John Doe",
                "email": "john@example.com",
                "role": "Author"
            }
        }
    }
    """
    return auth_controller.login()


@auth_bp.route('/logout', methods=['POST'])
def logout():
    """
    POST /auth/logout
    Headers: Authorization: Bearer <token> (optional)
    
    Response 200: {
        "status": "success",
        "message": "Đăng xuất thành công"
    }
    
    NOTE: JWT là stateless, logout chỉ để client xóa token.
    Server không cần làm gì.
    """
    return auth_controller.logout()


# ============= PROTECTED ENDPOINTS (Cần token) =============

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    """
    GET /auth/me
    Headers: Authorization: Bearer <token>
    
    Response 200: {
        "status": "success",
        "message": "Lấy thông tin người dùng thành công",
        "data": {
            "id": 1,
            "username": "john_doe",
            "fullname": "John Doe",
            "email": "john@example.com",
            "role": "Author"
        }
    }
    """
    return auth_controller.get_current_user()


@auth_bp.route('/change-password', methods=['PUT'])
def change_password():
    """
    PUT /auth/change-password
    Headers: Authorization: Bearer <token>
    Body: {
        "old_password": "OldPassword123!",
        "new_password": "NewPassword456!"
    }
    
    Response 200: {
        "status": "success",
        "message": "Đổi mật khẩu thành công"
    }
    """
    return auth_controller.change_password()


# ============= HEALTH CHECK (Optional - để test server) =============

@auth_bp.route('/health', methods=['GET'])
def health_check():
    """
    GET /auth/health
    Kiểm tra xem Auth service có hoạt động không
    
    Response 200: {
        "status": "success",
        "message": "Auth service is running",
        "data": {"service": "auth", "version": "1.0"}
    }
    """
    from utils.response import success_response
    from flask import jsonify
    
    return jsonify(success_response(
        data={"service": "auth", "version": "1.0"},
        message="Auth service is running"
    )), 200
# --- Thêm vào file auth_routes.py ---

@auth_bp.route('/forgot-password/init', methods=['POST'])
def init_forgot_password():
    return auth_controller.get_security_question()

@auth_bp.route('/forgot-password/reset', methods=['POST'])
def finish_forgot_password():
    return auth_controller.reset_password()
# ... (code cũ)

@auth_bp.route('/forgot-password/step1', methods=['POST'])
def forgot_password_step1():
    """
    POST /auth/forgot-password/step1
    Bước 1: Nhập email, hệ thống trả về câu hỏi bảo mật
    """
    return auth_controller.forgot_password_step1()


@auth_bp.route('/forgot-password/step2', methods=['POST'])
def forgot_password_step2():
    """
    POST /auth/forgot-password/step2
    Bước 2: Trả lời câu hỏi + nhập mật khẩu mới
    """
    return auth_controller.forgot_password_step2()
@auth_bp.route('/check-availability', methods=['POST'])
def check_availability():
    """
    POST /auth/check-availability
    Kiểm tra username/email có sẵn dùng không
    """
    return auth_controller.check_availability()