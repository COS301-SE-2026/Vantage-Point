from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional
from sqlmodel import JSON, Field, Relationship, SQLModel


class VoteType(str, Enum):
    UP = "up"
    DOWN = "down"


def get_utc_now() -> datetime:
    """Return current naive UTC datetime for database compatibility."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


class HelpArticleModel(SQLModel, table=True):
    __tablename__ = "help_articles"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(index=True, max_length=255)
    content: str
    tags: list[str] = Field(default_factory=list, sa_type=JSON)
    upvotes: int = Field(default=0)
    downvotes: int = Field(default=0)
    created_at: datetime = Field(default_factory=get_utc_now)
    updated_at: datetime = Field(default_factory=get_utc_now)

    # Automatically cascades deletions to associated votes
    votes: List["HelpArticleVoteModel"] = Relationship(
        back_populates="article",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class HelpArticleVoteModel(SQLModel, table=True):
    __tablename__ = "help_article_votes"

    id: Optional[int] = Field(default=None, primary_key=True)
    article_id: int = Field(
        foreign_key="help_articles.id",
        ondelete="CASCADE",
        index=True,
    )
    user_identifier: str = Field(index=True)
    vote_type: VoteType = Field()
    created_at: datetime = Field(default_factory=get_utc_now)

    article: Optional[HelpArticleModel] = Relationship(back_populates="votes")
