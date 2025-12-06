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