
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from backend.database import SessionLocal
from backend.models.task_model import Task
from backend.services.workflow_generation_service import _map_title_to_task_type

def fix_tasks():
    db = SessionLocal()
    tasks = db.query(Task).all()
    count = 0
    for t in tasks:
        if not t.task_type:
            new_type = _map_title_to_task_type(t.title)
            if new_type:
                t.task_type = new_type
                print(f"Updated '{t.title}' -> {new_type}")
                count += 1
    
    db.commit()
    db.close()
    print(f"Fixed {count} tasks.")

if __name__ == "__main__":
    fix_tasks()
