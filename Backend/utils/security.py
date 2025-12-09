# File: security.py
# Team UTH-ConfMS
import os
import bcrypt
import jwt
import re
from dotenv import load_dotenv #  pip install python-dotenv
load_dotenv()
from datetime import datetime, timedelta
from typing import Optional, Dict, List

SECRET_KEY = os.getenv("SECRET_KEY")
JWT_ALGORITHM = "HS256"
TOKEN_EXPIRY_DAYS = 7

def hash_password(password: str) -> str:
    """
    Mã hóa mật khẩu bằng bcrypt (chuẩn industry)
    Args:
        password: Mật khẩu gốc
    Returns:
        str: Mật khẩu đã mã hóa (hash string)
    """
    salt = bcrypt.gensalt(rounds=12)  # rounds=12 là cân bằng tốt giữa bảo mật và tốc độ
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def validate_username(username: str) -> List[str]:
    """
    Kiểm tra username
    Rules:
        - Độ dài: 4-20 ký tự
        - Chỉ chứa: chữ cái (a-z, A-Z), số (0-9), dấu gạch dưới (_)
        - Không chứa khoảng trắng
    Returns:
        List các lỗi (rỗng nếu hợp lệ)
    """
    errors = []
    
    if not username:
        errors.append("Username không được để trống")
        return errors
    
    username = username.strip()
    
    if len(username) < 4:
        errors.append("Username phải có ít nhất 4 ký tự")
    
    if len(username) > 20:
        errors.append("Username không được vượt quá 20 ký tự")
    
    if not re.match(r'^[a-zA-Z0-9_]+$', username):
        errors.append("Username chỉ được chứa chữ cái, số và dấu gạch dưới (_)")
    
    if username[0].isdigit():
        errors.append("Username không được bắt đầu bằng số")
    
    return errors

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Kiểm tra mật khẩu có khớp với hash không (dùng khi login)
    
    Args:
        plain_password: Mật khẩu người dùng nhập vào
        hashed_password: Mật khẩu đã hash trong database
    
    Returns:
        bool: True nếu khớp, False nếu không khớp
    
    Example:
        >>> hashed = hash_password("MyPassword123!")
        >>> verify_password("MyPassword123!", hashed)  # True
        >>> verify_password("WrongPassword", hashed)   # False
    """
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except Exception as e:
        print(f"Error verifying password: {e}")
        return False


# ============= JWT TOKEN =============

def generate_token(user_id: int, username: str, role: str) -> str:
    """
    Tạo JWT token sau khi login thành công
    
    Args:
        user_id: ID của user trong database
        username: Tên đăng nhập
        role: Vai trò (Author, Reviewer, Chair, Admin)
    
    Returns:
        str: JWT token string
    
    Example:
        >>> token = generate_token(1, "john_doe", "Author")
        >>> print(token)  # eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    """
    payload = {
        "user_id": user_id,
        "username": username,
        "role": role,
        "iat": datetime.utcnow(),  # Issued At (thời điểm tạo token)
        "exp": datetime.utcnow() + timedelta(days=TOKEN_EXPIRY_DAYS)  # Expiration
    }
    
    token = jwt.encode(payload, SECRET_KEY, algorithm=JWT_ALGORITHM)
    return token


def decode_token(token: str) -> Optional[Dict]:
    """
    Giải mã JWT token để lấy thông tin user (dùng cho các API protected)
    
    Args:
        token: JWT token string (từ header Authorization: Bearer <token>)
    
    Returns:
        Dict chứa user_id, username, role nếu token hợp lệ
        None nếu token không hợp lệ hoặc đã hết hạn
    
    Example:
        >>> token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        >>> user_info = decode_token(token)
        >>> print(user_info)  # {"user_id": 1, "username": "john_doe", "role": "Author"}
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return {
            "user_id": payload.get("user_id"),
            "username": payload.get("username"),
            "role": payload.get("role")
        }
    except jwt.ExpiredSignatureError:
        print("Token đã hết hạn")
        return None
    except jwt.InvalidTokenError as e:
        print(f"Token không hợp lệ: {e}")
        return None