# 📦 Docker Deployment Summary - UTH-ConfMS

## ✅ Hoàn thành

### Files Tạo/Sửa

| File | Mô tả |
|------|-------|
| `docker-compose.yml` | ✅ Định nghĩa tất cả services (Backend, Frontend, Database, Redis) |
| `Backend/Dockerfile` | ✅ Image định nghĩa cho Flask API |
| `frontend/Dockerfile` | ✅ Image định nghĩa cho React app (Nginx) |
| `docker-run.bat` | ✅ Script Windows để chạy Docker dễ dàng |
| `docker-run.sh` | ✅ Script Linux/Mac để chạy Docker dễ dàng |
| `.env.example` | ✅ Template biến môi trường |
| `DOCKER-QUICKSTART.md` | ✅ Hướng dẫn nhanh chạy Docker |
| `DOCKER.md` | ✅ Hướng dẫn chi tiết Docker deployment |
| `.dockerignore` | ✅ Tối ưu Docker build |

### Fixes Áp dụng

| Lỗi | Fix | Status |
|-----|-----|--------|
| Chair không xem được chi tiết paper | Query Conference trực tiếp thay vì lazy load | ✅ |
| Admin tạo user không login được | Sửa admin_service dùng werkzeug hash | ✅ |
| Chuyển vai trò bị lỗi | Thêm dropdown chọn vai trò, lưu activeRole | ✅ |
| Đăng ký cho phép vai trò đặc biệt | Giới hạn chỉ Author được tự đăng ký | ✅ |

---

## 🚀 Cách Chạy

### Windows
```batch
cd C:\Users\LENOVO\Desktop\CongNghePhanMem
docker-run.bat
```

### Linux/Mac
```bash
cd /path/to/CongNghePhanMem
./docker-run.sh up
```

### Manual (Tất cả OS)
```bash
docker-compose up -d
```

---

## 📍 Access Points Sau Khi Chạy

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| API Docs | http://localhost:5000/api/docs |
| Database (pgAdmin) | http://localhost:5050 (nếu enable) |

---

## 🔐 Test Accounts

| Username | Password | Role |
|----------|----------|------|
| admin | Admin@123 | Admin |
| chair01 | Chair01@123 | Chair |
| author01 | Author01@123 | Author |
| reviewer01 | Reviewer01@123 | Reviewer |

---

## 📊 Docker Architecture

```
┌─────────────────────────────────────────────────────┐
│                 Docker Network                      │
├──────────────┬──────────────┬──────────────┬────────┤
│  Frontend    │   Backend    │   Database   │ Redis  │
│  (Nginx)     │   (Flask)    │   (PG)       │ (Cache)│
│  :3000       │   :5000      │   :5432      │ :6379  │
└──────────────┴──────────────┴──────────────┴────────┘
```

---

## 🔄 Workflow Typical

```
1. Clone/Download project
   ↓
2. Cài Docker Desktop
   ↓
3. Chạy: docker-run.bat (Windows) hoặc ./docker-run.sh (Linux/Mac)
   ↓
4. Chờ containers khởi động (~30-60 giây)
   ↓
5. Mở http://localhost:3000
   ↓
6. Đăng nhập bằng tài khoản test
   ↓
7. Sử dụng ứng dụng!
```

---

## 🛠️ Các Lệnh Hữu Ích

```bash
# Khởi động
docker-compose up -d

# Dừng
docker-compose down

# Xem logs
docker-compose logs -f

# Rebuild
docker-compose build

# Truy cập backend shell
docker-compose exec backend bash

# Truy cập database
docker-compose exec database psql -U postgres -d uth_confms

# Kiểm tra status
docker-compose ps
```

---

## ⚙️ Environment Variables

Quan trọng nhất để config:

```env
# Database
DB_USER=postgres
DB_PASSWORD=postgres123
DB_NAME=uth_confms

# Security (CHANGE IN PRODUCTION!)
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

# Email (Optional)
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# AI (Optional)
GEMINI_API_KEY=your-api-key
```

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Port đã sử dụng | Thay đổi port trong docker-compose.yml |
| Database connection failed | Chờ DB ready hoặc restart: `docker-compose restart database` |
| Frontend 404 | Rebuild: `docker-compose build frontend` |
| API không responds | Check logs: `docker-compose logs -f backend` |

---

## 📚 Tài Liệu

- **Quick Start**: Xem [DOCKER-QUICKSTART.md](DOCKER-QUICKSTART.md)
- **Chi tiết**: Xem [DOCKER.md](DOCKER.md)
- **Backend**: Xem [Backend/README.md](Backend/README.md)
- **Frontend**: Xem [frontend/README.md](frontend/README.md)

---

## 🎯 Next Steps (Tùy chọn)

1. **CI/CD Pipeline**: Setup GitHub Actions để auto-build/deploy
2. **Monitoring**: Thêm Prometheus + Grafana để monitor
3. **Logging**: Centralize logs với ELK Stack
4. **Load Balancing**: Thêm Nginx reverse proxy
5. **SSL/HTTPS**: Setup Let's Encrypt certificates
6. **Database Backup**: Tự động backup hàng ngày

---

## 📝 Notes

- Tất cả data được lưu trong **Docker volumes** - persist khi container restart
- `.env` file **KHÔNG được commit** vào Git (đã thêm vào .gitignore)
- Trong production, **PHẢI thay đổi SECRET_KEY và JWT_SECRET_KEY**
- Database connection string tự động điều chỉnh cho Docker: `database` thay vì `localhost`

---

## ✨ Status: Ready for Docker Deployment! 🚀

**Tất cả đã sẵn sàng để chạy với Docker!**

Chỉ cần:
1. Mở terminal
2. Chạy: `docker-run.bat` (Windows) hoặc `./docker-run.sh up` (Linux/Mac)
3. Chờ ~1 phút
4. Mở http://localhost:3000
5. Đăng nhập và sử dụng!

---

**Good luck! 🎉**
