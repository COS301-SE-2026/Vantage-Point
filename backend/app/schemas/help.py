from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, Field


class HelpArticleBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    content: str = Field(..., min_length=5)
    tags: list[str] = Field(default_factory=list)


class HelpArticleCreate(HelpArticleBase):
    pass


class HelpArticleUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    content: Optional[str] = Field(None, min_length=5)
    tags: Optional[list[str]] = None


class HelpArticleVote(BaseModel):
    vote_type: Literal["up", "down"]


class HelpArticleResponse(HelpArticleBase):
    id: int
    upvotes: int
    downvotes: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
