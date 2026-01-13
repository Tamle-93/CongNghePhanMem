"""
Backend/src/app.py
Main Application Entry Point - WITH AUTH
"""

import sys
import os

# Add src to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, jsonify
from flask_cors import CORS
from config import config


def create_app(config_name=None):
    """Application Factory"""
    
    if config_name is None:
        config_name = os.getenv('APP_ENV', 'development')
    
    app = Flask(__name__)
    
    # Load configuration
    config_class = config.get(config_name, config['default'])
    app.config.from_object(config_class())
    
    # Initialize CORS
    CORS(app, resources={
        r"/*": {
            "origins": ["http://localhost:5173", "http://localhost:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
            "allow_headers": ["Content-Type", "Authorization"],
            "expose_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })
    
    # Register API routes
    from api.v1 import v1_bp
    app.register_blueprint(v1_bp)
    
    # Root endpoint
    @app.route('/')
    def index():
        return jsonify({
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
                "auth": {
                    "register": "POST /api/v1/auth/register",
                    "login": "POST /api/v1/auth/login",
                    "me": "GET /api/v1/auth/me",
                    "logout": "POST /api/v1/auth/logout"
                },
                "docs": "/api/docs (coming soon)"
            }
        }), 200
    
    # Health check endpoint
    @app.route('/health')
    def health():
        from infrastructure.databases.base import check_connection, get_db_info
        
        db_connected, db_message = check_connection()
        db_info = get_db_info()
        
        status = "healthy" if db_connected else "unhealthy"
        status_code = 200 if db_connected else 503
        
        return jsonify({
            "status": status,
            "environment": config_name,
            "database": {
                "connected": db_connected,
                "message": db_message,
                "type": db_info.get('type', 'unknown'),
                "name": db_info.get('database', 'unknown')
            },
            "app": {
                "debug": app.config.get('DEBUG', False),
                "port": app.config.get('PORT', 5000)
            }
        }), status_code
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "status": "error",
            "message": "Endpoint not found",
            "code": 404
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            "status": "error",
            "message": "Internal server error",
            "code": 500
        }), 500
    
    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            "status": "error",
            "message": "Method not allowed",
            "code": 405
        }), 405
    
    return app


if __name__ == '__main__':
    app = create_app()
    
    print(f"\n{'='*60}")
    print(f"🚀 UTH-ConfMS API Starting")
    print(f"{'='*60}")
    print(f"📍 Environment:  {app.config.get('APP_ENV')}")
    print(f"🗄️  Database:     {app.config.get('DB_TYPE').upper()}")
    print(f"📦 DB Name:      {app.config.get('DB_NAME')}")
    print(f"🌐 Server:       http://localhost:{app.config.get('PORT')}")
    print(f"🔧 Debug Mode:   {app.config.get('DEBUG')}")
    print(f"{'='*60}\n")
    
    # Check database in development
    if app.config.get('APP_ENV') == 'development':
        print("📋 Development mode: Checking database...")
        from infrastructure.databases.base import check_connection
        
        connected, message = check_connection()
        if connected:
            print("✅ Database is accessible!\n")
        else:
            print(f"⚠️  Warning: {message}\n")
    
    # Start server
    app.run(
        host='0.0.0.0',
        port=app.config.get('PORT', 5000),
        debug=app.config.get('DEBUG', True),
        use_reloader=False
    )