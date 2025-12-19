# File: scripts/seed_data.py
"""
Script để tạo dữ liệu mẫu
"""

import sys
import os
from datetime import datetime, timedelta

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.infrastructure.databases.base import SessionLocal
from src.infrastructure.models import (
    UserModel, ConferenceModel, TrackModel
)
import bcrypt

def hash_password(password):
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def main():
    print("="*60)
    print("🌱 SEEDING DATABASE WITH SAMPLE DATA")
    print("="*60)
    
    db = SessionLocal()
    
    try:
        # 1. Create users
        print("\n👤 Creating users...")
        
        admin = UserModel(
            Username='admin',
            PasswordHash=hash_password('Admin@123'),
            FullName='Admin User',
            Email='admin@uth.edu.vn',
            Role='Admin'
        )
        
        chair = UserModel(
            Username='chair01',
            PasswordHash=hash_password('Chair@123'),
            FullName='Dr. Nguyen Van A',
            Email='chair01@uth.edu.vn',
            Role='Chair'
        )
        
        author = UserModel(
            Username='author01',
            PasswordHash=hash_password('Author@123'),
            FullName='Tran Van B',
            Email='author01@uth.edu.vn',
            Role='Author'
        )
        
        reviewer = UserModel(
            Username='reviewer01',
            PasswordHash=hash_password('Reviewer@123'),
            FullName='Le Thi C',
            Email='reviewer01@uth.edu.vn',
            Role='Reviewer'
        )
        
        db.add_all([admin, chair, author, reviewer])
        db.commit()
        print(f"   ✓ Created 4 users")
        
        # 2. Create conference
        print("\n🎓 Creating conference...")
        
        conference = ConferenceModel(
            Chair_Users_Id=chair.Id,
            Name='UTH Scientific Conference 2025',
            Description='Annual scientific conference',
            SubmissionDeadline=datetime.now() + timedelta(days=30),
            ReviewDeadline=datetime.now() + timedelta(days=60),
            IsBlindReview=True
        )
        
        db.add(conference)
        db.commit()
        print(f"   ✓ Created 1 conference")
        
        # 3. Create tracks
        print("\n📚 Creating tracks...")
        
        tracks = [
            TrackModel(
                Conference_Id=conference.Id,
                Name='Artificial Intelligence',
                Code='AI'
            ),
            TrackModel(
                Conference_Id=conference.Id,
                Name='Internet of Things',
                Code='IoT'
            ),
            TrackModel(
                Conference_Id=conference.Id,
                Name='Blockchain Technology',
                Code='BCT'
            )
        ]
        
        db.add_all(tracks)
        db.commit()
        print(f"   ✓ Created {len(tracks)} tracks")
        
        print("\n✅ Sample data created successfully!")
        print("\n📊 Summary:")
        print(f"   - Users: 4 (admin, chair, author, reviewer)")
        print(f"   - Conferences: 1")
        print(f"   - Tracks: {len(tracks)}")
        
        print("\n🔐 Login credentials:")
        print(f"   Admin:    admin / Admin@123")
        print(f"   Chair:    chair01 / Chair@123")
        print(f"   Author:   author01 / Author@123")
        print(f"   Reviewer: reviewer01 / Reviewer@123")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ ERROR: {e}")
    finally:
        db.close()
    
    print("\n" + "="*60)

if __name__ == "__main__":
    main()