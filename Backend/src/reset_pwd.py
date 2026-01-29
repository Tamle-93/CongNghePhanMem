from infrastructure.databases.database import SessionLocal
from infrastructure.models.user import User
from domain.utils.auth_utils import hash_password

db = SessionLocal()

# Update admin user password
admin = db.query(User).filter(User.username == 'adminuser').first()
if admin:
    admin.password_hash = hash_password('admin123')
    db.commit()
    print("✅ Admin password reset")
else:
    print("❌ Admin not found")

# Update user password
user = db.query(User).filter(User.email == 'tamleminhtam437@gmail.com').first()
if user:
    user.password_hash = hash_password('Tamle@123')
    db.commit()
    print("✅ Tam password reset")
else:
    print("❌ Tam not found")

db.close()
