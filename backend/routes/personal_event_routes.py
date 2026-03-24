"""
CRUD routes for PersonalEvent.

POST   /personal-events/          create
GET    /personal-events/          list (filter by user_id, optionally life_event_id)
DELETE /personal-events/{id}      delete
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.personal_event_model import PersonalEvent
from backend.schemas.personal_event_schema import PersonalEventCreate, PersonalEventResponse

router = APIRouter()


@router.post("/", response_model=PersonalEventResponse, status_code=status.HTTP_201_CREATED)
def create_personal_event(body: PersonalEventCreate, db: Session = Depends(get_db)):
    """Create a personal / social calendar event for a user."""
    event = PersonalEvent(
        user_id=body.user_id,
        life_event_id=body.life_event_id,
        title=body.title,
        event_type=body.event_type,
        event_date=body.event_date,
        notes=body.notes,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.get("/", response_model=List[PersonalEventResponse])
def list_personal_events(
    user_id: int = 1,
    life_event_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """
    Return all personal events for a user.
    Optionally filter by life_event_id to get plan-scoped + global events.
    When life_event_id is provided, returns events for that plan AND global events (life_event_id IS NULL).
    """
    query = db.query(PersonalEvent).filter(PersonalEvent.user_id == user_id)
    if life_event_id is not None:
        # Return events tied to this plan OR global events (no plan link)
        from sqlalchemy import or_
        query = query.filter(
            or_(
                PersonalEvent.life_event_id == life_event_id,
                PersonalEvent.life_event_id == None,  # noqa: E711
            )
        )
    return query.order_by(PersonalEvent.event_date).all()


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_personal_event(event_id: int, db: Session = Depends(get_db)):
    """Delete a personal event."""
    event = db.query(PersonalEvent).filter(PersonalEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
    return None
