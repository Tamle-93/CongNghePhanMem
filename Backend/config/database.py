import os
import psycopg2
from psycopg2 import OperationalError
from dotenv import load_dotenv #  pip install python-dotenv
load_dotenv()
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 5432)),
    'database': os.getenv('DB_NAME', 'CNPM'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD')
}
def get_connection():
    """
    Tạo kết nối đến PostgreSQL database
    Returns:
        psycopg2.connection: Database connection nếu thành công
        None: Nếu có lỗi
    Usage:
        conn = get_connection()
        if conn:
            cursor = conn.cursor()
            # ... thực hiện query
            cursor.close()
            conn.close()
    """
    connection = None
    try:
        password_db = DB_CONFIG['password']
        
        if not password_db:
            print("Không tìm thấy 'DB_PASSWORD' trong file .env")
            return None
        
        connection = psycopg2.connect(
            database=DB_CONFIG['database'],
            user=DB_CONFIG['user'],
            password=password_db,
            host=DB_CONFIG['host'],
            port=DB_CONFIG['port']
        )
        
        print("Kết nối database thành công")
        return connection
        
    except OperationalError as e:
        print(f"Có lỗi xảy ra khi kết nối database: {e}")
        return None

# Alias để tương thích với code cũ
create_connection = get_connection

# def test_connection():
#     """Test kết nối database"""
#     conn = get_connection()
#     if conn:
#         try:
#             cursor = conn.cursor()
#             cursor.execute("SELECT version();")
#             db_version = cursor.fetchone()
#             print(f"PostgreSQL version: {db_version[0]}")
#             cursor.close()
#             conn.close()
#             return True
#         except Exception as e:
#             print(f"Lỗi test connection: {e}")
#             return False
#     return False


