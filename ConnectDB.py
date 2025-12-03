import psycopg2
from psycopg2 import OperationalError

def create_connection():
    connection = None
    try:
        connection = psycopg2.connect(
            database="CNPM",          # Tên DB 
            user="postgres",          # Tên user mặc định
            password="1234",          # Nhập mật khẩu PostgreSQL của bạn vào đây
            host="localhost",         # Chạy trên máy cá nhân
            port="5432"               # Cổng mặc định
        )
        print("Kết nối đến PostgreSQL DB thành công!")
    except OperationalError as e:
        print(f" Có lỗi xảy ra: {e}")
    return connection

if __name__ == "__main__":
    conn = create_connection()
