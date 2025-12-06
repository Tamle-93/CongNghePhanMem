import os
import psycopg2
from psycopg2 import OperationalError
from dotenv import load_dotenv #  pip install python-dotenv
load_dotenv()
def create_connection():
    connection = None
    try:
        password_db = os.getenv("DB_PASSWORD")
        if not password_db:
            print(" không tìm thấy 'DB_PASSWORD' trong file .env")
            return None
        
        connection = psycopg2.connect(
            database="CNPM",          # Tên DB 
            user="postgres",          # Tên user mặc định
            password=password_db,   
            host="localhost",         # Chạy trên máy cá nhân
            port="5432"               # Cổng mặc định
        )
        return connection
    except OperationalError as e:
        print(f" Có lỗi xảy ra: {e}")
    return None


