#!/bin/bash
# Docker startup script for UTH-ConfMS

set -e

echo "🚀 UTH-ConfMS Docker Startup Script"
echo "=================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your configuration"
    echo "   Then run this script again"
    exit 1
fi

# Parse arguments
ACTION=${1:-up}

case $ACTION in
    up|start)
        echo "🔨 Building images..."
        docker-compose build
        
        echo "🚀 Starting services..."
        docker-compose up -d
        
        echo "⏳ Waiting for database to be ready..."
        sleep 10
        
        echo "💾 Initializing database..."
        docker-compose exec -T backend python src/seed_database.py || true
        
        echo ""
        echo "✅ Services started successfully!"
        echo ""
        echo "📍 Access Points:"
        echo "   Frontend:     http://localhost:3000"
        echo "   Backend API:  http://localhost:5000"
        echo "   API Docs:     http://localhost:5000/api/docs"
        echo ""
        echo "📋 View logs: docker-compose logs -f"
        ;;
        
    down|stop)
        echo "⛔ Stopping services..."
        docker-compose down
        echo "✅ Services stopped"
        ;;
        
    restart)
        echo "🔄 Restarting services..."
        docker-compose restart
        echo "✅ Services restarted"
        ;;
        
    logs)
        docker-compose logs -f
        ;;
        
    backend-logs)
        docker-compose logs -f backend
        ;;
        
    frontend-logs)
        docker-compose logs -f frontend
        ;;
        
    db-shell)
        echo "🗄️  Entering PostgreSQL shell..."
        docker-compose exec database psql -U postgres -d uth_confms
        ;;
        
    backend-shell)
        echo "🐚 Entering backend shell..."
        docker-compose exec backend bash
        ;;
        
    rebuild)
        echo "🔨 Rebuilding all images..."
        docker-compose build --no-cache
        docker-compose up -d
        echo "✅ Rebuilt and restarted"
        ;;
        
    clean)
        echo "🧹 Removing all containers, volumes, and networks..."
        docker-compose down -v
        echo "✅ Cleaned up"
        ;;
        
    *)
        echo "Usage: $0 {up|down|restart|logs|backend-logs|frontend-logs|db-shell|backend-shell|rebuild|clean}"
        echo ""
        echo "Commands:"
        echo "  up              - Build and start all services"
        echo "  down            - Stop all services"
        echo "  restart         - Restart all services"
        echo "  logs            - View logs from all services"
        echo "  backend-logs    - View backend logs only"
        echo "  frontend-logs   - View frontend logs only"
        echo "  db-shell        - Enter PostgreSQL shell"
        echo "  backend-shell   - Enter backend Python shell"
        echo "  rebuild         - Rebuild images from scratch"
        echo "  clean           - Remove all containers and volumes"
        exit 1
        ;;
esac
