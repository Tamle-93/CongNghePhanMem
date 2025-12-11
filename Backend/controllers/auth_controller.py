# File: auth_controller.py
# Nhiệm vụ: Viết code xử lý cho auth_controller
# Team Member: Lê Minh Tâm
from flask import request, jsonify
from models.user_model import UserModel
from utils.security import (
    hash_password, 
    verify_password, 
    generate_token,
    validate_username,
    validate_password,
    validate_email,
    validate_fullname,
    require_auth
)
from utils.response import success_response, error_response

class AuthController:
    """
    Controller xử lý tất cả logic liên quan đến Authentication
    """
    
    def __init__(self):
        self.user_model = UserModel()
    
    def register(self):
        """
        Endpoint: POST /auth/register
        Body: {
            "username": "john_doe",
            "password": "MyPassword123!",
            "fullname": "John Doe",
            "email": "john@example.com"
        }
        
        Returns:
            201: Đăng ký thành công (kèm user info)
            400: Validation error
            409: Username hoặc Email đã tồn tại
            500: Server error
        """
        try:
            # 1. Lấy dữ liệu từ request
            data = request.get_json()
            
            if not data:
                return jsonify(error_response(
                    message="Không có dữ liệu",
                    code=400
                )), 400
            
            username = data.get('username', '').strip()
            password = data.get('password', '')
            fullname = data.get('fullname', '').strip()
            email = data.get('email', '').strip().lower()
            
            # 2. Kiểm tra các trường bắt buộc
            if not all([username, password, fullname, email]):
                return jsonify(error_response(
                    message="Thiếu thông tin bắt buộc",
                    code=400,
                    details="Cần có đầy đủ: username, password, fullname, email"
                )), 400
            
            # 3. Validate Username
            username_errors = validate_username(username)
            if username_errors:
                return jsonify(error_response(
                    message="Username không hợp lệ",
                    code=400,
                    details=username_errors
                )), 400
            
            # 4. Validate Password
            password_errors = validate_password(password)
            if password_errors:
                return jsonify(error_response(
                    message="Mật khẩu không đủ mạnh",
                    code=400,
                    details=password_errors
                )), 400
            
            # 5. Validate Email
            email_errors = validate_email(email)
            if email_errors:
                return jsonify(error_response(
                    message="Email không hợp lệ",
                    code=400,
                    details=email_errors
                )), 400
            
            # 6. Validate Fullname
            fullname_errors = validate_fullname(fullname)
            if fullname_errors:
                return jsonify(error_response(
                    message="Họ tên không hợp lệ",
                    code=400,
                    details=fullname_errors
                )), 400
            
            # 7. Kiểm tra Username đã tồn tại chưa
            if self.user_model.check_username_exists(username):
                return jsonify(error_response(
                    message="Username đã tồn tại",
                    code=409
                )), 409
            
            # 8. Kiểm tra Email đã tồn tại chưa
            if self.user_model.check_email_exists(email):
                return jsonify(error_response(
                    message="Email đã được sử dụng",
                    code=409
                )), 409
            
            # 9. Hash password
            password_hash = hash_password(password)
            
            # 10. Tạo user mới trong database
            new_user = self.user_model.create_user(
                username=username,
                password_hash=password_hash,
                full_name=fullname,
                email=email,
                role='Author'  # Role mặc định
            )
            
            if not new_user:
                return jsonify(error_response(
                    message="Không thể tạo tài khoản",
                    code=500
                )), 500
            
            # 11. Xóa thông tin nhạy cảm trước khi trả về
            new_user.pop('passwordhash', None)
            new_user.pop('PasswordHash', None)
            
            # 12. Trả về response thành công
            return jsonify(success_response(
                data=new_user,
                message="Đăng ký thành công"
            )), 201
            
        except Exception as e:
            error_msg = str(e)
            
            # Xử lý các lỗi đặc biệt từ database
            if "Username already exists" in error_msg:
                return jsonify(error_response(
                    message="Username đã tồn tại",
                    code=409
                )), 409
            elif "Email already exists" in error_msg:
                return jsonify(error_response(
                    message="Email đã được sử dụng",
                    code=409
                )), 409
            
            # Lỗi hệ thống
            return jsonify(error_response(
                message="Lỗi hệ thống",
                code=500,
                details=error_msg
            )), 500
    