# Docker Setup Guide - UTH-ConfMS

## Yêu cầu
- Docker Engine 20.10+
- Docker Compose 2.0+

## Cài đặt nhanh

### 1. Cấu hình Environment
```bash
# Copy file mẫu
cp .env.example .env

# Sửa .env nếu cần (database password, API keys, etc)
# Mặc định:
# - DB_USER: postgres
# - DB_PASSWORD: postgres123
# - DB_NAME: uth_confms
```

### 2. Khởi động Docker
```bash
# Build và khởi động tất cả services
docker-compose up -d

# Hoặc xem log realtime
docker-compose up
```

### 3. Kiểm tra services đang chạy
```bash
docker-compose ps
```

Bạn sẽ thấy:
- `uth-confms-db` - PostgreSQL database (port 5432)
- `uth-confms-backend` - Flask API (port 5000)
- `uth-confms-frontend` - React + Nginx (port 80)
- `uth-confms-redis` - Redis cache (port 6379)

### 4. Truy cập ứng dụng
- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000
- **Database**: localhost:5432

## Tài khoản mặc định

### Admin
- Username: `admin`
- Password: `Admin@123`

### Tác giả (Author)
- Username: `author01`
- Password: `Author01@123`

### Chủ tọa (Chair)
- Username: `chair01`
- Password: `Chair01@123`

### Phản biện (Reviewer)
- Username: `reviewer01`
- Password: `Reviewer01@123`

## Khắc phục sự cố

### Frontend không kết nối được API
- Kiểm tra backend đang chạy: `docker-compose logs backend`
- Kiểm tra network: `docker network ls`

### Database không khởi tạo
- Xóa volume cũ: `docker-compose down -v`
- Khởi động lại: `docker-compose up -d`

### Xem logs
```bash
# Logs của một service
docker-compose logs backend
docker-compose logs database
docker-compose logs frontend

# Follow logs realtime
docker-compose logs -f backend
```

### Dừng Docker
```bash
docker-compose down

# Xóa toàn bộ (bao gồm database)
docker-compose down -v
```

## Development

### Chỉnh sửa code trong Docker
Code được mount thành volume, nên:
- Backend: Thay đổi file trong `Backend/` được tự động reload
- Frontend: Cần rebuild: `docker-compose up -d --build frontend`

### Chạy command trong container
```bash
# Backend
docker-compose exec backend python -m flask shell

# Database
docker-compose exec database psql -U postgres -d uth_confms
```

## Mở rộng

### Thêm ENV variables
Thêm vào file `.env` rồi chạy:
```bash
docker-compose up -d
```

### Scale services
```bash
# Chạy 2 instance backend
docker-compose up -d --scale backend=2
```

Xem [docker-compose.yml](docker-compose.yml) để tùy chỉnh thêm.
