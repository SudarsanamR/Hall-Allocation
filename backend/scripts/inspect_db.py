import sqlite3
import os

DB_PATH = 'instance/app.db'
if not os.path.exists(DB_PATH):
    DB_PATH = 'app.db'

print(f"Connecting to: {DB_PATH}")
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='admin'")
result = cursor.fetchone()

if result:
    print("Admin Table Schema:")
    print(result[0])
else:
    print("Admin table not found.")

conn.close()
