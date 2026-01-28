# 🐳 Docker Configuration Files Manifest

## 📋 Docker-Related Files in Repository

### Root Level Files
- **docker-compose.yml** - Main Docker Compose configuration for full stack
- **DOCKER_SETUP.md** - Setup and installation guide for Docker

### Backend (Python/Flask)
- **Backend/Dockerfile** - Backend image definition
  - Base: `python:3.11-slim`
  - Installs: gcc, postgresql-client
  - Port: 5000
  
- **Backend/.dockerignore** - Excludes unnecessary files from build
  - `__pycache__/`
  - `*.pyc`
  - `.venv/`
  - `*.sqlite`
  - `*.log`

### Frontend (Node/Vite)
- **frontend/Dockerfile** - Frontend build and production image
  - Build stage: `node:20-alpine`
  - Production: `nginx:alpine`
  - Port: 80 (nginx)

- **frontend/.dockerignore** - Excludes node_modules, build files
  - `node_modules/`
  - `.git/`
  - `dist/`
  - `.env`

## 📁 Docker Compose Services

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| database | postgres:17.6-alpine | 5432 | PostgreSQL Database |
| backend | Custom (Python 3.11) | 5000 | Flask API Server |
| frontend | Custom (Nginx) | 80 | React Frontend |
| adminer | adminer:latest | 8080 | Database Admin Panel |

## 🚀 Quick Start Commands

```bash
# Build and start all services
docker-compose up --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f backend

# Rebuild specific service
docker-compose build backend

# Run command in container
docker-compose exec backend bash
```

## ⚠️ Important Notes

### Files NOT in Git:
- `.env` - Contains database credentials (see .env.example)
- `node_modules/` - Frontend dependencies
- `__pycache__/` - Python cache
- `.venv/` - Python virtual environment
- `*.log` - Log files

### Database:
- Automatically initialized on first run
- Seed data loaded from Backend/seed_database.py
- Persisted in Docker volume `postgres_data`

### Network:
- All services connected via `confms-network`
- Internal DNS: `backend`, `database`, `frontend`, `adminer`

## ✅ Files Status

- ✅ All Docker configuration files tracked in Git
- ✅ `.env` properly ignored by .gitignore
- ✅ Sensitive data excluded via .dockerignore
- ✅ Ready for CI/CD pipelines

## 🔧 Customization

### Environment Variables (set in .env):
```
DB_USER=postgres
DB_PASSWORD=postgres123
DB_NAME=uth_confms
FLASK_ENV=production
```

### Volumes:
- `postgres_data` - Database persistence
- `./Backend:/app` - Backend code (dev mode)
- `./frontend:/app` - Frontend code (dev mode)
