from typing import Annotated, Sequence
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import col, select

from datetime import datetime, timezone
from app.database.session import get_session
from app.Models.help_models import HelpArticleModel
from app.schemas.help_schemas import (
    HelpArticleCreate,
    HelpArticleResponse,
    HelpArticleUpdate,
    HelpArticleVote,
)

router = APIRouter(prefix="/api/help", tags=["help"])


async def _get_article_by_id(
    article_id: int, session: AsyncSession
) -> HelpArticleModel:
    statement = select(HelpArticleModel).where(HelpArticleModel.id == article_id)
    result = await session.execute(statement)
    article = result.scalar_one_or_none()

    if article is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Help article not found",
        )
    return article


@router.get("", response_model=list[HelpArticleResponse])
async def get_help_articles(
    session: Annotated[AsyncSession, Depends(get_session)],
) -> Sequence[HelpArticleModel]:
    """Fetch all help articles, ordered by last updated date descending."""
    statement = select(HelpArticleModel).order_by(
        col(HelpArticleModel.updated_at).desc()
    )
    result = await session.execute(statement)
    return result.scalars().all()


@router.post(
    "",
    response_model=HelpArticleResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_help_article(
    body: HelpArticleCreate,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> HelpArticleModel:
    """Create a new help article."""
    article = HelpArticleModel(
        title=body.title,
        content=body.content,
        tags=body.tags,
    )
    session.add(article)
    await session.commit()
    await session.refresh(article)
    return article


@router.put(
    "/{article_id}",
    response_model=HelpArticleResponse,
    responses={404: {"description": "Help article not found"}},
)
async def update_help_article(
    article_id: int,
    body: HelpArticleUpdate,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> HelpArticleModel:
    """Update an existing help article."""
    article = await _get_article_by_id(article_id, session)

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(article, field, value)

    article.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)

    session.add(article)
    await session.commit()
    await session.refresh(article)
    return article


@router.delete(
    "/{article_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={404: {"description": "Help article not found"}},
)
async def delete_help_article(
    article_id: int,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> None:
    """Delete a help article."""
    article = await _get_article_by_id(article_id, session)
    await session.delete(article)
    await session.commit()


@router.post(
    "/{article_id}/vote",
    response_model=HelpArticleResponse,
    responses={404: {"description": "Help article not found"}},
)
async def vote_help_article(
    article_id: int,
    body: HelpArticleVote,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> HelpArticleModel:
    """Cast an upvote or downvote on an article."""
    article = await _get_article_by_id(article_id, session)

    if body.vote_type == "up":
        article.upvotes += 1
    elif body.vote_type == "down":
        article.downvotes += 1

    session.add(article)
    await session.commit()
    await session.refresh(article)
    return article
