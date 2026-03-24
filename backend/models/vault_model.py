from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.database import Base
from datetime import datetime, timezone

class VaultDocument(Base):
    __tablename__ = "vault_documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    doc_type = Column(String(50), nullable=False)  # identity|employment|education|financial
    storage_url = Column(Text, nullable=False)     # path on disk or S3/R2 URL
    size_bytes = Column(Integer)
    expires_at = Column(DateTime, nullable=True)   # optional for passports etc
    deleted_at = Column(DateTime, nullable=True)   # soft delete
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    extracted_fields = Column(Text, nullable=True) # JSON stored as text for SQLite compatibility

    # Relationships
    user = relationship("User", back_populates="vault_documents")
    links = relationship("VaultPlanLink", back_populates="vault_document", cascade="all, delete-orphan")

class VaultPlanLink(Base):
    __tablename__ = "vault_plan_links"

    id = Column(Integer, primary_key=True, index=True)
    vault_doc_id = Column(Integer, ForeignKey("vault_documents.id"))
    plan_id = Column(Integer, ForeignKey("life_events.id")) # renamed from 'plans' in brief to match our schema
    task_id = Column(Integer, ForeignKey("tasks.id"))
    requirement_id = Column(String(100)) # e.g. "aadhaar_card"
    linked_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    vault_document = relationship("VaultDocument", back_populates="links")
