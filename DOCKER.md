# Docker Deployment Guide - UTH-ConfMS

## Quick Start

### Prerequisites
- Docker >= 20.10
- Docker Compose >= 2.0
- Git

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd CongNghePhanMem
```

### Step 2: Setup Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values (especially SECRET_KEY and JWT_SECRET_KEY)
nano .env
```

### Step 3: Build and Run
```bash
# Build images
docker-compose build

# Start all services
docker-compose up -d

# Check if services are running
docker-compose ps
```

### Step 4: Initialize Database
```bash
# Run migrations/seed data
docker-compose exec backend python src/seed_database.py
```

### Step 5: Access Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Docs:** http://localhost:5000/api/docs
- **pgAdmin (Database):** http://localhost:5050

---

## Common Docker Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f database
```

### Stop Services
```bash
docker-compose down
```

### Stop & Remove Everything (including volumes)
```bash
docker-compose down -v
```

### Rebuild After Code Changes
```bash
# Backend changes
docker-compose up -d --build backend

# Frontend changes
docker-compose up -d --build frontend
```

### Run Commands in Container
```bash
# Access backend shell
docker-compose exec backend bash

# Access database
docker-compose exec database psql -U postgres -d uth_confms
```

---

## Production Deployment

### 1. Update Environment Variables
```bash
# .env for production
FLASK_ENV=production
DEBUG=False
SECRET_KEY=<generate-secure-random-key>
JWT_SECRET_KEY=<generate-secure-random-key>
```

### 2. Security Recommendations
- [ ] Change default database password
- [ ] Set strong SECRET_KEY and JWT_SECRET_KEY
- [ ] Enable HTTPS with reverse proxy (nginx/caddy)
- [ ] Set up regular database backups
- [ ] Configure email service credentials
- [ ] Setup monitoring and logging

### 3. Use External Database (Recommended)
Instead of database service in docker-compose:
```env
DATABASE_URL=postgresql://user:password@your-managed-db-host:5432/uth_confms
```

### 4. Deploy on Server
```bash
# On your server
git clone <repository-url>
cd CongNghePhanMem
cp .env.example .env
# Edit .env
docker-compose -f docker-compose.yml up -d
```

### 5. Setup Reverse Proxy (Nginx Example)
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Troubleshooting

### Database Connection Failed
```bash
# Check if database is healthy
docker-compose ps database

# View database logs
docker-compose logs database

# Manually test connection
docker-compose exec backend python -c "from infrastructure.databases.base import db_session; print('Connected!')"
```

### Backend API Not Responding
```bash
# Rebuild backend
docker-compose down backend
docker-compose up -d --build backend

# Check logs
docker-compose logs -f backend
```

### Frontend Not Loading
```bash
# Rebuild frontend
docker-compose down frontend
docker-compose up -d --build frontend

# Check logs
docker-compose logs -f frontend
```

### Port Already in Use
```bash
# Change port mapping in docker-compose.yml
# For example, if 5000 is taken:
# ports:
#   - "5001:5000"
```

---

## File Structure for Docker

```
CongNghePhanMem/
├── docker-compose.yml        # Main compose file
├── .env                       # Environment variables (DO NOT COMMIT)
├── .env.example              # Template
├── Backend/
│   ├── Dockerfile            # Backend image definition
│   ├── requirements.txt       # Python dependencies
│   └── src/
│       ├── app.py
│       └── ...
├── frontend/
│   ├── Dockerfile            # Frontend image definition
│   ├── package.json
│   ├── public/
│   └── src/
└── .dockerignore             # Docker build ignore file
```

---

## Scale Services (Advanced)

```bash
# Scale backend to 3 instances
docker-compose up -d --scale backend=3

# Use load balancer (nginx) for backend services
```

---

## Backup & Restore

### Backup Database
```bash
docker-compose exec database pg_dump -U postgres uth_confms > backup.sql
```

### Restore Database
```bash
docker-compose exec -T database psql -U postgres uth_confms < backup.sql
```

---

## CI/CD Integration (GitHub Actions Example)

```yaml
name: Build and Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build images
        run: docker-compose build
      - name: Push to registry
        run: docker-compose push
      - name: Deploy to server
        run: |
          # SSH to server and pull latest
          ssh user@server 'cd /app && docker-compose pull && docker-compose up -d'
```

---

## Support

For issues or questions, please refer to the project README or create an issue in the repository.
