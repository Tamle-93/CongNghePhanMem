# File: scripts/drop_database.py
"""
Script để xóa tất cả tables (DANGER!)
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.infrastructure.databases.base import drop_db, check_connection

def main():
    print("="*60)
    print("  WARNING: DATABASE DROP SCRIPT")
    print("="*60)
    
    # Confirm
    confirm = input("\n This will DELETE ALL TABLES! Type 'YES' to continue: ")
    
    if confirm != 'YES':
        print(" Aborted.")
        return
    
    print("\n Checking database connection...")
    if not check_connection():
        print(" Cannot connect to database!")
        return
    
    print("\n  Dropping all tables...")
    try:
        drop_db()
        print("\n All tables dropped successfully!")
    except Exception as e:
        print(f" ERROR: {e}")

if __name__ == "__main__":
    main()