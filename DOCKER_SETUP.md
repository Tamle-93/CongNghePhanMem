# 🐳 Hướng Dẫn Chạy UTH-ConfMS Với Docker

## 📋 Yêu Cầu Hệ Thống

- **Docker Desktop**: Phiên bản 20.10 trở lên
- **Docker Compose**: Phiên bản 2.0 trở lên
- **RAM**: Tối thiểu 4GB khả dụng
- **Disk**: Tối thiểu 5GB trống

## 🚀 Cài Đặt Docker

### Windows
1. Tải Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Cài đặt và khởi động Docker Desktop
3. Kiểm tra cài đặt:
```powershell
docker --version
docker-compose --version
```

### macOS
```bash
brew install --cask docker
```

### Linux (Ubuntu/Debian)
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

## 🏃 Chạy Dự Án

### 1. Clone Repository
```bash
git clone https://github.com/your-username/uth-confms.git
cd uth-confms
```

### 2. Cấu Hình Environment Variables
```bash
# Copy file mẫu
cp .env.example .env

# Chỉnh sửa file .env với các thông tin thực tế
# Đặc biệt quan trọng: GEMINI_API_KEY
```

### 3. Khởi Động Tất Cả Services
```bash
# Build và start tất cả containers
docker-compose up -d

# Hoặc build lại nếu có thay đổi code
docker-compose up -d --build
```

### 4. Khởi Tạo Database
```bash
# Chạy migrations
docker-compose exec backend python -m flask db upgrade

# Seed dữ liệu mẫu (optional)
docker-compose exec backend python seed_database.py
```

### 5. Truy Cập Ứng Dụng
- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000/api
- **Database**: localhost:5432
- **Redis**: localhost:6379

## 📊 Quản Lý Containers

### Xem Logs
```bash
# Xem tất cả logs
docker-compose logs -f

# Xem logs của 1 service cụ thể
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database
```

### Dừng Services
```bash
# Dừng tất cả
docker-compose stop

# Dừng 1 service
docker-compose stop backend
```

### Khởi Động Lại
```bash
# Restart tất cả
docker-compose restart

# Restart 1 service
docker-compose restart backend
```

### Dừng & Xóa Containers
```bash
# Dừng và xóa containers (giữ lại volumes/data)
docker-compose down

# Xóa cả volumes (MẤT TOÀN BỘ DỮ LIỆU!)
docker-compose down -v
```

## 🔧 Development Workflow

### Hot Reload (Development Mode)
Backend và Frontend đều được mount volumes, thay đổi code sẽ tự động reload:

```bash
# Chạy ở chế độ development
docker-compose up
```

### Truy Cập Container Shell
```bash
# Vào backend container
docker-compose exec backend sh

# Vào database container
docker-compose exec database psql -U postgres -d uth_confms

# Vào frontend container
docker-compose exec frontend sh
```

### Chạy Commands Trong Container
```bash
# Install thêm Python package
docker-compose exec backend pip install package-name

# Chạy tests
docker-compose exec backend pytest

# Install thêm npm package
docker-compose exec frontend npm install package-name
```

## 🐛 Troubleshooting

### Port Đã Được Sử Dụng
```bash
# Kiểm tra port đang dùng
netstat -ano | findstr :5000
netstat -ano | findstr :5432

# Thay đổi port trong docker-compose.yml
# Ví dụ: "8000:5000" thay vì "5000:5000"
```

### Database Connection Failed
```bash
# Kiểm tra database container đã chạy chưa
docker-compose ps

# Xem logs database
docker-compose logs database

# Restart database
docker-compose restart database
```

### Frontend Không Kết Nối Backend
```bash
# Kiểm tra nginx config
docker-compose exec frontend cat /etc/nginx/conf.d/default.conf

# Restart frontend
docker-compose restart frontend
```

### Xóa Cache và Rebuild
```bash
# Xóa tất cả containers, images, volumes
docker-compose down -v --rmi all

# Rebuild từ đầu
docker-compose build --no-cache
docker-compose up -d
```

## 📦 Production Deployment

### Build Production Images
```bash
# Build images với tag version
docker-compose -f docker-compose.prod.yml build

# Tag images
docker tag uth-confms-backend:latest your-registry/uth-confms-backend:v1.0.0
docker tag uth-confms-frontend:latest your-registry/uth-confms-frontend:v1.0.0
```

### Push to Registry
```bash
# Push to Docker Hub
docker push your-registry/uth-confms-backend:v1.0.0
docker push your-registry/uth-confms-frontend:v1.0.0
```

### Deploy to Server
```bash
# Trên server
docker pull your-registry/uth-confms-backend:v1.0.0
docker pull your-registry/uth-confms-frontend:v1.0.0

docker-compose -f docker-compose.prod.yml up -d
```

## 🔐 Security Best Practices

1. **Không commit file .env** vào Git
2. **Thay đổi SECRET_KEY** trong production
3. **Sử dụng mật khẩu mạnh** cho database
4. **Enable SSL/HTTPS** trong production
5. **Backup database** định kỳ:
```bash
docker-compose exec database pg_dump -U postgres uth_confms > backup_$(date +%Y%m%d).sql
```

## 📚 Tài Liệu Tham Khảo

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Flask Deployment](https://flask.palletsprojects.com/en/2.3.x/deploying/)
- [Vite Production Build](https://vitejs.dev/guide/build.html)

## 💡 Tips & Tricks

### Giảm Dung Lượng Images
```bash
# Xóa unused images
docker image prune -a

# Xóa unused volumes
docker volume prune
```

### Monitoring
```bash
# Xem resource usage
docker stats

# Xem container processes
docker-compose top
```

### Database Backup/Restore
```bash
# Backup
docker-compose exec database pg_dump -U postgres uth_confms > backup.sql

# Restore
docker-compose exec -T database psql -U postgres uth_confms < backup.sql
```

## 🆘 Hỗ Trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra logs: `docker-compose logs -f`
2. Kiểm tra container status: `docker-compose ps`
3. Tạo issue trên GitHub với logs chi tiết

---

**Lưu ý**: File này dành cho môi trường development. Để deploy production, cần cấu hình thêm HTTPS, load balancing, và security hardening.
