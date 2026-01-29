import sys
sys.path.insert(0, 'src')
from src.infrastructure.databases.database import SessionLocal
from src.infrastructure.models.user import User
from src.domain.utils.auth_utils import hash_password

db = SessionLocal()

# Update admin user password
admin = db.query(User).filter(User.username == 'adminuser').first()
if admin:
    admin.password_hash = hash_password('admin123')
    db.commit()
    print("✅ Admin password reset: admin123")
else:
    print("❌ Admin user not found")

# Update Lê Minh Tâm password
user = db.query(User).filter(User.email == 'tamleminhtam437@gmail.com').first()
if user:
    user.password_hash = hash_password('Tamle@123')
    db.commit()
    print("✅ Lê Minh Tâm password set: Tamle@123")
else:
    print("❌ User not found")

db.close()
