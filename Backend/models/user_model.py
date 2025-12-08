# File: user_model.py
# Nhiệm vụ: Viết code xử lý cho user_model
# Team Member: Lê Minh Tâm

import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
import os
from typing import Optional, List, Dict, Any
from database import get_connection 

class UserModel:
    """
    Model xử lý tất cả các thao tác liên quan đến bảng Users
    """
    
    def create_user(self, username: str, password_hash: str, full_name: str, 
                   email: str, role: str = 'Author') -> Optional[Dict[str, Any]]:
        """
        Tạo user mới trong database
        Args:
            username: Tên đăng nhập (không có dấu cách)
            password_hash: Mật khẩu đã hash
            full_name: Họ tên đầy đủ
            email: Email hợp lệ
            role: Vai trò (Author, Reviewer, Chair, Admin)
        Returns:
            Dict chứa thông tin user vừa tạo hoặc None nếu lỗi
        """
        conn = None
        try:
            conn = get_connection()
            if not conn:
                raise Exception("Cannot connect to database")
            
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            query = """
                INSERT INTO Users (Username, PasswordHash, FullName, Email, Role, CreatedDate, IsDeleted)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING Id, Username, FullName, Email, Role, CreatedDate, IsDeleted
            """
            
            cursor.execute(query, (
                username, 
                password_hash, 
                full_name, 
                email, 
                role, 
                datetime.now(), 
                False
            ))
            
            user = cursor.fetchone()
            conn.commit()
            cursor.close()
            
            return dict(user) if user else None
            
        except Exception as e:
            if conn:
                conn.rollback()
            
            error_msg = str(e).lower()
            if 'unique' in error_msg and 'username' in error_msg:
                raise Exception("Username already exists")
            elif 'unique' in error_msg and 'email' in error_msg:
                raise Exception("Email already exists")
            else:
                raise Exception(f"Database error: {str(e)}")
                
        finally:
            if conn:
                conn.close()