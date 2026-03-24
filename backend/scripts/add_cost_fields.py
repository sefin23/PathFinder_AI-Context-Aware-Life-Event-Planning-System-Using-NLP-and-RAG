"""
Migration script to add cost estimation fields to tasks table.
Run this once to update the database schema.
"""
import sys
import os
from sqlalchemy import text

# Add parent directory to path to import backend modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.database import SessionLocal, engine

def add_cost_fields():
    """Add cost estimation columns to tasks table if they don't exist."""

    print("Adding cost estimation fields to tasks table...")

    db = SessionLocal()
    try:
        # Check if columns already exist (SQLite-compatible)
        result = db.execute(text("PRAGMA table_info(tasks)"))
        columns = {row[1] for row in result.fetchall()}

        if 'estimated_cost_min' in columns:
            print("Cost fields already exist. Skipping migration.")
            return

        # Add the new columns (SQLite doesn't support multiple columns in one ALTER)
        db.execute(text("ALTER TABLE tasks ADD COLUMN estimated_cost_min INTEGER"))
        db.execute(text("ALTER TABLE tasks ADD COLUMN estimated_cost_max INTEGER"))
        db.execute(text("ALTER TABLE tasks ADD COLUMN cost_currency VARCHAR(3) DEFAULT 'INR'"))

        db.commit()
        print("Successfully added cost estimation fields:")
        print("   - estimated_cost_min (INTEGER)")
        print("   - estimated_cost_max (INTEGER)")
        print("   - cost_currency (VARCHAR(3), default 'INR')")

    except Exception as e:
        print(f"Migration failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_cost_fields()
