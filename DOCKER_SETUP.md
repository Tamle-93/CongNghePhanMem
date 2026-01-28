# 🐳 Hướng Dẫn Chạy UTH-ConfMS Với Docker

## 📋 Yêu Cầu Hệ Thống

- **Docker Desktop**: Phiên bản 20.10 trở lên
- **Docker Compose**: Phiên bản 2.0 trở lên
- **Git**: Để clone repository
- **RAM**: Tối thiểu 4GB khả dụng
- **Disk**: Tối thiểu 5GB trống
- **Hệ điều hành**: Windows 10/11, macOS 10.15+, hoặc Linux

---

## 🖥️ HƯỚNG DẪN CÀI ĐẶT TRÊN MÁY MỚI

### Bước 1: Cài Đặt Docker Desktop

#### Windows 10/11
1. Tải Docker Desktop từ: https://www.docker.com/products/docker-desktop/
2. Chạy file cài đặt và làm theo hướng dẫn
3. Khởi động lại máy tính nếu cần
4. Mở Docker Desktop và đợi khởi động xong
5. Kiểm tra cài đặt:
```powershell
docker --version
docker-compose --version
```

#### macOS
1. **Cách 1**: Tải Docker Desktop từ website chính thức
2. **Cách 2**: Dùng Homebrew:
```bash
brew install --cask docker
```
3. Mở Docker Desktop từ Applications
4. Kiểm tra:
```bash
docker --version
docker-compose --version
```

#### Linux (Ubuntu/Debian)
```bash
# Cài đặt Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Thêm user vào group docker (không cần sudo)
sudo usermod -aG docker $USER

# Logout và login lại, sau đó kiểm tra
docker --version
docker-compose --version
```

### Bước 2: Cài Đặt Git (nếu chưa có)

#### Windows
1. Tải Git từ: https://git-scm.com/download/win
2. Cài đặt với các tùy chọn mặc định

#### macOS
```bash
brew install git
```

#### Linux
```bash
sudo apt-get update
sudo apt-get install git
```

### Bước 3: Clone Repository

```bash
# Clone dự án từ GitHub
git clone https://github.com/Tamle-93/CongNghePhanMem.git

# Di chuyển vào thư mục dự án
cd CongNghePhanMem
```

### Bước 4: Cấu Hình Environment Variables

Tạo file `.env` trong thư mục Backend:

```bash
# Windows PowerShell
cd Backend
New-Item -Path ".env" -ItemType File

# macOS/Linux
cd Backend
touch .env
```

Mở file `.env` và thêm nội dung sau:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres123@database:5432/uth_confms
DB_HOST=database
DB_PORT=5432
DB_NAME=uth_confms
DB_USER=postgres
DB_PASSWORD=postgres123

# Flask Configuration
FLASK_APP=src/app.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here-change-in-production

# Redis Configuration
REDIS_URL=redis://redis:6379/0

# AI/ML Services (optional)
GEMINI_API_KEY=your-gemini-api-key-here

# CORS
CORS_ORIGINS=http://localhost,http://localhost:80
```

**Lưu ý quan trọng**:
- Thay `your-secret-key-here-change-in-production` bằng một chuỗi ngẫu nhiên dài
- Nếu sử dụng AI features, thêm GEMINI_API_KEY thực tế
- Với production, thay đổi mật khẩu database mạnh hơn

### Bước 5: Khởi Động Dự Án

```bash
# Quay về thư mục gốc (CongNghePhanMem)
cd ..

# Build và khởi động tất cả services
docker-compose up -d --build
```

Quá trình này sẽ mất 5-10 phút lần đầu tiên để:
- Tải các Docker images
- Build backend và frontend
- Khởi tạo database

### Bước 6: Khởi Tạo Database & Seed Data

```bash
# Đợi 30 giây để database khởi động xong
# Sau đó chạy migrations và seed data

# Windows PowerShell
docker-compose exec backend python seed_database.py

# macOS/Linux
docker-compose exec backend python seed_database.py
```

### Bước 7: Truy Cập Ứng Dụng

Mở trình duyệt và truy cập:

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000/api
- **API Documentation**: http://localhost:5000/api/docs

### Bước 8: Đăng Nhập

Sử dụng các tài khoản mẫu sau để đăng nhập:

| Vai trò | Username | Password |
|---------|----------|----------|
| Admin | admin | Admin@123 |
| Author | author01 | Author@123 |
| Chair | chair01 | Chair@123 |
| Reviewer | reviewer01 | Review@123 |

---

## 🚀 Cài Đặt Docker (Chi Tiết)

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

---

## 🔄 CÁC LỆNH THƯỜNG DÙNG

### Khởi Động Dự Án
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
# Build và start tất cả containers (lần đầu hoặc có thay đổi code)
docker-compose up -d --build

# Các lần sau chỉ cần
docker-compose up -d
```

### Dừng Dự Án
```bash
# Dừng tất cả containers (giữ lại data)
docker-compose stop

# Hoặc dừng và xóa containers (vẫn giữ data trong volumes)
docker-compose down
```

### Khởi Động Lại
```bash
# Restart toàn bộ
docker-compose restart

# Restart một service cụ thể
docker-compose restart backend
docker-compose restart frontend
```

### Xem Logs
```bash
# Xem tất cả logs (realtime)
docker-compose logs -f

# Xem logs của một service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database
```

### Kiểm Tra Trạng Thái
```bash
# Xem containers đang chạy
docker-compose ps

# Xem resource usage
docker stats
```

---

## 🔄 CẬP NHẬT CODE TỪ GITHUB

Khi có code mới trên GitHub:

```bash
# Dừng containers
docker-compose down

# Pull code mới
git pull origin main

# Rebuild và restart
docker-compose up -d --build
```

---

## 🗑️ XÓA VÀ CÀI LẠI TỪ ĐẦU

Nếu gặp lỗi nghiêm trọng hoặc muốn reset:

```bash
# Dừng và xóa tất cả (BAO GỒM CẢ DATA!)
docker-compose down -v

# Xóa images cũ
docker-compose down --rmi all

# Build và start lại từ đầu
docker-compose up -d --build

# Seed data lại
docker-compose exec backend python seed_database.py
```

**⚠️ CẢNH BÁO**: Lệnh `docker-compose down -v` sẽ XÓA TOÀN BỘ DỮ LIỆU trong database!

---

## 🐛 XỬ LÝ LỖI THƯỜNG GẶP

### 1. Lỗi "Port already in use" (Cổng đã được sử dụng)

**Triệu chứng**: 
```
Error: bind: address already in use
```

**Giải pháp**:

**Windows:**
```powershell
# Kiểm tra process đang dùng port 5000
netstat -ano | findstr :5000

# Xem process đang dùng port 80
netstat -ano | findstr :80

# Kill process (thay PID bằng số thực tế)
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
# Kiểm tra và kill process
sudo lsof -i :5000
sudo kill -9 <PID>

sudo lsof -i :80
sudo kill -9 <PID>
```

### 2. Lỗi "Database connection failed"

**Giải pháp**:
```bash
# Kiểm tra database container đã chạy chưa
docker-compose ps database

# Xem logs database để biết lỗi
docker-compose logs database

# Restart database
docker-compose restart database

# Đợi 10 giây rồi thử lại
```

### 3. Lỗi "Cannot connect to Docker daemon"

**Windows**: Kiểm tra Docker Desktop có đang chạy không

**Linux**:
```bash
# Khởi động Docker service
sudo systemctl start docker

# Kiểm tra status
sudo systemctl status docker
```

### 4. Frontend không kết nối được Backend

**Giải pháp**:
```bash
# Kiểm tra backend đang chạy
docker-compose ps backend

# Xem logs backend
docker-compose logs backend

# Restart cả 2
docker-compose restart backend frontend
```

### 5. Lỗi "Permission denied" khi chạy Docker (Linux)

```bash
# Thêm user vào docker group
sudo usermod -aG docker $USER

# Logout và login lại
# Hoặc chạy lệnh này (tạm thời)
newgrp docker
```

### 6. Containers khởi động chậm hoặc bị crash

```bash
# Kiểm tra resources
docker stats

# Tăng memory cho Docker Desktop:
# Settings > Resources > Memory > Tăng lên 4GB hoặc hơn
```

### 7. Build bị lỗi hoặc "Image not found"

```bash
# Xóa cache và rebuild
docker-compose build --no-cache
docker-compose up -d
```

---

## 💾 SAO LƯU VÀ PHỤC HỒI DATABASE

### Sao Lưu Database
```bash
# Backup toàn bộ database
docker-compose exec database pg_dump -U postgres uth_confms > backup_$(date +%Y%m%d_%H%M%S).sql

# Windows PowerShell
docker-compose exec database pg_dump -U postgres uth_confms > backup.sql
```

### Phục Hồi Database
```bash
# Restore từ file backup
docker-compose exec -T database psql -U postgres uth_confms < backup.sql

# Hoặc copy file vào container rồi restore
docker cp backup.sql $(docker-compose ps -q database):/backup.sql
docker-compose exec database psql -U postgres uth_confms < /backup.sql
```

---

## 🔧 TRUY CẬP VÀO CONTAINERS

### Backend Container
```bash
# Truy cập shell
docker-compose exec backend sh

# Chạy Python commands
docker-compose exec backend python -c "print('Hello')"

# Install thêm packages
docker-compose exec backend pip install package-name
```

### Frontend Container
```bash
# Truy cập shell
docker-compose exec frontend sh

# Install thêm npm packages
docker-compose exec frontend npm install package-name
```

### Database Container
```bash
# Truy cập PostgreSQL
docker-compose exec database psql -U postgres -d uth_confms

# Các lệnh SQL hữu ích:
# \dt - Xem danh sách tables
# \d table_name - Xem cấu trúc table
# SELECT * FROM users LIMIT 10; - Query data
# \q - Thoát
```

---

## 📝 CHECKLIST CÀI ĐẶT MÁY MỚI

- [ ] Cài đặt Docker Desktop và khởi động
- [ ] Cài đặt Git
- [ ] Clone repository từ GitHub
- [ ] Tạo file `.env` trong thư mục Backend
- [ ] Cấu hình environment variables trong `.env`
- [ ] Chạy `docker-compose up -d --build`
- [ ] Đợi 5-10 phút cho lần build đầu tiên
- [ ] Seed database: `docker-compose exec backend python seed_database.py`
- [ ] Truy cập http://localhost để kiểm tra
- [ ] Đăng nhập bằng tài khoản admin/Admin@123

---

## 🌐 CHẠY TRÊN PRODUCTION

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
