
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import json

import os

# Create absolute path to DB file to ensure persistence regardless of CWD 
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'sql_app.db')}" 
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables and seed the default demo user."""
    from backend.models import (
        User, LifeEvent, Task, ReminderLog, KnowledgeBaseEntry,
        VaultDocument, VaultPlanLink, TaskDependency, SimulationLog, PersonalEvent,
        TaskGuide
    )
    Base.metadata.create_all(bind=engine)
    _seed_default_user()



def _seed_default_user():
    """Ensure user id=1 ('New User') exists."""
    from backend.models import User
    db = SessionLocal()
    try:
        user1 = db.query(User).filter(User.id == 1).first()
        if not user1:
            db.add(User(
                id=1, 
                name="New User", 
                email="user@pathfinder.ai",
                job_city=None,
                state_code=None,
                timezone="Asia/Kolkata",
                extracted_profile=json.dumps({
                    "full_name": None,
                    "mobile": None,
                    "aadhaar_number": None,
                    "dob": None,
                    "joining_date": None,
                    "employer": None
                })
            ))
            db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
