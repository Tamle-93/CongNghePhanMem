# File: admin_controller.py
# Nhiệm vụ: Viết code xử lý cho admin_controller
# Team Member: Le Minh Tam
# File: Backend/controllers/admin_controller.py
# Team UTH-ConfMS
# MỤC ĐÍCH: Quản lý Users (CRUD) - Chỉ dành cho Admin

from flask import request, jsonify
from models.user_model import UserModel
from utils.security import (
    hash_password,
    validate_username,
    validate_password,
    validate_email,
    validate_fullname,
    require_auth,
    require_role
)
from utils.response import success_response, error_response

class AdminController:
    """
    Controller xử lý các tác vụ quản lý Users (Admin only)
    """
    
    def __init__(self):
        self.user_model = UserModel()
    
    @require_auth
    @require_role(["Admin"])
    def get_all_users(self):
        """
        Endpoint: GET /admin/users?role=Reviewer&limit=50&offset=0
        Headers: Authorization: Bearer <token>
        Query Params:
            - role (optional): Lọc theo vai trò
            - limit (optional): Số lượng users (default: 100, max: 500)
            - offset (optional): Vị trí bắt đầu (default: 0)
        
        Returns:
            200: Danh sách users
            400: Invalid params
            403: Không có quyền
            500: Server error
        """
        try:
            # Lấy query parameters
            role = request.args.get('role', None)
            limit = int(request.args.get('limit', 100))
            offset = int(request.args.get('offset', 0))
            
            # Validate limit
            if limit > 500:
                return jsonify(error_response(
                    message="Limit không được vượt quá 500",
                    code=400
                )), 400
            
            if limit < 1:
                return jsonify(error_response(
                    message="Limit phải lớn hơn 0",
                    code=400
                )), 400
            
            if offset < 0:
                return jsonify(error_response(
                    message="Offset phải lớn hơn hoặc bằng 0",
                    code=400
                )), 400
            
            # Validate role nếu có
            valid_roles = ['Author', 'Reviewer', 'Chair', 'Admin']
            if role and role not in valid_roles:
                return jsonify(error_response(
                    message="Role không hợp lệ",
                    code=400,
                    details=f"Role phải là một trong: {', '.join(valid_roles)}"
                )), 400
            
            # Lấy danh sách users từ database
            users = self.user_model.get_all_users(
                role=role,
                limit=limit,
                offset=offset
            )
            
            # Trả về response thành công
            return jsonify(success_response(
                data={
                    "users": users,
                    "total": len(users),
                    "limit": limit,
                    "offset": offset,
                    "filter": {"role": role} if role else None
                },
                message="Lấy danh sách người dùng thành công"
            )), 200
            
        except ValueError as e:
            return jsonify(error_response(
                message="Tham số không hợp lệ",
                code=400,
                details=str(e)
            )), 400
        except Exception as e:
            return jsonify(error_response(
                message="Lỗi hệ thống",
                code=500,
                details=str(e)
            )), 500
    @require_auth
    @require_role(["Admin"])
    def get_user_by_id(self, user_id):
        """
        Endpoint: GET /admin/users/<user_id>
        Headers: Authorization: Bearer <token>
        
        Returns:
            200: Thông tin user
            403: Không có quyền
            404: Không tìm thấy user
            500: Server error
        """
        try:
            # Lấy thông tin user từ database
            user = self.user_model.get_user_by_id(user_id)
            
            if not user:
                return jsonify(error_response(
                    message="Không tìm thấy người dùng",
                    code=404
                )), 404
            
            # Xóa thông tin nhạy cảm
            user.pop('passwordhash', None)
            user.pop('PasswordHash', None)
            
            # Trả về response thành công
            return jsonify(success_response(
                data=user,
                message="Lấy thông tin người dùng thành công"
            )), 200
            
        except Exception as e:
            return jsonify(error_response(
                message="Lỗi hệ thống",
                code=500,
                details=str(e)
            )), 500
    
    @require_auth
    @require_role(["Admin"])
    def create_user(self):
        """
        Endpoint: POST /admin/users
        Headers: Authorization: Bearer <token>
        Body: {
            "username": "new_user",
            "password": "Password123!",
            "fullname": "New User",
            "email": "newuser@example.com",
            "role": "Author"
        }
        
        Returns:
            201: User được tạo thành công
            400: Validation error
            403: Không có quyền
            409: Username hoặc Email đã tồn tại
            500: Server error
        """
        try:
            # Lấy dữ liệu từ request
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
            role = data.get('role', 'Author').strip()
            
            # Kiểm tra các trường bắt buộc
            if not all([username, password, fullname, email]):
                return jsonify(error_response(
                    message="Thiếu thông tin bắt buộc",
                    code=400,
                    details="Cần có đầy đủ: username, password, fullname, email"
                )), 400
            
            # Validate role
            valid_roles = ['Author', 'Reviewer', 'Chair', 'Admin']
            if role not in valid_roles:
                return jsonify(error_response(
                    message="Role không hợp lệ",
                    code=400,
                    details=f"Role phải là một trong: {', '.join(valid_roles)}"
                )), 400
            
            # Validate Username
            username_errors = validate_username(username)
            if username_errors:
                return jsonify(error_response(
                    message="Username không hợp lệ",
                    code=400,
                    details=username_errors
                )), 400
            
            # Validate Password
            password_errors = validate_password(password)
            if password_errors:
                return jsonify(error_response(
                    message="Mật khẩu không đủ mạnh",
                    code=400,
                    details=password_errors
                )), 400
            
            # Validate Email
            email_errors = validate_email(email)
            if email_errors:
                return jsonify(error_response(
                    message="Email không hợp lệ",
                    code=400,
                    details=email_errors
                )), 400
            
            # Validate Fullname
            fullname_errors = validate_fullname(fullname)
            if fullname_errors:
                return jsonify(error_response(
                    message="Họ tên không hợp lệ",
                    code=400,
                    details=fullname_errors
                )), 400
            
            # Kiểm tra Username đã tồn tại chưa
            if self.user_model.check_username_exists(username):
                return jsonify(error_response(
                    message="Username đã tồn tại",
                    code=409
                )), 409
            
            # Kiểm tra Email đã tồn tại chưa
            if self.user_model.check_email_exists(email):
                return jsonify(error_response(
                    message="Email đã được sử dụng",
                    code=409
                )), 409
            
            # Hash password
            password_hash = hash_password(password)
            
            # Tạo user mới
            new_user = self.user_model.create_user(
                username=username,
                password_hash=password_hash,
                full_name=fullname,
                email=email,
                role=role
            )
            
            if not new_user:
                return jsonify(error_response(
                    message="Không thể tạo người dùng",
                    code=500
                )), 500
            
            # Xóa thông tin nhạy cảm
            new_user.pop('passwordhash', None)
            new_user.pop('PasswordHash', None)
            
            # Trả về response thành công
            return jsonify(success_response(
                data=new_user,
                message="Tạo người dùng thành công"
            )), 201
            
        except Exception as e:
            error_msg = str(e)
            
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
            
            return jsonify(error_response(
                message="Lỗi hệ thống",
                code=500,
                details=error_msg
            )), 500
    