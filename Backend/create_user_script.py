#!/usr/bin/env python
# Script to create new user

import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.infrastructure.databases.database import SessionLocal
from src.infrastructure.models.user import User
from src.infrastructure.models.role import UserRole
from src.domain.utils.auth_utils import hash_password
from sqlalchemy import text

db = SessionLocal()

try:
    # Check if user exists
    existing = db.query(User).filter(User.email == 'tamleminhtam437@gmail.com').first()
    
    if existing:
        print(f"User already exists: {existing.full_name} (ID: {existing.id})")
        # Update password
        existing.password_hash = hash_password('Tamle@123')
        db.commit()
        print("Password updated!")
    else:
        # Create new user
        new_user = User(
            username='tamleminhtam437@gmail.com',
            email='tamleminhtam437@gmail.com', 
            full_name='Le Minh Tam',
            password_hash=hash_password('Tamle@123'),
            is_blocked=False
        )
        db.add(new_user)
        db.commit()
        
        print(f"✅ User created successfully!")
        print(f"   ID: {new_user.id}")
        print(f"   Name: {new_user.full_name}")
        print(f"   Email: {new_user.email}")
        print(f"   Password: Tamle@123")
        
        # Get role IDs from database
        role_ids = db.execute(text("SELECT id, name FROM roles WHERE name IN ('Author', 'Reviewer', 'Chair', 'Admin')")).fetchall()
        print(f"   Roles to add: {len(role_ids)}")
        
        # Add roles
        for role_id, role_name in role_ids:
            user_role = UserRole(
                user_id=new_user.id,
                role_id=role_id,
                is_active=True
            )
            db.add(user_role)
            print(f"   ✓ Added role: {role_name}")
        
        db.commit()
        print(f"\n✅ All roles added!")
        
except Exception as e:
    db.rollback()
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
