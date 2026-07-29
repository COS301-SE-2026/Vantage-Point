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


class LiveAdvancedMetrics(BaseModel):
    games_analyzed: int
    avg_kda: str
    avg_vision_score: float
    avg_kill_participation_pct: float
    avg_cs_per_minute: float
    avg_damage_per_minute: float
    avg_gold_per_minute: float
    win_rate: str
