from sqlalchemy import Column, Integer, String, Text
from backend.database import Base

class TaskGuide(Base):
    """
    Stores exact URLs, steps, and prefill guidance for common task types.
    
    steps is a JSON array of objects:
    [{"num": 1, "title": "...", "description": "...", "action": {"type": "link"|"copy", "label": "...", "url"|"value": "..."}}]
    
    prefill_fields is a JSON array of field objects:
    [{"label": "Aadhaar number", "source": "vault.aadhaar.id_last4"}]
    """
    __tablename__ = "task_guides"

    id = Column(Integer, primary_key=True, index=True)
    task_type   = Column(String(100), unique=True, index=True, nullable=False)
    title       = Column(String(255), nullable=False)
    estimated_mins = Column(Integer, nullable=True)  # e.g. 5
    url         = Column(Text, nullable=True)         # Deep link
    steps       = Column(Text, nullable=False)        # JSON array of step objects
    prefill_fields = Column(Text, nullable=True)      # JSON array of field objects
    expected_result = Column(Text, nullable=True)
    what_to_save    = Column(Text, nullable=True)
    tags            = Column(Text, nullable=True)         # JSON array of strings
    required_doc_types = Column(Text, nullable=True)      # JSON list of vault doc_types needed
    updated_at      = Column(Text, server_default="CURRENT_TIMESTAMP")
