# Backend/seed_database.py
"""
Seed Database with Sample Data - FIXED
Tạo dữ liệu mẫu cho hệ thống UTH-ConfMS

USAGE:
    cd Backend
    python seed_database.py
"""
import sys
import os

# ⭐ Add src to path - QUAN TRỌNG!
current_dir = os.path.dirname(os.path.abspath(__file__))
src_dir = os.path.join(current_dir, 'src')
sys.path.insert(0, src_dir)

print(f"📂 Current directory: {current_dir}")
print(f"📂 Src directory: {src_dir}")
print(f"📂 Python path: {sys.path[0]}\n")

from infrastructure.databases.base import init_db, SessionLocal

# Create session
db_session = SessionLocal()
from infrastructure.models.user_model import User
from infrastructure.models.role_model import Role
from infrastructure.models.user_role_model import UserRole
from infrastructure.models.conference_model import Conference
from infrastructure.models.track_model import Track
from infrastructure.models.paper_model import PaperStatus, Paper
from infrastructure.models.paper_author_model import PaperAuthor
from infrastructure.models.assignment_model import Assignment
from infrastructure.models.review_model import Review
from infrastructure.models.decision_model import Decision
from infrastructure.models.audit_log_ai_model import AuditLogAI

from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
import json

def clear_all_data():
    """Xóa toàn bộ dữ liệu cũ"""
    print("🗑️  Clearing old data...")
    
    try:
        # Delete in correct order (respect foreign keys)
        db_session.query(Decision).delete()
        db_session.query(Review).delete()
        db_session.query(Assignment).delete()
        db_session.query(PaperAuthor).delete()
        db_session.query(Paper).delete()
        db_session.query(Track).delete()
        db_session.query(Conference).delete()
        db_session.query(UserRole).delete()
        db_session.query(AuditLogAI).delete()
        db_session.query(User).delete()
        db_session.query(Role).delete()
        
        db_session.commit()
        print("✅ Old data cleared successfully")
    except Exception as e:
        db_session.rollback()
        print(f"❌ Error clearing data: {e}")
        raise

def seed_roles():
    """Tạo 4 roles: Author, Reviewer, Chair, Admin"""
    print("\n👥 Creating roles...")
    
    roles_data = [
        {'id': 1, 'name': 'Author', 'description': 'Paper submitter'},
        {'id': 2, 'name': 'Reviewer', 'description': 'Paper reviewer'},
        {'id': 3, 'name': 'Chair', 'description': 'Conference chair'},
        {'id': 4, 'name': 'Admin', 'description': 'System administrator'}
    ]
    
    for role_data in roles_data:
        role = Role(**role_data)
        db_session.add(role)
    
    db_session.commit()
    print(f"✅ Created {len(roles_data)} roles")

def seed_users():
    """Tạo users mẫu cho 4 vai trò"""
    print("\n👤 Creating users...")
    
    users_data = [
        # Admin
        {
            'username': 'admin',
            'email': 'admin@uth.edu.vn',
            'full_name': 'System Admin',
            'password': 'Admin@123',
            'roles': ['Admin']
        },
        # Chairs
        {
            'username': 'chair01',
            'email': 'chair01@uth.edu.vn',
            'full_name': 'Nguyễn Văn Chủ Tọa',
            'password': 'Chair@123',
            'roles': ['Chair']
        },
        {
            'username': 'chair02',
            'email': 'chair02@uth.edu.vn',
            'full_name': 'Trần Thị Ban Tổ Chức',
            'password': 'Chair@123',
            'roles': ['Chair']
        },
        # Reviewers
        {
            'username': 'reviewer01',
            'email': 'reviewer01@uth.edu.vn',
            'full_name': 'Lê Văn Phản Biện A',
            'password': 'Review@123',
            'roles': ['Reviewer']
        },
        {
            'username': 'reviewer02',
            'email': 'reviewer02@uth.edu.vn',
            'full_name': 'Phạm Thị Phản Biện B',
            'password': 'Review@123',
            'roles': ['Reviewer']
        },
        {
            'username': 'reviewer03',
            'email': 'reviewer03@uth.edu.vn',
            'full_name': 'Hoàng Văn Phản Biện C',
            'password': 'Review@123',
            'roles': ['Reviewer']
        },
        # Authors
        {
            'username': 'author01',
            'email': 'author01@uth.edu.vn',
            'full_name': 'Nguyễn Văn Tác Giả A',
            'password': 'Author@123',
            'roles': ['Author']
        },
        {
            'username': 'author02',
            'email': 'author02@uth.edu.vn',
            'full_name': 'Trần Thị Tác Giả B',
            'password': 'Author@123',
            'roles': ['Author']
        },
        {
            'username': 'author03',
            'email': 'author03@uth.edu.vn',
            'full_name': 'Lê Văn Tác Giả C',
            'password': 'Author@123',
            'roles': ['Author']
        },
    ]
    
    created_users = []
    
    for user_data in users_data:
        # Create user
        user = User(
            username=user_data['username'],
            email=user_data['email'],
            full_name=user_data['full_name'],
            password_hash=generate_password_hash(user_data['password'])
        )
        db_session.add(user)
        db_session.flush()
        
        # Assign roles (GLOBAL - no conference_id)
        for role_name in user_data['roles']:
            role = db_session.query(Role).filter_by(name=role_name).first()
            user_role = UserRole(
                user_id=user.id,
                role_id=role.id,
                conference_id=None,  # Global role
                is_active=True,
                assigned_by=None,
                assigned_at=datetime.utcnow()
            )
            db_session.add(user_role)
        
        created_users.append(user)
    
    db_session.commit()
    print(f"✅ Created {len(created_users)} users")
    return created_users

def seed_conferences(chair_user):
    """Tạo 2 conferences mẫu với đầy đủ deadlines"""
    print("\n🎓 Creating conferences...")
    
    today = datetime.now()
    
    conferences_data = [
        {
            'name': 'UTH-CS Conference 2026',
            'description': 'International Conference on Computer Science',
            'location': 'Cao Lanh City, Dong Thap, Vietnam',
            'website_url': 'https://cs-conf.uth.edu.vn',
            
            # ⭐ ĐẦY ĐỦ DEADLINES
            'submission_deadline': today + timedelta(days=30),
            'review_deadline': today + timedelta(days=60),
            'decision_deadline': today + timedelta(days=75),
            'camera_ready_deadline': today + timedelta(days=90),
            'registration_deadline': today + timedelta(days=100),
            'conference_start_date': today + timedelta(days=120),
            'conference_end_date': today + timedelta(days=122),
            
            # Review settings
            'blind_review_type': 'double-blind',
            'max_reviewers_per_paper': 3,
            'min_reviewers_per_paper': 2,
            
            'chair_id': chair_user.id,
            'is_active': True
        },
        {
            'name': 'UTH-AI Symposium 2026',
            'description': 'Symposium on Artificial Intelligence and Machine Learning',
            'location': 'My Tho City, Tien Giang, Vietnam',
            'website_url': 'https://ai-symposium.uth.edu.vn',
            
            # ⭐ ĐẦY ĐỦ DEADLINES
            'submission_deadline': today + timedelta(days=45),
            'review_deadline': today + timedelta(days=75),
            'decision_deadline': today + timedelta(days=90),
            'camera_ready_deadline': today + timedelta(days=105),
            'registration_deadline': today + timedelta(days=115),
            'conference_start_date': today + timedelta(days=135),
            'conference_end_date': today + timedelta(days=137),
            
            # Review settings
            'blind_review_type': 'single-blind',
            'max_reviewers_per_paper': 4,
            'min_reviewers_per_paper': 3,
            
            'chair_id': chair_user.id,
            'is_active': True
        }
    ]
    
    conferences = []
    for conf_data in conferences_data:
        conf = Conference(**conf_data)
        db_session.add(conf)
        conferences.append(conf)
    
    db_session.commit()
    print(f"✅ Created {len(conferences)} conferences")
    return conferences

def seed_tracks(conferences):
    """Tạo tracks cho conferences"""
    print("\n📚 Creating tracks...")
    
    tracks_data = [
        # Conference 1
        {'conference_id': conferences[0].id, 'name': 'Machine Learning', 'code': 'ML', 'description': 'ML & Deep Learning'},
        {'conference_id': conferences[0].id, 'name': 'Software Engineering', 'code': 'SE', 'description': 'Software Development'},
        {'conference_id': conferences[0].id, 'name': 'Database Systems', 'code': 'DB', 'description': 'Database & Big Data'},
        {'conference_id': conferences[0].id, 'name': 'Computer Networks', 'code': 'CN', 'description': 'Networks & Security'},
        # Conference 2
        {'conference_id': conferences[1].id, 'name': 'Natural Language Processing', 'code': 'NLP', 'description': 'NLP & Text Mining'},
        {'conference_id': conferences[1].id, 'name': 'Computer Vision', 'code': 'CV', 'description': 'Image & Video Processing'},
        {'conference_id': conferences[1].id, 'name': 'Robotics', 'code': 'ROB', 'description': 'Robotics & Automation'},
        {'conference_id': conferences[1].id, 'name': 'AI Ethics', 'code': 'AIE', 'description': 'Responsible AI'},
    ]
    
    tracks = []
    for track_data in tracks_data:
        track = Track(**track_data)
        db_session.add(track)
        tracks.append(track)
    
    db_session.commit()
    print(f"✅ Created {len(tracks)} tracks")
    return tracks

def seed_papers(conferences, tracks, authors):
    """Tạo papers mẫu - FIXED"""
    print("\n📄 Creating papers...")
    
    papers_data = [
        {
            'conference_id': conferences[0].id,
            'track_id': tracks[0].id,  # ML track
            'submitter_id': authors[0].id,
            'title': 'Deep Learning for Image Classification',
            'abstract': 'This paper presents a novel approach to image classification using deep convolutional neural networks...',
            'keywords': 'deep learning, CNN, image classification',
            'pdf_path': 'uploads/papers/paper1.pdf',
            'status': PaperStatus.SUBMITTED  # ✅ Use enum
        },
        {
            'conference_id': conferences[0].id,
            'track_id': tracks[1].id,  # SE track
            'submitter_id': authors[1].id,
            'title': 'Agile Software Development Practices',
            'abstract': 'We explore modern agile practices and their impact on software quality...',
            'keywords': 'agile, scrum, software engineering',
            'pdf_path': 'uploads/papers/paper2.pdf',
            'status': PaperStatus.UNDER_REVIEW  # ✅ Use enum
        },
        {
            'conference_id': conferences[1].id,
            'track_id': tracks[4].id,  # NLP track
            'submitter_id': authors[2].id,
            'title': 'Transformer Models for Vietnamese NLP',
            'abstract': 'This research introduces improvements to transformer architectures for Vietnamese language processing...',
            'keywords': 'NLP, transformers, Vietnamese',
            'pdf_path': 'uploads/papers/paper3.pdf',
            'status': PaperStatus.SUBMITTED  # ✅ Use enum
        },
    ]
    
    papers = []
    for paper_data in papers_data:
        paper = Paper(**paper_data)
        db_session.add(paper)
        db_session.flush()
        
        # ✅ FIXED: Remove 'order' field, add 'author_order'
        paper_author = PaperAuthor(
            paper_id=paper.id,
            user_id=paper_data['submitter_id'],
            author_order=1,  # ✅ Use author_order instead of order
            is_corresponding=True
        )
        db_session.add(paper_author)
        
        papers.append(paper)
    
    db_session.commit()
    print(f"✅ Created {len(papers)} papers")
    return papers

def print_summary(users):
    """In ra thông tin tài khoản mẫu"""
    print("\n" + "="*60)
    print("🎉 DATABASE SEEDED SUCCESSFULLY!")
    print("="*60)
    print("\n📋 SAMPLE ACCOUNTS:\n")
    
    accounts = [
        ("Admin", "admin", "Admin@123"),
        ("Chair 01", "chair01", "Chair@123"),
        ("Chair 02", "chair02", "Chair@123"),
        ("Reviewer 01", "reviewer01", "Review@123"),
        ("Reviewer 02", "reviewer02", "Review@123"),
        ("Reviewer 03", "reviewer03", "Review@123"),
        ("Author 01", "author01", "Author@123"),
        ("Author 02", "author02", "Author@123"),
        ("Author 03", "author03", "Author@123"),
    ]
    
    print(f"{'Role':<15} {'Username':<15} {'Password':<15}")
    print("-" * 45)
    for role, username, password in accounts:
        print(f"{role:<15} {username:<15} {password:<15}")
    
    print("\n" + "="*60)
    print("🌐 Access the application at: http://localhost:3000")
    print("🔧 API Documentation at: http://localhost:5000/api/docs")
    print("="*60 + "\n")

def main():
    """Main seeding function"""
    print("\n🌱 Starting database seeding...\n")
    
    try:
        # Initialize database
        init_db()
        
        # Clear old data
        clear_all_data()
        
        # Seed data in order
        seed_roles()
        users = seed_users()
        
        # Get specific users
        admin = next(u for u in users if u.username == 'admin')
        chair = next(u for u in users if u.username == 'chair01')
        authors = [u for u in users if u.username.startswith('author')]
        reviewers = [u for u in users if u.username.startswith('reviewer')]
        
        # Seed conference data
        conferences = seed_conferences(chair)
        tracks = seed_tracks(conferences)
        papers = seed_papers(conferences, tracks, authors)
        
        # Print summary
        print_summary(users)
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        db_session.rollback()
        raise
    finally:
        db_session.close()

if __name__ == '__main__':
    main()