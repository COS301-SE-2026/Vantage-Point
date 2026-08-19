from typing import Optional
from pydantic import BaseModel
from datetime import datetime


class UserResponse(BaseModel):
    username: str
    email: str | None
    sub: str | None
    user_created_date: datetime
    user_last_modified_date: datetime
    enabled: bool
    user_status: str
    role: Optional[str] = None


class Response(BaseModel):
    success: bool = True
    message: str = ""


class CreateGroupResponse(BaseModel):
    group_name: str
    user_pool_id: str
    description: str
    precedence: int
    last_modified_date: datetime
    creation_date: datetime


class MapAssetResponse(BaseModel):
    map_id: int
    display_name: str
    image_url: str


class ChampionAssetResponse(BaseModel):
    champion_id: int
    display_name: str
    image_url: str


class PlatformSettingsResponse(BaseModel):
    registrations_open: bool
