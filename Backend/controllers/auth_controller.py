# File: Backend/controllers/auth_controller.py
# Nhiệm vụ: Viết code xử lý cho auth_controller
# Team Member: Lê Minh Tâm

from flask import request, jsonify
from models.user_model import UserModel
from config.database import get_connection
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
            
            # --- [MỚI] LẤY ROLE VÀ CÂU HỎI BẢO MẬT ---
            role = data.get('role', 'Author')  # Mặc định là Author nếu không gửi lên
            
            # Lấy câu hỏi bảo mật từ frontend
            security_questions = data.get('security_questions', [])
            
            # Format lại để lưu vào DB
            security_data = []
            for item in security_questions:
                if item.get('question') and item.get('answer'):
                    security_data.append({
                        "q": item['question'],
                        "a": item['answer'].strip().lower()  # Chuyển về chữ thường để so sánh sau
                    })
            # -----------------------------------------

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
                role=role,
                security_data=security_data if security_data else None
            )
            
            if not new_user:
                return jsonify(error_response(
                    message="Không thể tạo tài khoản",
                    code=500
                )), 500
            
            # 11. Xóa thông tin nhạy cảm trước khi trả về
            new_user.pop('passwordhash', None)
            new_user.pop('PasswordHash', None)
            new_user.pop('securitydata', None)
            new_user.pop('SecurityData', None)
            
            # 12. Trả về response thành công
            return jsonify(success_response(
                data=new_user,
                message="Đăng ký thành công"
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
            
            print(f"Register Error: {e}")
            return jsonify(error_response(
                message="Lỗi hệ thống",
                code=500,
                details=error_msg
            )), 500
    
    def login(self):
        """
        Endpoint: POST /auth/login
        """
        try:
            data = request.get_json()
            
            if not data:
                return jsonify(error_response(
                    message="Không có dữ liệu",
                    code=400
                )), 400
            
            login_input = data.get('username', '').strip()
            password = data.get('password', '')
            
            if not login_input or not password:
                return jsonify(error_response(
                    message="Thiếu username/email hoặc password",
                    code=400
                )), 400
            
            # Tìm user (email hoặc username)
            user = None
            if '@' in login_input:
                user = self.user_model.get_user_by_email(login_input)
            
            if not user:
                user = self.user_model.get_user_by_username(login_input)
            
            if not user:
                return jsonify(error_response(
                    message="Tên đăng nhập hoặc mật khẩu không đúng",
                    code=401
                )), 401
            
            # Verify password
            stored_hash = user.get('passwordhash') or user.get('PasswordHash')
            
            if not stored_hash:
                return jsonify(error_response(
                    message="Lỗi hệ thống: Không tìm thấy mật khẩu",
                    code=500
                )), 500
            
            if not verify_password(password, stored_hash):
                return jsonify(error_response(
                    message="Tên đăng nhập hoặc mật khẩu không đúng",
                    code=401
                )), 401
            
            # Generate JWT token
            user_id = str(user.get('id') or user.get('Id'))
            username = user.get('username') or user.get('Username')
            user_role = user.get('role') or user.get('Role')
            
            token = generate_token(
                user_id=user_id,
                username=username,
                role=user_role
            )
            
            # Xóa thông tin nhạy cảm
            user.pop('passwordhash', None)
            user.pop('PasswordHash', None)
            user.pop('securitydata', None)
            user.pop('SecurityData', None)
            
            return jsonify(success_response(
                data={
                    "token": token,
                    "user": user
                },
                message="Đăng nhập thành công"
            )), 200
            
        except Exception as e:
            return jsonify(error_response(
                message="Lỗi hệ thống",
                code=500,
                details=str(e)
            )), 500
    
    @require_auth
    def change_password(self):
        """
        Endpoint: PUT /auth/change-password
        """
        try:
            user_info = request.user_info
            user_id = user_info['user_id']
            
            data = request.get_json()
            
            if not data:
                return jsonify(error_response(
                    message="Không có dữ liệu",
                    code=400
                )), 400
            
            old_password = data.get('old_password', '')
            new_password = data.get('new_password', '')
            
            if not old_password or not new_password:
                return jsonify(error_response(
                    message="Thiếu mật khẩu cũ hoặc mật khẩu mới",
                    code=400
                )), 400
            
            if old_password == new_password:
                return jsonify(error_response(
                    message="Mật khẩu mới phải khác mật khẩu cũ",
                    code=400
                )), 400
            
            password_errors = validate_password(new_password)
            if password_errors:
                return jsonify(error_response(
                    message="Mật khẩu mới không đủ mạnh",
                    code=400,
                    details=password_errors
                )), 400
            
            user = self.user_model.get_user_by_id(user_id)
            
            if not user:
                return jsonify(error_response(
                    message="Không tìm thấy người dùng",
                    code=404
                )), 404
            
            stored_hash = user.get('passwordhash') or user.get('PasswordHash')
            
            if not verify_password(old_password, stored_hash):
                return jsonify(error_response(
                    message="Mật khẩu cũ không đúng",
                    code=401
                )), 401
            
            new_password_hash = hash_password(new_password)
            success = self.user_model.update_password(user_id, new_password_hash)
            
            if not success:
                return jsonify(error_response(
                    message="Không thể đổi mật khẩu",
                    code=500
                )), 500
            
            return jsonify(success_response(
                data=None,
                message="Đổi mật khẩu thành công"
            )), 200
            
        except Exception as e:
            return jsonify(error_response(
                message="Lỗi hệ thống",
                code=500,
                details=str(e)
            )), 500
    
    @require_auth
    def get_current_user(self):
        """
        Endpoint: GET /auth/me
        """
        try:
            user_info = request.user_info
            user_id = user_info['user_id']
            
            user = self.user_model.get_user_by_id(user_id)
            
            if not user:
                return jsonify(error_response(
                    message="Không tìm thấy người dùng",
                    code=404
                )), 404
            
            user.pop('passwordhash', None)
            user.pop('PasswordHash', None)
            user.pop('securitydata', None)
            user.pop('SecurityData', None)
            
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
    
    def logout(self):
        """
        Endpoint: POST /auth/logout
        """
        try:
            return jsonify(success_response(
                data=None,
                message="Đăng xuất thành công"
            )), 200
            
        except Exception as e:
            return jsonify(error_response(
                message="Lỗi hệ thống",
                code=500,
                details=str(e)
            )), 500
    
    def forgot_password_step1(self):
        """
        Endpoint: POST /auth/forgot-password/step1
        """
        try:
            data = request.get_json()
            
            if not data:
                return jsonify(error_response(
                    message="Không có dữ liệu",
                    code=400
                )), 400
            
            email = data.get('email', '').strip().lower()
            
            if not email:
                return jsonify(error_response(
                    message="Thiếu email",
                    code=400
                )), 400
            
            user = self.user_model.get_user_by_email(email)
            
            if not user:
                return jsonify(error_response(
                    message="Email không tồn tại trong hệ thống",
                    code=404
                )), 404
            
            security_data = user.get('securitydata') or user.get('SecurityData')
            
            if not security_data:
                return jsonify(error_response(
                    message="Tài khoản này chưa thiết lập câu hỏi bảo mật",
                    code=400
                )), 400
            
            if isinstance(security_data, str):
                import json
                security_data = json.loads(security_data)
            
            import random
            selected_question = random.choice(security_data)
            
            return jsonify(success_response(
                data={
                    "question": selected_question.get('q'),
                    "question_index": security_data.index(selected_question)
                },
                message="Vui lòng trả lời câu hỏi bảo mật"
            )), 200
            
        except Exception as e:
            return jsonify(error_response(
                message="Lỗi hệ thống",
                code=500,
                details=str(e)
            )), 500
    
    def forgot_password_step2(self):
        """
        Endpoint: POST /auth/forgot-password/step2
        """
        try:
            data = request.get_json()
            
            email = data.get('email', '').strip().lower()
            question_index = data.get('question_index')
            user_answer = data.get('answer', '').strip().lower()
            new_password = data.get('new_password', '')
            
            if not all([email, question_index is not None, user_answer, new_password]):
                return jsonify(error_response(
                    message="Thiếu thông tin bắt buộc",
                    code=400
                )), 400
            
            password_errors = validate_password(new_password)
            if password_errors:
                return jsonify(error_response(
                    message="Mật khẩu mới không đủ mạnh",
                    code=400,
                    details=password_errors
                )), 400
            
            user = self.user_model.get_user_by_email(email)
            
            if not user:
                return jsonify(error_response(
                    message="Email không tồn tại",
                    code=404
                )), 404
            
            security_data = user.get('securitydata') or user.get('SecurityData')
            
            if isinstance(security_data, str):
                import json
                security_data = json.loads(security_data)
            
            correct_answer = security_data[question_index].get('a', '').strip().lower()
            
            if user_answer != correct_answer:
                return jsonify(error_response(
                    message="Câu trả lời không đúng",
                    code=401
                )), 401
            
            new_password_hash = hash_password(new_password)
            user_id = str(user.get('id') or user.get('Id'))
            success = self.user_model.update_password(user_id, new_password_hash)
            
            if not success:
                return jsonify(error_response(
                    message="Không thể đổi mật khẩu",
                    code=500
                )), 500
            
            return jsonify(success_response(
                data=None,
                message="Đổi mật khẩu thành công! Vui lòng đăng nhập lại"
            )), 200
            
        except Exception as e:
            return jsonify(error_response(
                message="Lỗi hệ thống",
                code=500,
                details=str(e)
            )), 500