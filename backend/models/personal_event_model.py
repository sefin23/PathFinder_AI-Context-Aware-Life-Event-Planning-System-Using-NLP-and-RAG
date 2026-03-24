"""
PersonalEvent — user's personal / social calendar entries.

Scoped to a user. Optionally linked to a life_event (plan) so the
Day Planner in JourneyDetail can filter to events relevant to
the plan's date range. If life_event_id is None the entry is global
(visible across all plans).
"""
from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from backend.database import Base
from datetime import datetime, timezone
import enum


class PersonalEventType(str, enum.Enum):
    DATE_NIGHT  = "DATE_NIGHT"
    FAMILY_DAY  = "FAMILY_DAY"
    TRAVEL      = "TRAVEL"
    MEDICAL     = "MEDICAL"
    BLOCKED     = "BLOCKED"
    OTHER       = "OTHER"


class PersonalEvent(Base):
    __tablename__ = "personal_events"

    id             = Column(Integer, primary_key=True, index=True)
    user_id        = Column(Integer, ForeignKey("users.id"), nullable=False)
    # Optional — link to a specific plan so it can be surfaced in that plan's Day Planner
    life_event_id  = Column(Integer, ForeignKey("life_events.id"), nullable=True)

    title          = Column(String, nullable=False)
    event_type     = Column(SQLEnum(PersonalEventType), default=PersonalEventType.OTHER, nullable=False)
    event_date     = Column(Date, nullable=False)          # The day of the commitment
    notes          = Column(String, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="personal_events")
