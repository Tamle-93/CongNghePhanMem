# Backend/src/app.py - FIXED VERSION
"""
Main Application Entry Point - COMPLETE WITH ALL CONTROLLERS
"""
import sys
import os

# Add src to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, jsonify
from flask_cors import CORS
from flask_mail import Mail
from config import config

# Import mail instance
mail = Mail()

def create_app(config_name=None):
    """Application Factory"""
    
    if config_name is None:
        config_name = os.getenv('APP_ENV', 'development')
    
    app = Flask(__name__)
    
    # Load configuration
    config_class = config.get(config_name, config['default'])
    app.config.from_object(config_class())
    
    # ========================================
    # EMAIL CONFIGURATION
    # ========================================
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
    app.config['MAIL_USE_SSL'] = os.getenv('MAIL_USE_SSL', 'False').lower() == 'true'
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER', 'noreply@uth-confms.edu.vn')
    
    # Initialize Mail
    mail.init_app(app)
    
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
    
    # ========================================
    #  REGISTER ALL CONTROLLERS
    # ========================================
    from api.controllers import (
        auth_bp,
        papers_bp,
        assignments_bp,
        conferences_bp,
        reviews_bp,
        decisions_bp,
        users_bp,
        admin_bp  # ← ADDED
    )
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/controller/auth')
    app.register_blueprint(papers_bp, url_prefix='/api/v1/papers')
    app.register_blueprint(assignments_bp, url_prefix='/api/v1/assignments')
    app.register_blueprint(conferences_bp, url_prefix='/api/v1/conferences')
    app.register_blueprint(reviews_bp, url_prefix='/api/v1/reviews')
    app.register_blueprint(decisions_bp, url_prefix='/api/v1/decisions')
    app.register_blueprint(users_bp, url_prefix='/api/v1/users')
    app.register_blueprint(admin_bp, url_prefix='/api/v1/admin')  # ← ADDED
    
    # ========================================
    # ROOT ENDPOINT
    # ========================================
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
                "papers": {
                    "list": "GET /api/v1/papers",
                    "submit": "POST /api/v1/papers",
                    "get": "GET /api/v1/papers/{id}"
                },
                "reviews": {
                    "my_reviews": "GET /api/v1/reviews/my-reviews",
                    "submit": "POST /api/v1/reviews"
                },
                "assignments": {
                    "my_assignments": "GET /api/v1/assignments/my-assignments",
                    "create": "POST /api/v1/assignments"
                },
                "admin": {
                    "statistics": "GET /api/v1/admin/statistics",
                    "users": "GET /api/v1/admin/users",
                    "audit_logs": "GET /api/v1/admin/audit-logs"
                },
                "docs": "/api/docs (coming soon)"
            }
        }), 200
    
    # ========================================
    # HEALTH CHECK
    # ========================================
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
            },
            "email": {
                "configured": bool(app.config.get('MAIL_USERNAME')),
                "server": app.config.get('MAIL_SERVER')
            }
        }), status_code
    
    # ========================================
    # ERROR HANDLERS
    # ========================================
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
    print(f" UTH-ConfMS API Starting")
    print(f"{'='*60}")
    print(f" Environment:  {app.config.get('APP_ENV')}")
    print(f"  Database:     {app.config.get('DB_TYPE').upper()}")
    print(f" DB Name:      {app.config.get('DB_NAME')}")
    print(f" Server:       http://localhost:{app.config.get('PORT')}")
    print(f" Debug Mode:   {app.config.get('DEBUG')}")
    print(f" Email:        {app.config.get('MAIL_USERNAME') or 'Not configured'}")
    print(f"{'='*60}\n")
    
    # Check database in development
    if app.config.get('APP_ENV') == 'development':
        print(" Development mode: Checking database...")
        from infrastructure.databases.base import check_connection
        
        connected, message = check_connection()
        if connected:
            print(" Database is accessible!\n")
        else:
            print(f"  Warning: {message}\n")
    
    # Start server
    app.run(
        host='0.0.0.0',
        port=app.config.get('PORT', 5000),
        debug=app.config.get('DEBUG', True),
        use_reloader=False
    )