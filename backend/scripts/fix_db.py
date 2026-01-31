import sqlite3
import os

DB_PATH = 'instance/app.db'
if not os.path.exists(DB_PATH):
    DB_PATH = 'app.db'

print(f"Connecting to: {DB_PATH}")
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

try:
    print("Dropping admin table...")
    cursor.execute("DROP TABLE IF EXISTS admin")
    print("Admin table dropped.")
    
    # Also drop audit_log if it exists, as it links to admin
    cursor.execute("DROP TABLE IF EXISTS audit_log")
    print("AuditLog table dropped.")
    
    conn.commit()
    print("Tables dropped successfully. Restart the app to recreate them.")
except Exception as e:
    print(f"Error dropping tables: {e}")
finally:
    conn.close()
