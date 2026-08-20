from datetime import datetime, timezone
from typing import Optional
from sqlmodel import JSON, Field, SQLModel


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
    updated_at: datetime = Field(
        default_factory=get_utc_now,
        sa_column_kwargs={"onupdate": get_utc_now},
    )