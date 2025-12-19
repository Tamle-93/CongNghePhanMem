# File: app.py
"""
Main Application Entry Point
"""

from flask import Flask
from flask_cors import CORS
from config import config
import os

def create_app(config_name=None):
    """
    Application Factory
    """
    if config_name is None:
        config_name = os.getenv('APP_ENV', 'development')
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize CORS
    CORS(app, resources={
        r"/*": {
            "origins": ["http://localhost:5173", "http://localhost:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Register blueprints (routes) here
    # from routes.auth_routes import auth_bp
    # app.register_blueprint(auth_bp)
    
    @app.route('/')
    def index():
        return {
            "status": "success",
            "message": "UTH-ConfMS API is running",
            "version": "1.0",
            "environment": config_name
        }
    
    @app.route('/health')
    def health():
        """Health check endpoint"""
        from src.infrastructure.databases.base import check_connection
        
        db_status = "connected" if check_connection() else "disconnected"
        
        return {
            "status": "healthy",
            "database": db_status,
            "environment": config_name
        }
    
    return app

if __name__ == '__main__':
    app = create_app()
    print(f"🚀 Starting application in {app.config['APP_ENV']} mode...")
    print(f"🌐 Running on http://localhost:{app.config['PORT']}")
    
    app.run(
        host='0.0.0.0',
        port=app.config['PORT'],
        debug=app.config['DEBUG']
    )