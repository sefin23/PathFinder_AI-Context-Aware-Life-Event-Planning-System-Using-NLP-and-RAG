
from backend.database import SessionLocal
from backend.models import User, LifeEvent, Task, VaultDocument

def check_counts():
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        event_count = db.query(LifeEvent).count()
        task_count = db.query(Task).count()
        doc_count = db.query(VaultDocument).count()
        soft_deleted_count = db.query(VaultDocument).filter(VaultDocument.deleted_at != None).count()
        
        print(f"Users: {user_count}")
        print(f"Events: {event_count}")
        print(f"Tasks: {task_count}")
        print(f"Documents: {doc_count} (of which {soft_deleted_count} soft-deleted)")
        
        events = db.query(LifeEvent).all()
        for e in events:
            t_count = len(e.tasks)
            print(f"Event ID {e.id}: {e.title} - Tasks: {t_count}")
            
        docs = db.query(VaultDocument).all()
        for d in docs:
            print(f"Doc ID {d.id}: {d.name} (Type: {d.doc_type}, User: {d.user_id})")
            
    finally:
        db.close()

if __name__ == "__main__":
    check_counts()
