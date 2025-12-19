# File: scripts/create_database.py
"""
Script để tạo database và tất cả tables
"""

import sys
import os

# Add project root to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.infrastructure.databases.base import init_db, check_connection, engine
from src import Config


def main():
    print("="*60)
    print("🗄️  UTH-CONFMS DATABASE INITIALIZATION")
    print("="*60)
    
    # Show config
    print(f"\n📋 Configuration:")
    print(f"   Environment: {Config.APP_ENV}")
    print(f"   Database: {Config.DB_NAME}")
    print(f"   Host: {Config.DB_HOST}:{Config.DB_PORT}")
    print(f"   User: {Config.DB_USER}")
    
    # Check connection
    print(f"\n🔍 Checking database connection...")
    if not check_connection():
        print("\n❌ Cannot connect to database!")
        print("   Please check:")
        print("   1. PostgreSQL is running")
        print("   2. Database credentials in .env are correct")
        print("   3. Database exists (create it with: createdb CNPM)")
        return
    
    # Create tables
    print(f"\n📦 Creating tables...")
    try:
        init_db()
        print(f"\n✅ SUCCESS! Database initialized successfully!")
        
        # Show created tables
        print(f"\n📊 Created tables:")
        inspector = engine.dialect.get_inspector(engine)
        for table_name in inspector.get_table_names():
            print(f"   ✓ {table_name}")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        return
    
    print("\n" + "="*60)
    print("🎉 Database setup completed!")
    print("="*60)

if __name__ == "__main__":
    main()