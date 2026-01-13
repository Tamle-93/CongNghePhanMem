"""
Backend/scripts/seed_database.py
Script to create sample data - UPDATED
"""

import sys
import os
from datetime import datetime, timedelta

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src')))

from infrastructure.databases.base import SessionLocal
from infrastructure.models import (
    User, Conference, Track, AuditLog  # ✅ ADDED AuditLog
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
        
        admin = User(
            username='admin',
            password_hash=hash_password('Admin@123'),
            full_name='Admin User',
            email='admin@uth.edu.vn',
            role='Admin'
        )
        
        chair = User(
            username='chair01',
            password_hash=hash_password('Chair@123'),
            full_name='Dr. Nguyen Van A',
            email='chair01@uth.edu.vn',
            role='Chair'
        )
        
        author = User(
            username='author01',
            password_hash=hash_password('Author@123'),
            full_name='Tran Van B',
            email='author01@uth.edu.vn',
            role='Author'
        )
        
        reviewer = User(
            username='reviewer01',
            password_hash=hash_password('Reviewer@123'),
            full_name='Le Thi C',
            email='reviewer01@uth.edu.vn',
            role='Reviewer'
        )
        
        db.add_all([admin, chair, author, reviewer])
        db.commit()
        print(f"   ✓ Created 4 users")
        
        # ✅ Log user creation in audit log
        for user in [admin, chair, author, reviewer]:
            AuditLog.log_action(
                db_session=db,
                user_id=None,  # System action
                action='user_created',
                table_name='users',
                record_id=user.id,
                details=f'{{"username": "{user.username}", "role": "{user.role}"}}'
            )
        
        # 2. Create conference
        print("\n🎓 Creating conference...")
        
        conference = Conference(
            chair_id=chair.id,
            name='UTH Scientific Conference 2025',
            description='Annual scientific conference',
            submission_deadline=datetime.now() + timedelta(days=30),
            review_deadline=datetime.now() + timedelta(days=60),
            is_blind_review=True
        )
        
        db.add(conference)
        db.commit()
        print(f"   ✓ Created 1 conference")
        
        # ✅ Log conference creation
        AuditLog.log_action(
            db_session=db,
            user_id=chair.id,
            action='conference_created',
            table_name='conferences',
            record_id=conference.id,
            details=f'{{"name": "{conference.name}"}}'
        )
        
        # 3. Create tracks
        print("\n📚 Creating tracks...")
        
        tracks = [
            Track(
                conference_id=conference.id,
                name='Artificial Intelligence',
                code='AI'
            ),
            Track(
                conference_id=conference.id,
                name='Internet of Things',
                code='IoT'
            ),
            Track(
                conference_id=conference.id,
                name='Blockchain Technology',
                code='BCT'
            )
        ]
        
        db.add_all(tracks)
        db.commit()
        print(f"   ✓ Created {len(tracks)} tracks")
        
        # ✅ Log track creation
        for track in tracks:
            AuditLog.log_action(
                db_session=db,
                user_id=chair.id,
                action='track_created',
                table_name='tracks',
                record_id=track.id,
                details=f'{{"name": "{track.name}", "code": "{track.code}"}}'
            )
        
        print("\n✅ Sample data created successfully!")
        print("\n📊 Summary:")
        print(f"   - Users: 4 (admin, chair, author, reviewer)")
        print(f"   - Conferences: 1")
        print(f"   - Tracks: {len(tracks)}")
        print(f"   - Audit Logs: {db.query(AuditLog).count()}")
        
        print("\n🔐 Login credentials:")
        print(f"   Admin:    admin / Admin@123")
        print(f"   Chair:    chair01 / Chair@123")
        print(f"   Author:   author01 / Author@123")
        print(f"   Reviewer: reviewer01 / Reviewer@123")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()
    
    print("\n" + "="*60)

if __name__ == "__main__":
    main()