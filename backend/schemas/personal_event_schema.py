"""
Pydantic schemas for PersonalEvent CRUD.
"""
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel
from backend.models.personal_event_model import PersonalEventType


class PersonalEventCreate(BaseModel):
    title: str
    event_type: PersonalEventType = PersonalEventType.OTHER
    event_date: date
    notes: Optional[str] = None
    user_id: int = 1
    life_event_id: Optional[int] = None


class PersonalEventResponse(BaseModel):
    id: int
    user_id: int
    life_event_id: Optional[int]
    title: str
    event_type: PersonalEventType
    event_date: date
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
