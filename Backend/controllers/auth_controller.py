# File: auth_controller.py
# Nhiệm vụ: Viết code xử lý cho auth_controller
# Team Member: Lê Minh Tâm
from flask import request, jsonify
from models.user_model import UserModel
from Backend.config.database import get_connection
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
            role = data.get('role', 'Author') # Mặc định là Author nếu không gửi lên
            
            security_data = []
            if data.get('q1') and data.get('a1'):
                security_data.append({"q": data['q1'], "a": data['a1']})
            if data.get('q2') and data.get('a2'):
                security_data.append({"q": data['q2'], "a": data['a2']})
            if data.get('q3') and data.get('a3'):
                security_data.append({"q": data['q3'], "a": data['a3']})
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
                return jsonify(error_response(message="Username không hợp lệ", code=400, details=username_errors)), 400
            
            # 4. Validate Password
            password_errors = validate_password(password)
            if password_errors:
                return jsonify(error_response(message="Mật khẩu không đủ mạnh", code=400, details=password_errors)), 400
            
            # 5. Validate Email
            email_errors = validate_email(email)
            if email_errors:
                return jsonify(error_response(message="Email không hợp lệ", code=400, details=email_errors)), 400
            
            # 6. Validate Fullname
            fullname_errors = validate_fullname(fullname)
            if fullname_errors:
                return jsonify(error_response(message="Họ tên không hợp lệ", code=400, details=fullname_errors)), 400
            
            # 7. Kiểm tra Username đã tồn tại chưa
            if self.user_model.check_username_exists(username):
                return jsonify(error_response(message="Username đã tồn tại", code=409)), 409
            
            # 8. Kiểm tra Email đã tồn tại chưa
            if self.user_model.check_email_exists(email):
                return jsonify(error_response(message="Email đã được sử dụng", code=409)), 409
            
            # 9. Hash password
            password_hash = hash_password(password)
            
            # 10. Tạo user mới trong database
            # --- [CẬP NHẬT] TRUYỀN THÊM role VÀ security_data ---
            new_user = self.user_model.create_user(
                username=username,
                password_hash=password_hash,
                full_name=fullname,
                email=email,
                role=role,                   # <-- Dùng biến role đã lấy ở trên
                security_data=security_data  # <-- Truyền list câu hỏi xuống Model
            )
            
            if not new_user:
                return jsonify(error_response(
                    message="Không thể tạo tài khoản",
                    code=500
                )), 500
            
            # 11. Xóa thông tin nhạy cảm trước khi trả về
            new_user.pop('passwordhash', None)
            new_user.pop('PasswordHash', None)
            # Xóa luôn cột securitydata nếu Model lỡ trả về (để bảo mật)
            new_user.pop('securitydata', None) 
            new_user.pop('SecurityData', None)
            
            # 12. Trả về response thành công
            return jsonify(success_response(
                data=new_user,
                message="Đăng ký thành công"
            )), 201
            
        except Exception as e:
            error_msg = str(e)
            # (Phần xử lý lỗi giữ nguyên như cũ)
            if "Username already exists" in error_msg:
                return jsonify(error_response(message="Username đã tồn tại", code=409)), 409
            elif "Email already exists" in error_msg:
                return jsonify(error_response(message="Email đã được sử dụng", code=409)), 409
            
            print(f"Register Error: {e}") # Log lỗi ra terminal để dễ debug
            return jsonify(error_response(
                message="Lỗi hệ thống",
                code=500,
                details=error_msg
            )), 500
    def login(self):
        """
        Endpoint: POST /auth/login
        Body: {
            "username": "john_doe",
            "password": "MyPassword123!"
        }
        
        Returns:
            200: Đăng nhập thành công (kèm token và user info)
            400: Thiếu thông tin
            401: Sai username hoặc password
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
            
            # 2. Kiểm tra các trường bắt buộc
            if not username or not password:
                return jsonify(error_response(
                    message="Thiếu username hoặc password",
                    code=400
                )), 400
            
            # 3. Tìm user trong database
            user = self.user_model.get_user_by_username(username)
            
            if not user:
                return jsonify(error_response(
                    message="Tên đăng nhập hoặc mật khẩu không đúng",
                    code=401
                )), 401
            
            # 4. Verify password
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
            
            # 5. Generate JWT token
            user_id = user.get('id') or user.get('Id')
            user_role = user.get('role') or user.get('Role')
            
            token = generate_token(
                user_id=user_id,
                username=username,
                role=user_role
            )
            
            # 6. Xóa thông tin nhạy cảm
            user.pop('passwordhash', None)
            user.pop('PasswordHash', None)
            
            # 7. Trả về response thành công
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
        Headers: Authorization: Bearer <token>
        Body: {
            "old_password": "OldPassword123!",
            "new_password": "NewPassword456!"
        }
        
        Returns:
            200: Đổi mật khẩu thành công
            400: Validation error
            401: Mật khẩu cũ không đúng
            404: Không tìm thấy user
            500: Server error
        """
        try:
            # 1. Lấy user_id từ token (đã được verify bởi @require_auth)
            user_info = request.user_info
            user_id = user_info['user_id']
            
            # 2. Lấy dữ liệu từ request
            data = request.get_json()
            
            if not data:
                return jsonify(error_response(
                    message="Không có dữ liệu",
                    code=400
                )), 400
            
            old_password = data.get('old_password', '')
            new_password = data.get('new_password', '')
            
            # 3. Kiểm tra các trường bắt buộc
            if not old_password or not new_password:
                return jsonify(error_response(
                    message="Thiếu mật khẩu cũ hoặc mật khẩu mới",
                    code=400
                )), 400
            
            # 4. Kiểm tra mật khẩu mới khác mật khẩu cũ
            if old_password == new_password:
                return jsonify(error_response(
                    message="Mật khẩu mới phải khác mật khẩu cũ",
                    code=400
                )), 400
            
            # 5. Validate mật khẩu mới
            password_errors = validate_password(new_password)
            if password_errors:
                return jsonify(error_response(
                    message="Mật khẩu mới không đủ mạnh",
                    code=400,
                    details=password_errors
                )), 400
            
            # 6. Lấy thông tin user từ database
            user = self.user_model.get_user_by_id(user_id)
            
            if not user:
                return jsonify(error_response(
                    message="Không tìm thấy người dùng",
                    code=404
                )), 404
            
            # 7. Verify mật khẩu cũ
            stored_hash = user.get('passwordhash') or user.get('PasswordHash')
            
            if not verify_password(old_password, stored_hash):
                return jsonify(error_response(
                    message="Mật khẩu cũ không đúng",
                    code=401
                )), 401
            
            # 8. Hash mật khẩu mới
            new_password_hash = hash_password(new_password)
            
            # 9. Cập nhật mật khẩu trong database
            success = self.user_model.update_password(user_id, new_password_hash)
            
            if not success:
                return jsonify(error_response(
                    message="Không thể đổi mật khẩu",
                    code=500
                )), 500
            
            # 10. Trả về response thành công
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
        Headers: Authorization: Bearer <token>
        
        Returns:
            200: Thông tin user hiện tại
            401: Token không hợp lệ
            404: Không tìm thấy user
            500: Server error
        """
        try:
            # 1. Lấy user_id từ token (đã được verify bởi @require_auth)
            user_info = request.user_info
            user_id = user_info['user_id']
            
            # 2. Lấy thông tin user từ database
            user = self.user_model.get_user_by_id(user_id)
            
            if not user:
                return jsonify(error_response(
                    message="Không tìm thấy người dùng",
                    code=404
                )), 404
            
            # 3. Xóa thông tin nhạy cảm
            user.pop('passwordhash', None)
            user.pop('PasswordHash', None)
            
            # 4. Trả về response thành công
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
        Headers: Authorization: Bearer <token>
        
        NOTE: JWT là stateless, nên logout chỉ là hướng dẫn client xóa token.
        Server không cần làm gì (trừ khi dùng token blacklist - không implement ở đây).
        
        Returns:
            200: Đăng xuất thành công
        """
        try:
            # Trong JWT stateless, server không cần làm gì
            # Client sẽ tự xóa token ở localStorage/cookie
            
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
    # --- THÊM VÀO CUỐI CLASS AuthController ---

    def get_security_question(self):
        """
        Bước 1: Nhận Email -> Trả về 1 câu hỏi ngẫu nhiên từ DB
        """
        try:
            data = request.get_json()
            email = data.get('email', '').strip().lower()
            role = data.get('role', 'Author')

            # 1. Tìm user theo Email và Role
            conn = get_connection()
            cursor = conn.cursor()
            query = "SELECT SecurityData FROM Users WHERE Email = %s AND Role = %s AND IsDeleted = FALSE"
            cursor.execute(query, (email, role))
            user = cursor.fetchone()
            
            cursor.close()
            conn.close()

            if not user:
                return jsonify(error_response(message="Không tìm thấy tài khoản này!", code=404)), 404
            
            security_data = user[0] # Lấy cột SecurityData (JSON)

            if not security_data:
                return jsonify(error_response(message="Tài khoản này chưa thiết lập câu hỏi bảo mật.", code=400)), 400
            
            # 2. Random chọn 1 câu hỏi
            import random
            random_pair = random.choice(security_data) # Chọn { "q": "...", "a": "..." }
            question_text = random_pair.get('q')

            return jsonify(success_response(
                data={"question": question_text},
                message="Đã tìm thấy câu hỏi bảo mật"
            )), 200

        except Exception as e:
            print(f"Error: {e}")
            return jsonify(error_response(message="Lỗi hệ thống", details=str(e))), 500

    def reset_password(self):
        """
        Bước 2: Nhận Câu trả lời + Mật khẩu mới -> Kiểm tra và Đổi Pass
        """
        try:
            data = request.get_json()
            email = data.get('email')
            role = data.get('role')
            question = data.get('question')
            answer = data.get('answer', '').strip().lower() # Chuyển về chữ thường để so sánh
            new_password = data.get('new_password')

            # 1. Lấy thông tin User
            conn = get_connection()
            cursor = conn.cursor()
            query = "SELECT Id, SecurityData FROM Users WHERE Email = %s AND Role = %s"
            cursor.execute(query, (email, role))
            user = cursor.fetchone()

            if not user:
                return jsonify(error_response(message="Tài khoản không tồn tại", code=404)), 404

            user_id, security_data = user

            # 2. Tìm câu hỏi tương ứng trong list và check đáp án
            is_correct = False
            for item in security_data:
                if item.get('q') == question:
                    # So sánh đáp án (chữ thường)
                    if item.get('a', '').strip().lower() == answer:
                        is_correct = True
                        break
            
            if not is_correct:
                return jsonify(error_response(message="Câu trả lời không chính xác!", code=400)), 400

            # 3. Nếu đúng -> Đổi mật khẩu
            new_hash = hash_password(new_password)
            update_query = "UPDATE Users SET PasswordHash = %s WHERE Id = %s"
            cursor.execute(update_query, (new_hash, user_id))
            conn.commit()
            
            cursor.close()
            conn.close()

            return jsonify(success_response(message="Đổi mật khẩu thành công!")), 200

        except Exception as e:
            if conn: conn.rollback()
            print(f"Error: {e}")
            return jsonify(error_response(message="Lỗi hệ thống", details=str(e))), 500
