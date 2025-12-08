# File: user_model.py
# Nhiệm vụ: Viết code xử lý cho user_model
# Team Member: Lê Minh Tâm

import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
import os
from typing import Optional, List, Dict, Any
from config.database import get_connection 

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
    def get_user_by_id(self, user_id: int) -> Optional[Dict[str, Any]]:
        """
        Lấy thông tin user theo ID
        
        Args:
            user_id: ID của user
        
        Returns:
            Dict chứa thông tin user hoặc None nếu không tìm thấy
        """
        conn = None
        try:
            conn = get_connection()
            if not conn:
                raise Exception("Cannot connect to database")
            
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            query = """
                SELECT Id, Username, PasswordHash, FullName, Email, Role, CreatedDate, IsDeleted
                FROM Users
                WHERE Id = %s AND IsDeleted = FALSE
            """
            
            cursor.execute(query, (user_id,))
            user = cursor.fetchone()
            cursor.close()
            
            return dict(user) if user else None
            
        except Exception as e:
            raise Exception(f"Database error: {str(e)}")
            
        finally:
            if conn:
                conn.close()

    def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        """
        Lấy thông tin user theo username (dùng cho login)
        
        Args:
            username: Tên đăng nhập
        
        Returns:
            Dict chứa thông tin user (bao gồm PasswordHash) hoặc None
        """
        conn = None
        try:
            conn = get_connection()
            if not conn:
                raise Exception("Cannot connect to database")
            
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            query = """
                SELECT Id, Username, PasswordHash, FullName, Email, Role, CreatedDate, IsDeleted
                FROM Users
                WHERE Username = %s AND IsDeleted = FALSE
            """
            
            cursor.execute(query, (username,))
            user = cursor.fetchone()
            cursor.close()
            
            return dict(user) if user else None
            
        except Exception as e:
            raise Exception(f"Database error: {str(e)}")
            
        finally:
            if conn:
                conn.close()

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """
        Lấy thông tin user theo email
        
        Args:
            email: Địa chỉ email
        
        Returns:
            Dict chứa thông tin user hoặc None
        """
        conn = None
        try:
            conn = get_connection()
            if not conn:
                raise Exception("Cannot connect to database")
            
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            query = """
                SELECT Id, Username, FullName, Email, Role, CreatedDate, IsDeleted
                FROM Users
                WHERE Email = %s AND IsDeleted = FALSE
            """
            
            cursor.execute(query, (email,))
            user = cursor.fetchone()
            cursor.close()
            
            return dict(user) if user else None
            
        except Exception as e:
            raise Exception(f"Database error: {str(e)}")
            
        finally:
            if conn:
                conn.close()

    def update_user(self, user_id: int, **kwargs) -> Optional[Dict[str, Any]]:
        """
        Cập nhật thông tin user
        
        Args:
            user_id: ID của user cần update
            **kwargs: Các field cần update (FullName, Email, Role)
        
        Returns:
            Dict chứa thông tin user sau khi update hoặc None
        """
        conn = None
        try:
            conn = get_connection()
            if not conn:
                raise Exception("Cannot connect to database")
            
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            # Chỉ cho phép update các field an toàn
            allowed_fields = ['FullName', 'Email', 'Role']
            update_fields = []
            values = []
            
            for field, value in kwargs.items():
                if field in allowed_fields and value is not None:
                    update_fields.append(f"{field} = %s")
                    values.append(value)
            
            if not update_fields:
                raise Exception("No valid fields to update")
            
            values.append(user_id)
            
            query = f"""
                UPDATE Users
                SET {', '.join(update_fields)}
                WHERE Id = %s AND IsDeleted = FALSE
                RETURNING Id, Username, FullName, Email, Role, CreatedDate, IsDeleted
            """
            
            cursor.execute(query, values)
            user = cursor.fetchone()
            conn.commit()
            cursor.close()
            
            return dict(user) if user else None
            
        except Exception as e:
            if conn:
                conn.rollback()
            
            error_msg = str(e).lower()
            if 'unique' in error_msg and 'email' in error_msg:
                raise Exception("Email already exists")
            else:
                raise Exception(f"Database error: {str(e)}")
                
        finally:
            if conn:
                conn.close()

    def update_password(self, user_id: int, new_password_hash: str) -> bool:
        """
        Cập nhật mật khẩu user
        
        Args:
            user_id: ID của user
            new_password_hash: Mật khẩu mới đã hash
        
        Returns:
            True nếu thành công, False nếu thất bại
        """
        conn = None
        try:
            conn = get_connection()
            if not conn:
                raise Exception("Cannot connect to database")
            
            cursor = conn.cursor()
            
            query = """
                UPDATE Users
                SET PasswordHash = %s
                WHERE Id = %s AND IsDeleted = FALSE
            """
            
            cursor.execute(query, (new_password_hash, user_id))
            conn.commit()
            
            row_count = cursor.rowcount
            cursor.close()
            
            return row_count > 0
            
        except Exception as e:
            if conn:
                conn.rollback()
            raise Exception(f"Database error: {str(e)}")
            
        finally:
            if conn:
                conn.close()

    def soft_delete_user(self, user_id: int) -> bool:
        pass

    def get_all_users(self, role: Optional[str] = None, 
                     limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        pass

    def check_username_exists(self, username: str) -> bool:
        pass

    def check_email_exists(self, email: str) -> bool:
        pass

    def get_users_by_role(self, role: str) -> List[Dict[str, Any]]:
        pass



