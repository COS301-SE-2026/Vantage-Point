from pydantic import BaseModel, Field


class UserMeResponse(BaseModel):
    id: str
    email: str
    display_name: str
    avatar_url: str | None = None
    riot_id_tag: str | None
    has_linked_riot: bool

class User(BaseModel):
    sub: str
    password: str
    username: str
    email: str

class UpdateUserMeRequest(BaseModel):
    display_name: str = Field(min_length=1, max_length=64)


class AvatarUploadResponse(BaseModel):
    avatar_url: str


class LinkGameAccountRequest(BaseModel):
    riot_id: str | None = Field(default=None, min_length=3, max_length=64)
    game_name: str | None = Field(default=None, min_length=1, max_length=32)
    tag_line: str | None = Field(default=None, min_length=1, max_length=16)


class LinkGameAccountResponse(BaseModel):
    puuid: str
    riot_id_tag: str
    message: str
