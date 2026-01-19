"""
Backend/src/settings/base.py
Multi-Database Configuration
"""
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration - shared settings"""
    
    # App Settings
    APP_ENV = os.getenv('APP_ENV', 'development')
    DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'
    PORT = int(os.getenv('PORT', 5000))
    
    # Database Type
    DB_TYPE = os.getenv('DB_TYPE', 'postgresql')
    
    # Database Connection
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = os.getenv('DB_PORT', '5432')
    DB_NAME = os.getenv('DB_NAME', 'uth_confms')
    DB_USER = os.getenv('DB_USER', 'postgres')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '1234')
    
    # Database Pool Settings
    DB_POOL_SIZE = int(os.getenv('DB_POOL_SIZE', 10))
    DB_POOL_RECYCLE = int(os.getenv('DB_POOL_RECYCLE', 3600))
    DB_ECHO = os.getenv('DB_ECHO', 'True').lower() == 'true'
    SECRET_KEY = os.getenv('SECRET_KEY', 'uth-confms-secret-key-2026-change-this-in-production')
    JWT_EXPIRATION_HOURS = int(os.getenv('JWT_EXPIRATION_HOURS', 24))
    
    @classmethod
    def get_database_url(cls):
        """Generate database URL based on DB_TYPE"""
        db_type = cls.DB_TYPE.lower()
        
        if db_type == 'postgresql':
            return f'postgresql://{cls.DB_USER}:{cls.DB_PASSWORD}@{cls.DB_HOST}:{cls.DB_PORT}/{cls.DB_NAME}'
        
        elif db_type == 'mysql':
            port = cls.DB_PORT or '3306'
            return f'mysql+pymysql://{cls.DB_USER}:{cls.DB_PASSWORD}@{cls.DB_HOST}:{port}/{cls.DB_NAME}'
        
        elif db_type == 'sqlite':
            db_path = os.getenv('SQLITE_PATH', f'{cls.DB_NAME}.db')
            return f'sqlite:///{db_path}'
        
        else:
            raise ValueError(f"Unsupported database type: {db_type}")
    
    # Security
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-change-in-production')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-jwt-secret-change-in-production')
    
    @property
    def DATABASE_URL(self):
        """Get database URL"""
        return os.getenv('DATABASE_URL', self.get_database_url())

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    DB_ECHO = True

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    DB_ECHO = False
    
    @staticmethod
    def init_app(app):
        assert os.getenv('SECRET_KEY'), 'SECRET_KEY must be set in production!'
        assert os.getenv('JWT_SECRET_KEY'), 'JWT_SECRET_KEY must be set in production!'

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DB_ECHO = False
    
    @classmethod
    def get_database_url(cls):
        db_type = cls.DB_TYPE.lower()
        
        if db_type == 'sqlite':
            return 'sqlite:///:memory:'
        elif db_type == 'postgresql':
            return f'postgresql://{cls.DB_USER}:{cls.DB_PASSWORD}@{cls.DB_HOST}:{cls.DB_PORT}/test_{cls.DB_NAME}'
        elif db_type == 'mysql':
            port = cls.DB_PORT or '3306'
            return f'mysql+pymysql://{cls.DB_USER}:{cls.DB_PASSWORD}@{cls.DB_HOST}:{port}/test_{cls.DB_NAME}'

# Dictionary for app.py
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

def get_config(env=None):
    """Get configuration instance"""
    if env is None:
        env = os.getenv('APP_ENV', 'development')
    
    config_class = config.get(env, config['default'])
    return config_class()