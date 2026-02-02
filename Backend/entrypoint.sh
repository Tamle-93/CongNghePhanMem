#!/bin/bash
set -e

echo "Waiting for PostgreSQL..."
while ! pg_isready -h database -U ${DB_USER:-postgres} > /dev/null 2>&1; do
  sleep 1
done

echo "PostgreSQL is ready!"

echo "Running database setup..."
cd /app

# Check if we need to initialize the database
python -c "
from src.infrastructure.databases.base import engine, Base
from src.infrastructure.models import *

# Create all tables
Base.metadata.create_all(bind=engine)
print('✅ Database tables created/verified')

# Load initial data (seed database)
from src.infrastructure.databases.base import SessionLocal
from src.infrastructure.models.role_model import Role
from src.infrastructure.models.user_model import User
from werkzeug.security import generate_password_hash

db = SessionLocal()

# Create default roles if they don't exist
roles_to_create = [
    ('Admin', 'Administrator - Full system access'),
    ('Chair', 'Conference Chair - Manages conference'),
    ('Reviewer', 'Reviewer - Reviews papers'),
    ('Author', 'Author - Submits papers'),
]

for role_name, description in roles_to_create:
    if not db.query(Role).filter(Role.name == role_name).first():
        role = Role(name=role_name, description=description)
        db.add(role)
        print(f'✅ Created role: {role_name}')

db.commit()

# Create default admin if doesn't exist
if not db.query(User).filter(User.username == 'admin').first():
    admin = User(
        username='admin',
        email='admin@uth.edu.vn',
        full_name='System Admin',
        password_hash=generate_password_hash('Admin@123')
    )
    db.add(admin)
    db.flush()
    
    # Assign Admin role
    from src.infrastructure.models.user_role_model import UserRole
    admin_role = db.query(Role).filter(Role.name == 'Admin').first()
    if admin_role:
        user_role = UserRole(
            user_id=admin.id,
            role_id=admin_role.id,
            conference_id=None,
            is_active=True
        )
        db.add(user_role)
    
    db.commit()
    print('✅ Created default admin user with Admin role')

db.close()
"

echo "Database setup complete!"

echo "Starting Flask application..."
exec python -m flask run --host=0.0.0.0 --port=5000
