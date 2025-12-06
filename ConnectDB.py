import os
import psycopg2
from psycopg2 import OperationalError
from dotenv import load_dotenv #  pip install python-dotenv
def create_connection():
    connection = None
    try:
        password_db = os.getenv("DB_PASSWORD")
        connection = psycopg2.connect(
            database="CNPM",          # Tên DB 
            user="postgres",          # Tên user mặc định
            password=password_db,   
            host="localhost",         # Chạy trên máy cá nhân
            port="5432"               # Cổng mặc định
        )
        print("Kết nối đến PostgreSQL DB thành công!")
    except OperationalError as e:
        print(f" Có lỗi xảy ra: {e}")
    return connection

if __name__ == "__main__":
    conn = create_connection()
