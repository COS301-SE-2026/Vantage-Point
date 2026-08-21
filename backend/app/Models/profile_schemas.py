from pydantic import BaseModel
from datetime import datetime


class User(BaseModel):
    sub: str
    groups: list[str]
    username: str | None
    email: str | None
    created_at: datetime | None = None
    updated_at: datetime | None = None
    scheduled_deletion: datetime | None = None


class UserProfile(BaseModel):
    sub: str
    username: str | None
    email: str
    created_at: datetime | None = None
    updated_at: datetime | None = None
    scheduled_deletion: datetime | None = None
