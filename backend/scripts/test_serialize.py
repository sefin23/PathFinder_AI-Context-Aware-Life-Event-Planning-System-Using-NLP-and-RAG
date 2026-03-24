
from backend.database import SessionLocal
from backend.models.task_model import Task
from backend.schemas.task_schema import TaskResponse
import pydantic

def test_serialization():
    db = SessionLocal()
    try:
        # Get a parent task from Event 3
        task = db.query(Task).filter(Task.life_event_id == 3, Task.parent_id == None).first()
        if not task:
            print("No top-level task found for Event 3")
            return
            
        print(f"Serializing task: {task.title}")
        print(f"Subtasks count: {len(task.subtasks)}")
        
        try:
            resp = TaskResponse.model_validate(task)
            print("Successfully serialized!")
            print(resp.model_dump_json(indent=2))
        except Exception as e:
            print(f"Serialization failed: {e}")
            import traceback
            traceback.print_exc()
            
    finally:
        db.close()

if __name__ == "__main__":
    test_serialization()
