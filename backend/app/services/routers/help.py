from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

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

router = APIRouter(prefix="/api/v1/help", tags=["help"])


@router.get("", response_model=list[HelpArticleResponse])
async def list_help_articles(
    session: Annotated[AsyncSession, Depends(get_session)],
    search: Optional[str] = None,
):
    query = select(HelpArticleModel)
    if search:
        query = query.where(HelpArticleModel.title.ilike(f"%{search}%"))
    query = query.order_by(HelpArticleModel.created_at.desc())

    result = await session.execute(query)
    return result.scalars().all()


@router.post(
    "", response_model=HelpArticleResponse, status_code=status.HTTP_201_CREATED
)
async def create_help_article(
    payload: HelpArticleCreate,
    current_user: Annotated[User, Depends(require_group(10))],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    article = HelpArticleModel(
        title=payload.title,
        content=payload.content,
        tags=payload.tags,
    )
    session.add(article)
    await session.commit()
    await session.refresh(article)
    return article


@router.put("/{article_id}", response_model=HelpArticleResponse)
async def update_help_article(
    article_id: int,
    payload: HelpArticleUpdate,
    current_user: Annotated[User, Depends(require_group(10))],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    result = await session.execute(
        select(HelpArticleModel).where(HelpArticleModel.id == article_id)
    )
    article = result.scalar_one_or_none()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    if payload.title is not None:
        article.title = payload.title
    if payload.content is not None:
        article.content = payload.content
    if payload.tags is not None:
        article.tags = payload.tags

    await session.commit()
    await session.refresh(article)
    return article


@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_help_article(
    article_id: int,
    current_user: Annotated[User, Depends(require_group(10))],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    result = await session.execute(
        select(HelpArticleModel).where(HelpArticleModel.id == article_id)
    )
    article = result.scalar_one_or_none()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    await session.delete(article)
    await session.commit()


@router.post("/{article_id}/vote", response_model=HelpArticleResponse)
async def vote_help_article(
    article_id: int,
    payload: HelpArticleVote,
    session: Annotated[AsyncSession, Depends(get_session)],
):
    result = await session.execute(
        select(HelpArticleModel).where(HelpArticleModel.id == article_id)
    )
    article = result.scalar_one_or_none()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    if payload.vote_type == "up":
        article.upvotes += 1
    elif payload.vote_type == "down":
        article.downvotes += 1

    await session.commit()
    await session.refresh(article)
    return article
