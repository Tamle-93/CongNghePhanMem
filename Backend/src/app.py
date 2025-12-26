"""
Backend/src/app.py
Main Application Entry Point
"""

import sys
import os

# Add src to Python path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from flask_cors import CORS
from config import config

def create_app(config_name=None):
    """
    Application Factory Pattern
    
    Args:
        config_name: 'development', 'production', 'testing', or None (auto-detect)
    
    Returns:
        Flask application instance
    """
    
    # Auto-detect environment if not specified
    if config_name is None:
        config_name = os.getenv('APP_ENV', 'development')
    
    app = Flask(__name__)
    
    # ✅ Load configuration from config dictionary
    config_class = config.get(config_name, config['default'])
    app.config.from_object(config_class())
    
    # Initialize CORS
    CORS(app, resources={
        r"/*": {
            "origins": ["http://localhost:5173"],  # Frontend URL
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Register blueprints here when you create them
    # Example:
    # from routes.auth_routes import auth_bp
    # app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    # from routes.conference_routes import conference_bp
    # app.register_blueprint(conference_bp, url_prefix='/api/conferences')
    
    
    # ==========================================
    # Root endpoint
    # ==========================================
    @app.route('/')
    def index():
        """API root endpoint"""
        return {
            "status": "success",
            "message": "UTH-ConfMS API is running",
            "version": "1.0.0",
            "environment": config_name,
            "database": {
                "type": app.config.get('DB_TYPE', 'unknown'),
                "name": app.config.get('DB_NAME', 'unknown')
            },
            "endpoints": {
                "health": "/health",
                "docs": "/api/docs (coming soon)"
            }
        }, 200
    
    
    # ==========================================
    # Health check endpoint
    # ==========================================
    @app.route('/health')
    def health():
        """
        Health check endpoint
        Returns database connection status and system info
        """
        from infrastructure.databases.base import check_connection, get_db_info
        
        # Check database connection
        db_connected, db_message = check_connection()
        db_info = get_db_info()
        
        # Overall health status
        status = "healthy" if db_connected else "unhealthy"
        status_code = 200 if db_connected else 503
        
        response = {
            "status": status,
            "timestamp": os.popen('date').read().strip(),
            "environment": config_name,
            "database": {
                "connected": db_connected,
                "message": db_message,
                "type": db_info.get('type', 'unknown'),
                "name": db_info.get('database', 'unknown'),
                "host": db_info.get('host', 'N/A'),
                "port": db_info.get('port', 'N/A')
            },
            "app": {
                "debug": app.config.get('DEBUG', False),
                "port": app.config.get('PORT', 5000)
            }
        }
        
        return response, status_code
    
    
    # ==========================================
    # Error handlers
    # ==========================================
    @app.errorhandler(404)
    def not_found(error):
        """Handle 404 errors"""
        return {
            "status": "error",
            "message": "Endpoint not found",
            "code": 404
        }, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        """Handle 500 errors"""
        return {
            "status": "error",
            "message": "Internal server error",
            "code": 500
        }, 500
    
    
    return app


# ==========================================
# Main entry point
# ==========================================
if __name__ == '__main__':
    # Create app instance
    app = create_app()
    
    # Print startup information
    print(f"\n{'='*60}")
    print(f"🚀 UTH-ConfMS API Starting")
    print(f"{'='*60}")
    print(f"📍 Environment:  {app.config.get('APP_ENV')}")
    print(f"🗄️  Database:     {app.config.get('DB_TYPE').upper()}")
    print(f"📦 DB Name:      {app.config.get('DB_NAME')}")
    print(f"🌐 Server:       http://localhost:{app.config.get('PORT')}")
    print(f"🔧 Debug Mode:   {app.config.get('DEBUG')}")
    print(f"{'='*60}\n")
    
    # Auto-initialize database in development mode
    if app.config.get('APP_ENV') == 'development':
        print("📋 Development mode detected")
        print("   Checking database initialization...\n")
        
        from infrastructure.databases.base import check_connection, init_db
        
        # Check if database is accessible
        connected, message = check_connection()
        
        if connected:
            print("\n💡 Database is accessible!")
            print("   To create/reset tables, run:")
            print("   python manage_db.py init")
            print("   python manage_db.py reset")
        else:
            print(f"\n⚠️  Warning: Cannot connect to database")
            print(f"   {message}")
            print("\n   Please check your .env configuration")
        
        print()
    
    # Start the Flask development server
    app.run(
        host='0.0.0.0',          # Allow external connections
        port=app.config.get('PORT', 5000),
        debug=app.config.get('DEBUG', True),
        use_reloader=False       # Disable auto-reload to prevent double initialization
    )