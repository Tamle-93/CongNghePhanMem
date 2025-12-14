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
