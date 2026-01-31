import sqlite3
import os

db_path = os.path.join('instance', 'app.db')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT block, priority FROM hall GROUP BY block, priority ORDER BY priority")
rows = cursor.fetchall()

print("Current Block Priorities in DB:")
for r in rows:
    print(r)

conn.close()
