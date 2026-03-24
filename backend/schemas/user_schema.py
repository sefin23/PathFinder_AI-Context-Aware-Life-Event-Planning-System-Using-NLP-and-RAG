from pydantic import BaseModel
from typing import Optional


class UserCreate(BaseModel):
    name: str
    email: str
    # IANA timezone string — defaults to UTC if not provided
    timezone: str = "UTC"


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    timezone: str
    extracted_profile: Optional[str] = None

    class Config:
        from_attributes = True
