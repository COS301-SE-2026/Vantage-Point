from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.database.models import GameAccounts, UserGameAccounts
from app.services.riot_api import (
    RiotApiNotConfiguredError,
    RiotApiUnauthorizedError,
    get_puuid_by_riot_id,
)
from app.utils.riot_id import parse_riot_id
from fastapi import HTTPException, status


def riot_id_tag(game_name: str, tag_line: str) -> str:
    return f"{game_name}#{tag_line}"


async def get_primary_linked_account(
    session: AsyncSession, user_id: str
) -> GameAccounts | None:
    result = await session.execute(
        select(GameAccounts)
        .join(UserGameAccounts, UserGameAccounts.puuid == GameAccounts.puuid)
        .where(UserGameAccounts.user_id == user_id)
        .limit(1)
    )
    return result.scalar_one_or_none()


async def get_primary_linked_puuid(session: AsyncSession, user_id: str) -> str | None:
    result = await session.execute(
        select(GameAccounts.puuid)
        .join(UserGameAccounts, UserGameAccounts.puuid == GameAccounts.puuid)
        .where(UserGameAccounts.user_id == user_id)
        .limit(1)
    )
    return result.scalar_one_or_none()


async def get_linked_puuids(session: AsyncSession, user_id: str) -> list[str]:
    result = await session.execute(
        select(GameAccounts.puuid)
        .join(UserGameAccounts, UserGameAccounts.puuid == GameAccounts.puuid)
        .where(UserGameAccounts.user_id == user_id)
    )
    return list(result.scalars().all())


def _parse_link_request(
    riot_id: str | None,
    game_name: str | None,
    tag_line: str | None,
) -> tuple[str, str]:
    if riot_id:
        try:
            return parse_riot_id(riot_id)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(exc),
            ) from exc
    if game_name and tag_line:
        return game_name.strip(), tag_line.strip()
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Provide riot_id or game_name and tag_line",
    )


async def link_riot_account_for_user(
    session: AsyncSession,
    user_id: str,
    *,
    riot_id: str | None = None,
    game_name: str | None = None,
    tag_line: str | None = None,
) -> tuple[str, str]:
    """Resolve Riot ID, upsert GameAccounts, keep a single link per user."""
    game_name, tag_line = _parse_link_request(riot_id, game_name, tag_line)

    try:
        puuid = await get_puuid_by_riot_id(game_name, tag_line)
    except RiotApiNotConfiguredError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    except RiotApiUnauthorizedError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc

    if not puuid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Could not find {game_name}#{tag_line} on Riot servers. "
                "Check spelling (game name + tag, e.g. 6lordz#1072) and that your "
                "developer API key is still valid."
            ),
        )

    account_result = await session.execute(
        select(GameAccounts).where(GameAccounts.puuid == puuid)
    )
    game_account = account_result.scalar_one_or_none()
    if game_account:
        game_account.game_name = game_name
        game_account.tag_line = tag_line
        session.add(game_account)
    else:
        game_account = GameAccounts(
            puuid=puuid,
            game="league_of_legends",
            game_name=game_name,
            tag_line=tag_line,
            account_level=0,
        )
        session.add(game_account)
        await session.flush()

    await session.execute(
        delete(UserGameAccounts).where(UserGameAccounts.user_id == user_id)
    )

    session.add(UserGameAccounts(user_id=user_id, puuid=puuid))
    await session.commit()

    return puuid, riot_id_tag(game_name, tag_line)
