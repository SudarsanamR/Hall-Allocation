import sqlite3
import os

# Path to database
DB_PATH = 'app.db' # Relative to backend root
if not os.path.exists(DB_PATH):
    # Try looking in instance folder if standard location
    if os.path.exists('instance/app.db'):
        DB_PATH = 'instance/app.db'

print(f"Connecting to database at: {DB_PATH}")

try:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. Inspect existing columns in 'admin'
    cursor.execute("PRAGMA table_info(admin)")
    columns = [row[1] for row in cursor.fetchall()]
    print(f"Existing columns in 'admin': {columns}")

    # 2. Add missing columns
    new_columns = {
        'role': "TEXT NOT NULL DEFAULT 'admin'",
        'is_verified': "BOOLEAN DEFAULT 0",
        'security_question': "TEXT",
        'security_answer_hash': "TEXT",
        'created_at': "DATETIME",
        'last_login': "DATETIME"
    }

    for col, data_type in new_columns.items():
        if col not in columns:
            print(f"Adding column '{col}'...")
            try:
                # SQLite doesn't support adding NOT NULL columns without default value easily in older versions
                # checking if we can add it directly
                alter_query = f"ALTER TABLE admin ADD COLUMN {col} {data_type}"
                cursor.execute(alter_query)
                print(f"Added {col}.")
            except Exception as e:
                print(f"Error adding {col}: {e}")

    # 3. Create AuditLog table if not exists (in case create_all failed/skipped)
    # Actually create_all should handle it, but let's be safe or let create_all do it.
    # We will trust create_all for new tables, just fixing existing admin table here.

    conn.commit()
    conn.close()
    print("Migration completed.")

except Exception as e:
    print(f"Migration failed: {e}")
