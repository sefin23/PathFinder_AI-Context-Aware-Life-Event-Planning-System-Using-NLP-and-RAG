from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from backend.database import Base
from datetime import datetime, timezone
import enum


class LifeEventStatus(str, enum.Enum):
    active = "active"
    paused = "paused"
    completed = "completed"


class LifeEvent(Base):
    __tablename__ = "life_events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    display_title = Column(String, nullable=True)
    description = Column(String, nullable=True)
    location = Column(String, nullable=True)
    timeline = Column(String, nullable=True)
    metadata_json = Column(String, nullable=True) # For extra facts like employer, car model, etc.
    requirements_json = Column(String, nullable=True) # Persisted AI-generated document requirements
    status = Column(SQLEnum(LifeEventStatus), default=LifeEventStatus.active, nullable=False)
    start_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    # Foreign key — every life event belongs to a user
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relationships
    user = relationship("User", back_populates="life_events")
    tasks = relationship("Task", back_populates="life_event", cascade="all, delete-orphan")
