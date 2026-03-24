
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from backend.database import SessionLocal
from backend.models.task_model import Task

def list_tasks():
    db = SessionLocal()
    tasks = db.query(Task).all()
    for t in tasks:
        print(f"{t.id}: [{t.task_type}] {t.title}")
    db.close()

if __name__ == "__main__":
    list_tasks()
