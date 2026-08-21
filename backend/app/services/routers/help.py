from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import col, delete, select

from app.database.session import get_session
from app.Models.profile_schemas import User
from app.Models.help import HelpArticleModel
from app.api.auth import require_group
from app.schemas.help import (
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
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    article = HelpArticleModel(
        title=body.title,
        content=body.content,
        tags=body.tags,
        created_at=now,
        updated_at=now,
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

    # Explicitly update modified time only on content/title updates
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
    """Delete a help article and its associated votes."""
    article = await _get_article_by_id(article_id, session)

    # 1. Delete associated votes to satisfy foreign key constraints
    vote_delete_stmt = delete(HelpArticleVoteModel).where(
        HelpArticleVoteModel.article_id == article_id
    )
    await session.execute(vote_delete_stmt)

    # 2. Delete article and commit transaction
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
    request: Request,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> HelpArticleModel:
    """Cast an upvote or downvote on an article."""
    article = await _get_article_by_id(article_id, session)

    # Clean IP extraction (handles potential comma-separated proxy header lists)
    forwarded = request.headers.get("x-forwarded-for")
    user_identifier = (
        forwarded.split(",")[0].strip()
        if forwarded
        else (request.client.host if request.client else "anonymous")
    )

    # Convert string literal from schema body to VoteType Enum
    vote_type = VoteType(body.vote_type)

    # Check for existing vote by user identifier
    stmt = select(HelpArticleVoteModel).where(
        HelpArticleVoteModel.article_id == article_id,
        HelpArticleVoteModel.user_identifier == user_identifier,
    )
    result = await session.execute(stmt)
    existing_vote = result.scalar_one_or_none()

    if existing_vote:
        if existing_vote.vote_type == vote_type:
            # Re-clicking same vote option toggles it off
            if vote_type == VoteType.UP or vote_type == "up":
                article.upvotes = max(0, article.upvotes - 1)
            else:
                article.downvotes = max(0, article.downvotes - 1)
            await session.delete(existing_vote)
        else:
            # Switching vote (e.g., up to down)
            if vote_type == VoteType.UP or vote_type == "up":
                article.upvotes += 1
                article.downvotes = max(0, article.downvotes - 1)
            else:
                article.downvotes += 1
                article.upvotes = max(0, article.upvotes - 1)
            existing_vote.vote_type = vote_type
            session.add(existing_vote)
    else:
        # First time voting on this article
        if vote_type == VoteType.UP or vote_type == "up":
            article.upvotes += 1
        else:
            article.downvotes += 1

        new_vote = HelpArticleVoteModel(
            article_id=article_id,
            user_identifier=user_identifier,
            vote_type=vote_type,
        )
        session.add(new_vote)

    # Save article without modifying updated_at
    session.add(article)
    await session.commit()
    await session.refresh(article)
    return article
    return article
