"""
Migration script to add scheduled_date column to tasks table.
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from sqlalchemy import text
from backend.database import SessionLocal, engine

def migrate():
    """Add scheduled_date column to tasks table if it doesn't exist."""
    db = SessionLocal()
    try:
        # Check if column exists
        result = db.execute(text("PRAGMA table_info(tasks)"))
        columns = [row[1] for row in result.fetchall()]

        if 'scheduled_date' not in columns:
            print("Adding scheduled_date column to tasks table...")
            db.execute(text("ALTER TABLE tasks ADD COLUMN scheduled_date DATETIME"))
            db.commit()
            print("✓ scheduled_date column added successfully")
        else:
            print("✓ scheduled_date column already exists")
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate()
