nội dung file .env
# App Settings
```bash
APP_ENV=development
DEBUG=True
PORT=5000

# Database Settings
# Supported: postgresql, mysql, sqlite
DB_TYPE=postgresql #tên DB mn dùng.
DB_HOST=localhost #nhớ đặt tên và mật khẩu cho đúng 
DB_PORT=5432 #đổi dựa theo của mình
DB_NAME=uth_confms #không dổi
DB_USER=your_username 
DB_PASSWORD=your_password


# Security (CHANGE THESE IN PRODUCTION!)
SECRET_KEY=your-super-secret-key-change-in-production #2 cái này để yên 
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production

# Optional Settings
DB_POOL_SIZE=10
DB_POOL_RECYCLE=3600
SQL_ECHO=False
```

### 1. Chạy môi trường ảo

```bash
cd Backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. tải thư viện

#### nếu dùng PostgreSQL (Default):
```bash
pip install -r requirements.txt
```

#### Nếu dùng MySQL:
```bash
pip install -r requirements.txt
pip install pymysql
```



### 3. 

### sao chép nội dung sang .env `.env` file:

#### Option A: PostgreSQL
```bash
**Create PostgreSQL database:**
```bash
createdb uth_confms
```

#### Option B: chỉnh sửa theo của mình nhà này dành cho MySQL
```bash
**Create MySQL database:**
```sql
CREATE DATABASE uth_confms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```


### 4. Initialize Database

```bash
# thử tạo bản vào db
python scripts/create_database.py

# dữ liệu thử
python scripts/seed_database.py
```

### 5. chạy app

```bash
# From Backend/src directory
cd src
python app.py
```

Visit: http://localhost:5000


## 🔄 Switching Databases

```bash
# Switch to MySQL
DB_TYPE=mysql

# Switch to SQLite
DB_TYPE=sqlite

# Switch back to PostgreSQL
DB_TYPE=postgresql
```

