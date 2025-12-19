# File: Backend/routes/admin_routes.py
# Team UTH-ConfMS
# MỤC ĐÍCH: Định nghĩa các endpoints API cho Admin

from flask import Blueprint
from controllers.admin_controller import AdminController

# Tạo Blueprint cho Admin routes
admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

# Khởi tạo controller
admin_controller = AdminController()

# ============= USER MANAGEMENT ENDPOINTS =============

@admin_bp.route('/users', methods=['GET'])
def get_all_users():
    """
    GET /admin/users?role=Reviewer&limit=50&offset=0
    Lấy danh sách tất cả users (có phân trang, lọc theo role)
    """
    return admin_controller.get_all_users()


@admin_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user_by_id(user_id):
    """
    GET /admin/users/<user_id>
    Lấy thông tin chi tiết 1 user
    """
    return admin_controller.get_user_by_id(user_id)


@admin_bp.route('/users', methods=['POST'])
def create_user():
    """
    POST /admin/users
    Tạo user mới (Admin có thể tạo user với bất kỳ role nào)
    """
    return admin_controller.create_user()


@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    """
    PUT /admin/users/<user_id>
    Cập nhật thông tin user (fullname, email, role)
    """
    return admin_controller.update_user(user_id)


@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """
    DELETE /admin/users/<user_id>
    Xóa user (soft delete)
    """
    return admin_controller.delete_user(user_id)


@admin_bp.route('/users/role/<string:role>', methods=['GET'])
def get_users_by_role(role):
    """
    GET /admin/users/role/<role>
    Lấy danh sách users theo role cụ thể
    """
    return admin_controller.get_users_by_role(role)


@admin_bp.route('/users/<int:user_id>/reset-password', methods=['POST'])
def reset_user_password(user_id):
    """
    POST /admin/users/<user_id>/reset-password
    Admin reset password cho user khác
    """
    return admin_controller.reset_user_password(user_id)


# ============= HEALTH CHECK =============

@admin_bp.route('/health', methods=['GET'])
def health_check():
    """
    GET /admin/health
    Kiểm tra xem Admin service có hoạt động không
    """
    from utils.response import success_response
    from flask import jsonify
    
    return jsonify(success_response(
        data={"service": "admin", "version": "1.0"},
        message="Admin service is running"
    )), 200