"""
Backend/scripts/seed_database.py
Script to create sample data - UPDATED with Multi-Role Support
"""

import sys
import os
from datetime import datetime, timedelta

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src')))

from infrastructure.databases.base import SessionLocal
from infrastructure.models import User, Role, UserRole, Conference, Track
from domain.utils.auth_utils import hash_password

def seed_roles(db):
    """Seed system roles"""
    print("🔐 Creating roles...")
    
    roles_data = [
        {'name': 'Author', 'description': 'Can submit and manage papers'},
        {'name': 'Reviewer', 'description': 'Can review assigned papers'},
        {'name': 'Chair', 'description': 'Can manage conferences and make decisions'},
        {'name': 'Admin', 'description': 'Full system access'}
    ]
    
    roles = []
    for role_data in roles_data:
        # Check if role already exists
        existing = db.query(Role).filter(Role.name == role_data['name']).first()
        if existing:
            roles.append(existing)
            continue
        
        role = Role(
            name=role_data['name'],
            description=role_data['description']
        )
        roles.append(role)
        db.add(role)
    
    db.commit()
    print(f"   ✓ Created/Found {len(roles)} roles")
    return roles

def seed_users(db, roles_dict):
    """Seed users with multiple roles"""
    print("\n👤 Creating users...")
    
    users_data = [
        {
            'username': 'admin',
            'password': 'Admin@123',
            'email': 'admin@uth.edu.vn',
            'full_name': 'System Administrator',
            'roles': ['Admin']  # ✅ Admin có 1 role
        },
        {
            'username': 'chair01',
            'password': 'Chair@123',
            'email': 'chair01@uth.edu.vn',
            'full_name': 'Dr. Nguyen Van A',
            'roles': ['Chair', 'Reviewer']  # ✅ Chair có thể làm Reviewer
        },
        {
            'username': 'author01',
            'password': 'Author@123',
            'email': 'author01@uth.edu.vn',
            'full_name': 'Tran Thi B',
            'roles': ['Author']
        },
        {
            'username': 'author02',
            'password': 'Author@123',
            'email': 'author02@uth.edu.vn',
            'full_name': 'Le Van C',
            'roles': ['Author', 'Reviewer']  # ✅ Author kiêm Reviewer
        },
        {
            'username': 'reviewer01',
            'password': 'Reviewer@123',
            'email': 'reviewer01@uth.edu.vn',
            'full_name': 'Prof. Pham Van D',
            'roles': ['Reviewer', 'Chair']  # ✅ Reviewer kiêm Chair
        },
        {
            'username': 'reviewer02',
            'password': 'Reviewer@123',
            'email': 'reviewer02@uth.edu.vn',
            'full_name': 'Dr. Hoang Thi E',
            'roles': ['Reviewer']
        },
    ]
    
    users = []
    for user_data in users_data:
        # Create user
        user = User(
            username=user_data['username'],
            password_hash=hash_password(user_data['password']),
            email=user_data['email'],
            full_name=user_data['full_name']
        )
        users.append(user)
        db.add(user)
        db.flush()  # Get user.id
        
        # ✅ Assign roles to user
        for role_name in user_data['roles']:
            role = roles_dict.get(role_name)
            if role:
                user_role = UserRole(
                    user_id=user.id,
                    role_id=role.id,
                    conference_id=None,  # Global role
                    is_active=True
                )
                db.add(user_role)
    
    db.commit()
    print(f"   ✓ Created {len(users)} users with roles")
    return users

def seed_conferences(db, chair_user):
    """Seed conferences"""
    print("\n🎓 Creating conferences...")
    
    conferences_data = [
        {
            'name': 'UTH Scientific Conference 2025',
            'description': 'Annual scientific conference for research and innovation',
            'submission_deadline': datetime.now() + timedelta(days=30),
            'review_deadline': datetime.now() + timedelta(days=60),
            'start_date': datetime.now() + timedelta(days=90),
            'end_date': datetime.now() + timedelta(days=92),
            'is_blind_review': True
        },
        {
            'name': 'International Conference on AI 2025',
            'description': 'Artificial Intelligence and Machine Learning conference',
            'submission_deadline': datetime.now() + timedelta(days=45),
            'review_deadline': datetime.now() + timedelta(days=75),
            'start_date': datetime.now() + timedelta(days=100),
            'end_date': datetime.now() + timedelta(days=103),
            'is_blind_review': True
        },
    ]
    
    conferences = []
    for conf_data in conferences_data:
        conference = Conference(
            chair_id=chair_user.id,
            **conf_data
        )
        conferences.append(conference)
        db.add(conference)
    
    db.commit()
    print(f"   ✓ Created {len(conferences)} conferences")
    return conferences

def seed_tracks(db, conferences):
    """Seed tracks"""
    print("\n📚 Creating tracks...")
    
    tracks_data = {
        'UTH Scientific Conference 2025': [
            {'name': 'Artificial Intelligence', 'code': 'AI'},
            {'name': 'Internet of Things', 'code': 'IoT'},
            {'name': 'Blockchain Technology', 'code': 'BCT'},
            {'name': 'Software Engineering', 'code': 'SE'},
        ],
        'International Conference on AI 2025': [
            {'name': 'Machine Learning', 'code': 'ML'},
            {'name': 'Deep Learning', 'code': 'DL'},
            {'name': 'Natural Language Processing', 'code': 'NLP'},
            {'name': 'Computer Vision', 'code': 'CV'},
        ]
    }
    
    tracks = []
    for conference in conferences:
        if conference.name in tracks_data:
            for track_data in tracks_data[conference.name]:
                track = Track(
                    conference_id=conference.id,
                    name=track_data['name'],
                    code=track_data['code']
                )
                tracks.append(track)
                db.add(track)
    
    db.commit()
    print(f"   ✓ Created {len(tracks)} tracks")
    return tracks

def main():
    print("="*60)
    print("🌱 SEEDING DATABASE WITH SAMPLE DATA (Multi-Role Support)")
    print("="*60)
    
    db = SessionLocal()
    
    try:
        # 1. Seed roles first
        roles = seed_roles(db)
        roles_dict = {role.name: role for role in roles}
        
        # 2. Seed users with roles
        users = seed_users(db, roles_dict)
        
        # 3. Get chair user (has Chair role)
        chair_user = next((u for u in users if any(ur.role.name == 'Chair' for ur in u.user_roles)), users[0])
        
        # 4. Seed conferences
        conferences = seed_conferences(db, chair_user)
        
        # 5. Seed tracks
        tracks = seed_tracks(db, conferences)
        
        # Summary
        print("\n✅ Sample data created successfully!")
        print("\n📊 Summary:")
        print(f"   - Roles: {len(roles)}")
        print(f"   - Users: {len(users)}")
        print(f"   - Conferences: {len(conferences)}")
        print(f"   - Tracks: {len(tracks)}")
        
        print("\n🔐 Login Credentials:")
        print("="*60)
        print("   Admin:      admin / Admin@123        [Admin]")
        print("   Chair:      chair01 / Chair@123      [Chair, Reviewer]")
        print("   Author 1:   author01 / Author@123    [Author]")
        print("   Author 2:   author02 / Author@123    [Author, Reviewer]")
        print("   Reviewer 1: reviewer01 / Reviewer@123 [Reviewer, Chair]")
        print("   Reviewer 2: reviewer02 / Reviewer@123 [Reviewer]")
        print("="*60)
        
        # Show user roles details
        print("\n👥 User Roles Details:")
        print("="*60)
        for user in users:
            roles_str = ", ".join(user.roles)
            print(f"   {user.username:15} → {roles_str}")
        print("="*60)
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()
    
    print("\n" + "="*60)
    print("🎉 Database seeding completed!")
    print("="*60)

if __name__ == "__main__":
    main()