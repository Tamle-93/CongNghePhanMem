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
    
def extract_token_from_header(auth_header: str) -> Optional[str]:
    """
    Trích xuất token từ header Authorization
    
    Args:
        auth_header: Header Authorization (format: "Bearer <token>")
    
    Returns:
        str: Token string nếu hợp lệ
        None: Nếu format không đúng
    
    Example:
        >>> header = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        >>> token = extract_token_from_header(header)
        >>> print(token)  # eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    """
    if not auth_header:
        return None
    
    parts = auth_header.split()
    
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    
    return parts[1]


# ============= VALIDATION =============

def validate_username(username: str) -> List[str]:
    """
    Kiểm tra username hợp lệ
    
    Rules:
        - Độ dài: 4-20 ký tự
        - Chỉ chứa: chữ cái (a-z, A-Z), số (0-9), dấu gạch dưới (_)
        - Không chứa khoảng trắng
        - Không bắt đầu bằng số
    
    Returns:
        List các lỗi (rỗng nếu hợp lệ)
    
    Example:
        >>> errors = validate_username("abc")
        >>> print(errors)  # ["Username phải có ít nhất 4 ký tự"]
        >>> errors = validate_username("john_doe123")
        >>> print(errors)  # []
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
    
    if username and username[0].isdigit():
        errors.append("Username không được bắt đầu bằng số")
    
    return errors

def validate_password(password: str) -> List[str]:
    """
    Kiểm tra mật khẩu có đủ mạnh không
    
    Rules:
        - Độ dài: Ít nhất 8 ký tự
        - Phải có ít nhất 1 chữ hoa
        - Phải có ít nhất 1 chữ thường
        - Phải có ít nhất 1 số
        - Phải có ít nhất 1 ký tự đặc biệt (!@#$%^&*...)
    
    Returns:
        List các lỗi (rỗng nếu hợp lệ)
    
    Example:
        >>> errors = validate_password("abc123")
        >>> print(errors)  # ["Mật khẩu phải có ít nhất 8 ký tự", ...]
        >>> errors = validate_password("MyPass123!")
        >>> print(errors)  # []
    """
    errors = []
    
    if not password:
        errors.append("Mật khẩu không được để trống")
        return errors
    
    if len(password) < 8:
        errors.append("Mật khẩu phải có ít nhất 8 ký tự")
    
    if len(password) > 128:
        errors.append("Mật khẩu không được vượt quá 128 ký tự")
    
    if not re.search(r'[A-Z]', password):
        errors.append("Mật khẩu phải có ít nhất 1 chữ hoa")
    
    if not re.search(r'[a-z]', password):
        errors.append("Mật khẩu phải có ít nhất 1 chữ thường")
    
    if not re.search(r'[0-9]', password):
        errors.append("Mật khẩu phải có ít nhất 1 số")
    
    if not re.search(r'[!@#$%^&*()_+\-=\[\]{};:\'",.<>?/\\|`~]', password):
        errors.append("Mật khẩu phải có ít nhất 1 ký tự đặc biệt (!@#$%^&*...)")
    
    return errors

def validate_email(email: str) -> List[str]:
    """
    Kiểm tra email hợp lệ
    
    Rules:
        - Đúng định dạng: username@domain.tld
        - Không chứa khoảng trắng
        - Domain phải có dấu chấm
    
    Returns:
        List các lỗi (rỗng nếu hợp lệ)
    
    Example:
        >>> errors = validate_email("invalid-email")
        >>> print(errors)  # ["Email không đúng định dạng"]
        >>> errors = validate_email("user@example.com")
        >>> print(errors)  # []
    """
    errors = []
    
    if not email:
        errors.append("Email không được để trống")
        return errors
    
    email = email.strip()
    
    # Regex chuẩn cho email
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    if not re.match(email_regex, email):
        errors.append("Email không đúng định dạng")
    
    if len(email) > 255:
        errors.append("Email không được vượt quá 255 ký tự")
    
    return errors


def validate_fullname(fullname: str) -> List[str]:
    """
    Kiểm tra họ tên hợp lệ
    
    Rules:
        - Độ dài: 2-100 ký tự
        - Không chứa số
        - Không chứa ký tự đặc biệt (trừ khoảng trắng và dấu tiếng Việt)
    
    Returns:
        List các lỗi (rỗng nếu hợp lệ)
    
    Example:
        >>> errors = validate_fullname("Nguyễn Văn A")
        >>> print(errors)  # []
        >>> errors = validate_fullname("A")
        >>> print(errors)  # ["Họ tên phải có ít nhất 2 ký tự"]
    """
    errors = []
    
    if not fullname:
        errors.append("Họ tên không được để trống")
        return errors
    
    fullname = fullname.strip()
    
    if len(fullname) < 2:
        errors.append("Họ tên phải có ít nhất 2 ký tự")
    
    if len(fullname) > 100:
        errors.append("Họ tên không được vượt quá 100 ký tự")
    
    # Cho phép chữ cái (bao gồm tiếng Việt), khoảng trắng
    if not re.match(r'^[a-zA-ZÀ-ỹ\s]+$', fullname):
        errors.append("Họ tên chỉ được chứa chữ cái và khoảng trắng")
    
    return errors


def require_auth(func):
    pass

def require_role(required_roles: List[str]):
    pass