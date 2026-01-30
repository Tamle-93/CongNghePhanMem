import bcrypt
from domain.utils.auth_utils import verify_password

hash_from_db = "$2b$12$U0PiE1qC/eSaU743PGLoe.JJZ1j5vmI8ZfTzWE7BWN9jGaa7Mv.0q"
pwd = "Tamle@123"

# Test with bcrypt
result = bcrypt.checkpw(pwd.encode("utf-8"), hash_from_db.encode("utf-8"))
print(f"✅ bcrypt.checkpw result: {result}")

# Test with verify_password
result2 = verify_password(pwd, hash_from_db)
print(f"✅ verify_password result: {result2}")
