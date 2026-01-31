# 🐳 Chạy UTH-ConfMS với Docker

## 📋 Yêu cầu

- **Docker Desktop** (bao gồm Docker & Docker Compose)
  - Download: https://www.docker.com/products/docker-desktop
  - Cài đặt và khởi động Docker Desktop trước khi chạy

## 🚀 Hướng dẫn Nhanh (Windows)

### Bước 1: Mở Command Prompt/PowerShell

```powershell
# Chuyển vào thư mục project
cd C:\Users\LENOVO\Desktop\CongNghePhanMem
```

### Bước 2: Chạy Docker

**Cách 1: Dùng file .bat (Dễ nhất)**
```batch
# Khởi động tất cả services
docker-run.bat

# Hoặc chỉ định command cụ thể:
docker-run.bat up      # Khởi động
docker-run.bat down    # Dừng
docker-run.bat logs    # Xem logs
```

**Cách 2: Dùng docker-compose trực tiếp**
```powershell
# Khởi động
docker-compose up -d

# Dừng
docker-compose down

# Xem logs
docker-compose logs -f

# Xem logs backend
docker-compose logs -f backend
```

### Bước 3: Truy cập Ứng dụng

Mở browser và vào:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api/docs

### Bước 4: Đăng nhập Test

Tài khoản test mặc định:
- Username: `admin`
- Password: `Admin@123`

---

## 📁 Cấu trúc Docker

```
CongNghePhanMem/
├── docker-compose.yml       # Định nghĩa các services
├── docker-run.bat          # Script chạy dễ dàng (Windows)
├── docker-run.sh           # Script chạy dễ dàng (Linux/Mac)
├── .env                    # Biến môi trường (tạo từ .env.example)
├── DOCKER.md              # Chi tiết hướng dẫn Docker
├── Backend/
│   ├── Dockerfile         # Build image backend
│   ├── requirements.txt    # Python dependencies
│   └── src/
│       ├── app.py
│       └── ...
└── frontend/
    ├── Dockerfile         # Build image frontend
    ├── package.json
    └── src/
        └── ...
```

---

## 🛠️ Các Services trong Docker

| Service | Port | Mô tả |
|---------|------|-------|
| **Frontend** | 3000 | React web app |
| **Backend** | 5000 | Flask API server |
| **Database** | 5432 | PostgreSQL database |
| **Redis** | 6379 | Cache layer (optional) |

---

## 📝 Cấu hình (.env)

Khi chạy lần đầu, bạn sẽ cần tạo file `.env`:

```bash
# Tự động tạo từ template
copy .env.example .env

# Hoặc tạo thủ công với nội dung:
```

```env
# Database
DB_USER=postgres
DB_PASSWORD=postgres123
DB_NAME=uth_confms

# Security (CHANGE THESE!)
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

# Environment
FLASK_ENV=production
DEBUG=False
```

---

## 🔍 Các Lệnh Hữu Ích

### Khởi động & Dừng

```powershell
# Khởi động tất cả services
docker-compose up -d

# Dừng mà không xóa dữ liệu
docker-compose down

# Dừng và xóa tất cả volumes (CẢNH BÁO: Mất database!)
docker-compose down -v

# Restart services
docker-compose restart
```

### Xem Logs

```powershell
# Xem logs tất cả services
docker-compose logs -f

# Xem logs backend
docker-compose logs -f backend

# Xem logs database
docker-compose logs -f database

# Xem logs frontend
docker-compose logs -f frontend
```

### Xây dựng & Deploy

```powershell
# Rebuild images sau khi thay đổi code
docker-compose build

# Rebuild và restart
docker-compose up -d --build

# Rebuild mà không cache
docker-compose build --no-cache
```

### Truy cập Container

```powershell
# Vào shell backend
docker-compose exec backend bash

# Vào Python shell
docker-compose exec backend python

# Vào database shell
docker-compose exec database psql -U postgres -d uth_confms
```

### Kiểm tra Trạng thái

```powershell
# Xem tất cả containers đang chạy
docker-compose ps

# Xem chi tiết mạng Docker
docker network ls
docker network inspect congnghephanmem_confms-network

# Kiểm tra volumes
docker volume ls
```

---

## 🐛 Troubleshooting

### ❌ "Docker command not found"

**Giải pháp:**
- Cài đặt Docker Desktop
- Đảm bảo Docker Desktop đang chạy
- Restart PowerShell/Command Prompt

### ❌ Port đã được sử dụng

**Giải pháp 1:** Dừng ứng dụng khác đang dùng port

```powershell
# Kiểm tra process dùng port 5000
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F
```

**Giải pháp 2:** Thay đổi port trong docker-compose.yml

```yaml
backend:
  ports:
    - "5001:5000"  # Sử dụng port 5001 thay vì 5000
```

### ❌ Database connection failed

```powershell
# Xem logs database
docker-compose logs database

# Kiểm tra database status
docker-compose exec database pg_isready -U postgres

# Restart database
docker-compose restart database
```

### ❌ Trang web không hiển thị (404)

```powershell
# Kiểm tra frontend logs
docker-compose logs -f frontend

# Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend
```

### ❌ API không responds

```powershell
# Kiểm tra backend logs
docker-compose logs -f backend

# Test API connection
curl http://localhost:5000/api/health

# Rebuild backend
docker-compose build backend
docker-compose up -d --build backend
```

---

## 💾 Backup & Restore Database

### Backup

```powershell
# Dump database
docker-compose exec database pg_dump -U postgres uth_confms > backup.sql

# Backup volumes
docker run --rm -v congnghephanmem_postgres_data:/data -v %CD%:/backup alpine tar czf /backup/db-backup.tar.gz -C /data .
```

### Restore

```powershell
# Restore từ file
docker-compose exec -T database psql -U postgres uth_confms < backup.sql
```

---

## 🔒 Security Notes

### Development vs Production

**Development** (Hiện tại):
```env
FLASK_ENV=development
DEBUG=True
SECRET_KEY=your-secret-key-change-in-production
```

**Production**:
```env
FLASK_ENV=production
DEBUG=False
SECRET_KEY=<generate-secure-random-key>
JWT_SECRET_KEY=<generate-secure-random-key>
```

### Generate Secure Keys

```powershell
# Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# PowerShell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

---

## 📚 Tài liệu Thêm

- Chi tiết cấu hình: Xem [DOCKER.md](DOCKER.md)
- Backend setup: Xem [Backend/README.md](Backend/README.md)
- Frontend setup: Xem [frontend/README.md](frontend/README.md)
- Docker docs: https://docs.docker.com/

---

## ⚡ Performance Tips

1. **Giới hạn resources** trong docker-compose.yml:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

2. **Sử dụng named volumes** cho database (tốc độ hơn bind mounts)

3. **Enable BuildKit** để build nhanh hơn:
```powershell
$env:DOCKER_BUILDKIT=1
docker-compose build
```

---

## 🤝 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra logs: `docker-compose logs -f`
2. Xem [DOCKER.md](DOCKER.md) để tìm giải pháp chi tiết
3. Tạo issue trong repository

---

**Chúc bạn sử dụng vui vẻ! 🎉**
