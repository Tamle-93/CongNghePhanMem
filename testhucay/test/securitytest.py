from Backend.utils.security import *

def test_security():
    print("=== TEST 1: Hash & Verify Password ===")
    password = "MyPassword123!"
    hashed = hash_password(password)
    print(f"✅ Hashed: {hashed[:50]}...")
    print(f"✅ Verify correct: {verify_password(password, hashed)}")
    print(f"✅ Verify wrong: {verify_password('WrongPass', hashed)}")
    
    print("\n=== TEST 2: Generate & Decode Token ===")
    token = generate_token(1, "john_doe", "Author")
    print(f"✅ Token: {token[:50]}...")
    user_info = decode_token(token)
    print(f"✅ Decoded: {user_info}")
    
    print("\n=== TEST 3: Validate Username ===")
    print(f"✅ Valid: {validate_username('john_doe123')}")
    print(f"❌ Invalid: {validate_username('jo')}")
    
    print("\n=== TEST 4: Validate Password ===")
    print(f"✅ Valid: {validate_password('MyPass123!')}")
    print(f"❌ Invalid: {validate_password('weak')}")
    
    print("\n=== TEST 5: Validate Email ===")
    print(f"✅ Valid: {validate_email('user@example.com')}")
    print(f"❌ Invalid: {validate_email('invalid-email')}")

if __name__ == "__main__":
    test_security()