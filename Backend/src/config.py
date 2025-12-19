# import os
# from dotenv import load_dotenv

# load_dotenv()

# class Config:
#     SECRET_KEY = os.getenv('SECRET_KEY', 'dev_key')
#     SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
#     SQLALCHEMY_TRACK_MODIFICATIONS = False

# # Configuration settings for the Flask application

# import os

# class Config:
#     """Base configuration."""
#     SECRET_KEY = os.environ.get('SECRET_KEY') or 'a_default_secret_key'
#     DEBUG = os.environ.get('DEBUG', 'False').lower() in ['true', '1']
#     TESTING = os.environ.get('TESTING', 'False').lower() in ['true', '1']
#     DATABASE_URI = os.environ.get('DATABASE_URI') or 'postgresql://user:1234@localhost:5432/uth_confms' #nhớ đổi lại theo user của mình
#     CORS_HEADERS = 'Content-Type'

# class DevelopmentConfig(Config):
#     """Development configuration."""
#     DEBUG = True
#     DATABASE_URI = os.environ.get('DATABASE_URI') or 'postgresql://user:1234@localhost:5432/uth_confms' #nhớ đổi lại theo user của mình


# class TestingConfig(Config):
#     """Testing configuration."""
#     TESTING = True
#     DATABASE_URI = os.environ.get('DATABASE_URI') or 'postgresql://user:1234@localhost:5432/uth_confms'#nhớ đổi lại theo user của mình 


# class ProductionConfig(Config):
#     """Production configuration."""
#     DATABASE_URI = os.environ.get('DATABASE_URI') or 'postgresql://user:1234@localhost:5432/uth_confms'#nhớ đổi lại theo user của mình

    
# template = {
#     "swagger": "2.0",
#     "info": {
#         "title": "Todo API",
#         "description": "API for managing todos",
#         "version": "1.0.0"
#     },
#     "basePath": "/",
#     "schemes": [
#         "http",
#         "https"
#     ],
#     "consumes": [
#         "application/json"
#     ],
#     "produces": [
#         "application/json"
#     ]
# }
# class SwaggerConfig:
#     """Swagger configuration."""
#     template = {
#         "swagger": "2.0",
#         "info": {
#             "title": "Todo API",
#             "description": "API for managing todos",
#             "version": "1.0.0"
#         },
#         "basePath": "/",
#         "schemes": [
#             "http",
#             "https"
#         ],
#         "consumes": [
#             "application/json"
#         ],
#         "produces": [
#             "application/json"
#         ]
#     }

#     swagger_config = {
#         "headers": [],
#         "specs": [
#             {
#                 "endpoint": 'apispec',
#                 "route": '/apispec.json',
#                 "rule_filter": lambda rule: True,
#                 "model_filter": lambda tag: True,
#             }
#         ],
#         "static_url_path": "/flasgger_static",
#         "swagger_ui": True,
#         "specs_route": "/docs"
#     }
# File: config.py
"""
Application Configuration
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Base configuration"""
    
    # App
    APP_ENV = os.getenv('APP_ENV', 'development')
    DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'
    PORT = int(os.getenv('PORT', 5000))
    
    # Database
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = os.getenv('DB_PORT', '5432')
    DB_NAME = os.getenv('DB_NAME', 'uth_confms')
    DB_USER = os.getenv('DB_USER', 'postgres')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '1234')
    
    # Constructed Database URL
    DATABASE_URL = os.getenv(
        'DATABASE_URL',
        f'postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
    )
    
    # Security
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-super-secret-key-change-in-production')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-jwt-secret-key-change-in-production')
    
    @staticmethod
    def init_app(app):
        """Initialize application with this config"""
        pass

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DATABASE_URL = 'postgresql://postgres:1234@localhost:5432/test_uth_confms'

# Config dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}