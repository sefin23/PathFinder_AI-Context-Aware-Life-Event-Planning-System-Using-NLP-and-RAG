from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import SessionLocal
from backend.models.life_event_model import LifeEvent
from backend.models.task_model import Task
from backend.services.recommendation_engine import generate_recommendations

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/{life_event_id}/recommendations", response_model=Dict[str, List[Dict[str, str]]])
def get_recommendations(life_event_id: int, db: Session = Depends(get_db)):
    """
    Returns context-aware recommendations based on current workflow status.
    Requires an active life event identifier.
    """
    life_event = db.query(LifeEvent).filter(LifeEvent.id == life_event_id).first()
    if not life_event:
         raise HTTPException(status_code=404, detail="Life event not found")
         
    tasks = db.query(Task).filter(Task.life_event_id == life_event.id).all()
    
    if not tasks:
        return {"recommendations": []}

    return generate_recommendations(tasks)
