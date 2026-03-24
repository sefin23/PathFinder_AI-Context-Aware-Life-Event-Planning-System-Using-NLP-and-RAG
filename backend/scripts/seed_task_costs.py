"""
Seed script to add realistic cost estimates to tasks based on task type.
"""
import sys
import os
import re

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.database import SessionLocal
from backend.models.task_model import Task

# Cost estimation rules based on task keywords (in INR)
COST_RULES = [
    # Government/Legal documents
    (r'aadhaar|aadhar', (0, 0)),  # Free
    (r'pan card', (0, 107)),  # Application fee
    (r'passport', (1500, 5000)),  # Normal/Tatkal
    (r'voter id|election', (0, 0)),  # Free
    (r'birth certificate', (50, 200)),
    (r'marriage certificate', (100, 500)),
    (r'notari', (100, 500)),  # Notarization
    (r'affidavit', (200, 1000)),
    (r'police clearance|background check', (500, 2000)),

    # Property/Housing
    (r'home inspection|property inspection', (3000, 10000)),
    (r'rent agreement|lease', (500, 2000)),
    (r'utility (bill|connection)', (500, 2000)),  # Connection fees
    (r'painting|furnish', (5000, 50000)),
    (r'moving|relocation|packers', (5000, 30000)),

    # Financial
    (r'bank account', (0, 500)),  # Usually free, some charges
    (r'loan|mortgage', (1000, 5000)),  # Processing fees
    (r'insurance', (5000, 50000)),  # Annual premium
    (r'tax|gst', (0, 0)),  # Filing is free, tax payment varies

    # Health
    (r'medical (exam|test)', (500, 5000)),
    (r'vaccin', (500, 3000)),
    (r'health insurance', (5000, 30000)),

    # Business/Professional
    (r'business registration|incorporation', (5000, 20000)),
    (r'trademark|patent', (5000, 50000)),
    (r'professional license', (1000, 10000)),
    (r'gst registration', (0, 5000)),
    (r'consultant|lawyer|ca', (5000, 50000)),
]

def estimate_cost(title: str, description: str = ''):
    """Estimate cost range based on task title and description."""
    text = (title + ' ' + (description or '')).lower()

    for pattern, (min_cost, max_cost) in COST_RULES:
        if re.search(pattern, text):
            return min_cost, max_cost

    # Default: no cost estimate
    return None, None

def seed_costs():
    """Add cost estimates to all tasks that don't have them."""
    db = SessionLocal()
    try:
        tasks = db.query(Task).filter(Task.estimated_cost_min == None).all()

        updated_count = 0
        for task in tasks:
            min_cost, max_cost = estimate_cost(task.title, task.description)

            if min_cost is not None:
                task.estimated_cost_min = min_cost
                task.estimated_cost_max = max_cost
                task.cost_currency = 'INR'
                updated_count += 1

        db.commit()
        print(f"Updated {updated_count} tasks with cost estimates (out of {len(tasks)} total tasks)")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_costs()
