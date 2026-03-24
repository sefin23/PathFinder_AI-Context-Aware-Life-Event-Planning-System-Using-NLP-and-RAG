from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship
from backend.database import Base
from datetime import datetime, timezone

class TaskDependency(Base):
    __tablename__ = "task_dependencies"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("life_events.id"))
    task_id = Column(Integer, ForeignKey("tasks.id"))       # blocked task
    blocked_by_id = Column(Integer, ForeignKey("tasks.id")) # task that blocks it
    joining_impact = Column(Float, default=0.0)             # 0.0-1.0 joining date weight

class SimulationLog(Base):
    __tablename__ = "simulation_log"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    plan_id = Column(Integer, ForeignKey("life_events.id"))
    task_id = Column(Integer, ForeignKey("tasks.id"))
    delay_days = Column(Integer)
    accepted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
