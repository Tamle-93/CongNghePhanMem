# # File: src/infrastructure/databases/base.py
# """
# Base và Database Engine cho SQLAlchemy
# """

# from sqlalchemy import create_engine
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import sessionmaker
# import os

# # Lấy Database URL từ environment
# DATABASE_URL = os.getenv(
#     'DATABASE_URL',
#     'postgresql://postgres:1234@localhost:5432/uth_confms'
# )

# # Tạo engine
# engine = create_engine(
#     DATABASE_URL,
#     echo=True,  # Log SQL queries (set False ở production)
#     pool_pre_ping=True
# )

# # Tạo Base class
# Base = declarative_base()

# # Session factory
# SessionLocal = sessionmaker(
#     autocommit=False,
#     autoflush=False,
#     bind=engine
# )

# def init_db():
#     """
#     Khởi tạo database (tạo tất cả tables)
#     """
#     # Import tất cả models trước khi tạo tables
#     from ..models import (
#         UserModel, ConferenceModel, TrackModel, PaperModel,
#         PaperAuthorModel, AssignmentModel, ReviewModel,
#         DecisionModel, ConflictModel
#     )
    
#     Base.metadata.create_all(bind=engine)
#     print("✅ Database initialized successfully!")

# def get_db():
#     """
#     Dependency injection để lấy database session
#     """
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()
# File: src/infrastructure/databases/base.py
"""
Database Base và Engine
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import Config

# Lấy Database URL từ config
DATABASE_URL = Config.DATABASE_URL

print(f"🔗 Connecting to database: {DATABASE_URL.replace(Config.DB_PASSWORD, '***')}")

# Tạo engine
engine = create_engine(
    DATABASE_URL,
    echo=True,  # Log SQL queries
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

# Base class
Base = declarative_base()

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

def get_db():
    """
    Dependency injection để lấy database session
    
    Usage:
        db = next(get_db())
        try:
            # Do something
        finally:
            db.close()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """
    Khởi tạo database (tạo tất cả tables)
    """
    # Import all models để SQLAlchemy biết
    from src.infrastructure.models import (
        UserModel, ConferenceModel, TrackModel, PaperModel,
        PaperAuthorModel, AssignmentModel, ReviewModel,
        DecisionModel, ConflictModel
    )
    
    print("📋 Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ All tables created successfully!")

def drop_db():
    """
    Xóa tất cả tables (DANGER!)
    """
    print("⚠️  WARNING: Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("✅ All tables dropped!")

def check_connection():
    """
    Kiểm tra kết nối database
    """
    try:
        conn = engine.connect()
        print("✅ Database connection successful!")
        conn.close()
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False