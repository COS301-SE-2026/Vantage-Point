# app/schemas/help.py
from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field


class HelpArticleBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    content: str = Field(..., min_length=5)
    tags: list[str] = []


class HelpArticleCreate(HelpArticleBase):
    pass


class HelpArticleUpdate(BaseModel):
    title: str | None = Field(None, min_length=3, max_length=255)
    content: str | None = Field(None, min_length=5)
    tags: list[str] | None = None


class HelpArticleVote(BaseModel):
    vote_type: Literal["up", "down"] = Field(..., alias="type")

    class Config:
        populate_by_name = True


class HelpArticleResponse(HelpArticleBase):
    id: int
    upvotes: int
    downvotes: int
    created_at: datetime
    updated_at: datetime
