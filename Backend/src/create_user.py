import sys
sys.path.insert(0, '.')
from infrastructure.databases.database import SessionLocal
from infrastructure.models.user import User, UserRole, Role
from domain.utils.auth_utils import hash_password
from datetime import datetime

db = SessionLocal()

try:
    # Check if user already exists
    existing = db.query(User).filter(User.email == 'tamleminhtam437@gmail.com').first()
    if existing:
        print(f"⚠️ User already exists: {existing.full_name}")
        # Update password
        existing.password_hash = hash_password('Tamle@123')
        db.commit()
        print(f"✅ Password updated")
    else:
        # Create new user
        user = User(
            username='tamleminhtam437@gmail.com',
            email='tamleminhtam437@gmail.com',
            full_name='Lê Minh Tâm',
            password_hash=hash_password('Tamle@123'),
            is_blocked=False,
            created_at=datetime.now()
        )
        db.add(user)
        db.flush()
        
        # Get roles
        roles_list = db.query(Role).filter(Role.name.in_(['Author', 'Reviewer', 'Chair', 'Admin'])).all()
        
        # Add user roles
        for role in roles_list:
            user_role = UserRole(
                user_id=user.id,
                role_id=role.id,
                is_active=True
            )
            db.add(user_role)
        
        db.commit()
        print(f"✅ User created: {user.full_name}")
        print(f"   Email: {user.email}")
        print(f"   Password: Tamle@123")
        print(f"   Roles: Author, Reviewer, Chair, Admin")
        print(f"   User ID: {user.id}")

except Exception as e:
    db.rollback()
    print(f"❌ Error: {str(e)}")
finally:
    db.close()
