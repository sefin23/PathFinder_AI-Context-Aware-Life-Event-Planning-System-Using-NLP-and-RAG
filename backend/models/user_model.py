from sqlalchemy import Column, Integer, String, Boolean, Text
from sqlalchemy.orm import relationship
from backend.database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)

    # IANA timezone name (e.g. "Asia/Kolkata", "America/New_York").
    # All due_date values are stored in UTC; this field is used to convert
    # them into the user's local day when evaluating deadlines and reminders.
    timezone = Column(String, nullable=False, default="UTC")
    
    # Simulation Tracking (V2 Nav Promotion)
    simulation_count_last_7d = Column(Integer, default=0)
    show_sim_in_nav = Column(Boolean, default=False)
    extracted_profile = Column(Text, nullable=True) # JSON stored as text
    
    # Portal Registry fields
    job_city = Column(String(100), nullable=True)
    state_code = Column(String(10), nullable=True)

    # Relationships
    life_events = relationship("LifeEvent", back_populates="user", cascade="all, delete-orphan")
    reminder_logs = relationship("ReminderLog", back_populates="user", cascade="all, delete-orphan")
    personal_events = relationship("PersonalEvent", back_populates="user", cascade="all, delete-orphan")
    vault_documents = relationship("VaultDocument", back_populates="user", cascade="all, delete-orphan")


