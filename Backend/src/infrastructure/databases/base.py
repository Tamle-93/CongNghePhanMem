"""
Backend/src/infrastructure/databases/base.py
Database Base và Engine - Multi-database support
"""

from sqlalchemy import create_engine, text, inspect
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import get_config  # Import từ config.py
import os

# Get current configuration
current_config = get_config()
DATABASE_URL = current_config.DATABASE_URL
DB_TYPE = current_config.DB_TYPE.lower()

# Mask password in logs
safe_url = DATABASE_URL
if hasattr(current_config, 'DB_PASSWORD') and current_config.DB_PASSWORD:
    safe_url = DATABASE_URL.replace(current_config.DB_PASSWORD, '***')

print(f" Connecting to {DB_TYPE.upper()}: {safe_url}")

# ============================================
# Engine Options - Different for each DB type
# ============================================
engine_options = {
    'echo': current_config.DB_ECHO,
}

# SQLite: No connection pool needed
if DB_TYPE == 'sqlite':
    print(" SQLite mode: single connection")
    engine_options.update({
        'connect_args': {'check_same_thread': False}  # Allow multi-threading
    })
else:
    # PostgreSQL & MySQL: Use connection pool
    print(f" Connection pool: size={current_config.DB_POOL_SIZE}")
    engine_options.update({
        'pool_pre_ping': True,
        'pool_size': current_config.DB_POOL_SIZE,
        'max_overflow': current_config.DB_POOL_SIZE * 2,
        'pool_recycle': current_config.DB_POOL_RECYCLE,
    })

# Create engine
try:
    engine = create_engine(DATABASE_URL, **engine_options)
    print(" Database engine created")
except Exception as e:
    print(f" Failed to create engine: {e}")
    raise

# Base class for models
Base = declarative_base()

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


def get_db():
    """
    Dependency injection for database session
    
    Usage:
        db = next(get_db())
        try:
            # Your operations
            db.commit()
        except:
            db.rollback()
        finally:
            db.close()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database - create all tables"""
    try:
        print(" Importing models...")
        
        # Import all models để SQLAlchemy nhận diện
        from infrastructure.models import (
            User, Conference, Track, Paper,
            PaperAuthor, Assignment, Review,
            Decision, Conflict
        )
        
        print(f" Creating tables in {DB_TYPE.upper()}...")
        Base.metadata.create_all(bind=engine)
        
        # Verify tables were created
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        print(f" Created {len(tables)} tables successfully!")
        if tables:
            for table in sorted(tables):
                print(f"   ✓ {table}")
        
        return True
        
    except Exception as e:
        print(f" Error creating tables: {e}")
        import traceback
        traceback.print_exc()
        return False


def drop_db():
    """Drop all tables - DANGER! Only for development"""
    
    # Safety check - không cho xóa trong production
    if os.getenv('APP_ENV') == 'production':
        print(" Cannot drop tables in PRODUCTION environment!")
        return False
    
    try:
        print("\n  WARNING: This will DELETE ALL TABLES!")
        print(f"   Database: {DB_TYPE.upper()} - {current_config.DB_NAME}")
        response = input("\nType 'YES' to confirm: ")
        
        if response != 'YES':
            print(" Operation cancelled")
            return False
        
        print("\n Dropping all tables...")
        Base.metadata.drop_all(bind=engine)
        print(" All tables dropped successfully!")
        return True
        
    except Exception as e:
        print(f" Error dropping tables: {e}")
        return False


def check_connection():
    """
    Check database connection and return status
    Returns: (success: bool, message: str)
    """
    try:
        print(f" Testing {DB_TYPE.upper()} connection...")
        
        with engine.connect() as conn:
            # Database-specific version checks
            if DB_TYPE == 'postgresql':
                result = conn.execute(text("SELECT version()"))
                version = result.fetchone()[0].split(',')[0]
                print(f" PostgreSQL connected!")
                print(f"   {version}")
                
            elif DB_TYPE == 'mysql':
                result = conn.execute(text("SELECT VERSION()"))
                version = result.fetchone()[0]
                print(f" MySQL connected!")
                print(f"   Version: {version}")
                
            elif DB_TYPE == 'sqlite':
                result = conn.execute(text("SELECT sqlite_version()"))
                version = result.fetchone()[0]
                print(f" SQLite connected!")
                print(f"   Version: {version}")
                
            else:
                # Generic check for other databases
                conn.execute(text("SELECT 1"))
                print(f" {DB_TYPE.upper()} connection successful!")
        
        return True, "Connection successful"
        
    except Exception as e:
        error_msg = str(e)
        print(f" Database connection failed!")
        print(f"   Error: {error_msg}")
        
        # Provide helpful hints based on error type
        if "refused" in error_msg.lower() or "can't connect" in error_msg.lower():
            print("\n Hint: Is the database server running?")
            if DB_TYPE == 'postgresql':
                print("   Try: sudo service postgresql start")
            elif DB_TYPE == 'mysql':
                print("   Try: sudo service mysql start")
                
        elif "authentication" in error_msg.lower() or "access denied" in error_msg.lower():
            print("\n Hint: Check your database credentials in .env")
            print(f"   DB_USER={current_config.DB_USER}")
            print(f"   DB_PASSWORD=***")
            
        elif "database" in error_msg.lower() and "does not exist" in error_msg.lower():
            print(f"\n Hint: Create the database first:")
            if DB_TYPE == 'postgresql':
                print(f"   createdb {current_config.DB_NAME}")
            elif DB_TYPE == 'mysql':
                print(f"   mysql -u root -p")
                print(f"   mysql> CREATE DATABASE {current_config.DB_NAME};")
                
        elif "no such table" in error_msg.lower():
            print("\n Hint: Initialize the database first:")
            print("   python manage_db.py init")
        
        return False, error_msg


def get_db_info():
    """Get current database configuration information"""
    info = {
        'type': DB_TYPE,
        'database': current_config.DB_NAME,
        'host': getattr(current_config, 'DB_HOST', 'N/A') if DB_TYPE != 'sqlite' else 'N/A',
        'port': getattr(current_config, 'DB_PORT', 'N/A') if DB_TYPE != 'sqlite' else 'N/A',
        'user': getattr(current_config, 'DB_USER', 'N/A') if DB_TYPE != 'sqlite' else 'N/A',
        'pool_size': getattr(current_config, 'DB_POOL_SIZE', 'N/A') if DB_TYPE != 'sqlite' else 'N/A',
        'echo': engine.echo,
        'url': safe_url,
    }
    return info


def reset_db():
    """
    Reset database: drop all tables and recreate them
    DANGER! Only for development/testing
    """
    if os.getenv('APP_ENV') == 'production':
        print(" Cannot reset database in PRODUCTION environment!")
        return False
    
    print("\n" + "="*60)
    print("  DATABASE RESET WARNING")
    print("="*60)
    print("This will DELETE ALL DATA and recreate tables!")
    print(f"Database: {DB_TYPE.upper()} - {current_config.DB_NAME}")
    print("="*60 + "\n")
    
    response = input("Type 'RESET' to confirm: ")
    
    if response != 'RESET':
        print(" Operation cancelled")
        return False
    
    # Step 1: Drop tables
    print("\n  Step 1: Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print(" Tables dropped")
    
    # Step 2: Create tables
    print("\n Step 2: Creating fresh tables...")
    if not init_db():
        return False
    
    print("\n Database reset completed successfully!")
    return True