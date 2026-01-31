import sqlite3
import os
from werkzeug.security import check_password_hash

DB_PATH = 'instance/app.db'
if not os.path.exists(DB_PATH):
    DB_PATH = 'app.db'

print(f"Checking database at: {DB_PATH}")
conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

try:
    cursor.execute("SELECT * FROM admin WHERE username=?", ('SuperAdmin',))
    user = cursor.fetchone()
    
    if user:
        print("SuperAdmin found.")
        print(f"Role: {user['role']}")
        print(f"Verified: {user['is_verified']}")
        
        # Verify password
        # Default password is 'SuperAdmin'
        phash = user['password_hash']
        print(f"Password Hash: {phash[:20]}...")
        
        if check_password_hash(phash, 'SuperAdmin'):
            print("Password verify: SUCCESS")
        else:
            print("Password verify: FAILED")
            
    else:
        print("SuperAdmin NOT found.")
        
except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()
