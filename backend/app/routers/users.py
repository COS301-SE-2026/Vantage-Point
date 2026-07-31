from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Query,
    UploadFile,
    status,
)
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from typing import Any, Annotated
from app.Models.profile_schemas import User
from app.database.models import Users
from app.api.auth import require_group
from app.database.session import get_session
from app.schemas.profile import LiveAdvancedMetrics, PlayerProfileResponse
from app.schemas.user import (
    AvatarUploadResponse,
    LinkGameAccountRequest,
    LinkGameAccountResponse,
    UpdateUserMeRequest,
    UserMeResponse,
)
from app.services.analytics import LiveAnalyticsService
from app.services.avatar_storage import delete_avatar_files, save_avatar
from app.services.match_ingest import resolve_platform, sync_matches_best_effort
from app.services.player_profile import build_player_profile
from app.services.profile_services import ProfileService
from app.services.user_accounts import (
    get_primary_linked_account,
    get_primary_linked_puuid,
    link_riot_account_for_user,
    riot_id_tag,
)

router = APIRouter(prefix="/users", tags=["users"])

bearer_scheme = HTTPBearer()


def _user_me_response(user: Users, account: Any) -> UserMeResponse:
    tag = riot_id_tag(account.game_name, account.tag_line) if account else None
    return UserMeResponse(
        cognito_sub=user.cognito_sub,
        email=user.email,
        display_name=user.display_name,
        avatar_url=user.avatar_url,
        riot_id_tag=tag,
        has_linked_riot=account is not None,
    )


async def _get_users(sub: str, session: AsyncSession) -> Users:
    statement = select(Users).where(Users.cognito_sub == sub)
    result: Any = await session.execute(statement)
    response: Users | None = result.scalar_one_or_none()

    if response is None:
        raise HTTPException(status_code=404, detail="User not found")
    return response


@router.get("/me", response_model=UserMeResponse)
async def get_me(
    current_user: Annotated[User, Depends(require_group(10))],
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    account = await get_primary_linked_account(session, current_user.sub)

    # Registering only creates the account in Cognito, so the first authenticated call
    # after sign-up has no local row yet. Materialise it from the Cognito profile the
    # same way POST /profile/get does, rather than 404ing a user who just signed in.
    statement = select(Users).where(Users.cognito_sub == current_user.sub)
    result: Any = await session.execute(statement)
    response: Users | None = result.scalar_one_or_none()

    if response is None:
        response = await ProfileService.get_or_create_profile(
            session, credentials.credentials
        )

    return _user_me_response(response, account)


@router.patch("/me", response_model=UserMeResponse)
async def update_me(
    body: UpdateUserMeRequest,
    current_user: Annotated[User, Depends(require_group(10))],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    response = await _get_users(current_user.sub, session)
    response.display_name = body.display_name.strip()
    session.add(response)
    await session.commit()
    await session.refresh(response)
    account = await get_primary_linked_account(session, current_user.sub)
    return _user_me_response(response, account)


@router.post("/me/avatar", response_model=AvatarUploadResponse)
async def upload_avatar(
    current_user: Annotated[User, Depends(require_group(10))],
    session: Annotated[AsyncSession, Depends(get_session)],
    file: Annotated[UploadFile, File(...)],
):

    avatar_path = await save_avatar(current_user.sub, file)
    response = await _get_users(current_user.sub, session)
    response.avatar_url = avatar_path
    session.add(response)
    await session.commit()
    return AvatarUploadResponse(avatar_url=avatar_path)


@router.delete("/me/avatar", status_code=status.HTTP_204_NO_CONTENT)
async def delete_avatar(
    current_user: Annotated[User, Depends(require_group(10))],
    session: Annotated[AsyncSession, Depends(get_session)],
):

    delete_avatar_files(current_user.sub)
    response = await _get_users(current_user.sub, session)
    response.avatar_url = None
    session.add(response)
    await session.commit()


@router.get("/me/profile", response_model=PlayerProfileResponse)
async def get_my_profile(
    current_user: Annotated[User, Depends(require_group(10))],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    account = await get_primary_linked_account(session, current_user.sub)
    riot_id_tag_value = (
        riot_id_tag(account.game_name, account.tag_line) if account else None
    )
    puuid = await get_primary_linked_puuid(session, current_user.sub)
    response = await _get_users(current_user.sub, session)
    return await build_player_profile(session, response, puuid, riot_id_tag_value)


@router.get(
    "/me/live-metrics",
    response_model=LiveAdvancedMetrics,
    summary="Live performance metrics for the linked account",
    description=(
        "Computes KDA, vision, CS/min, DPM, GPM, kill participation and win rate over "
        "the caller's most recent matches, read live from the Riot API."
    ),
)
async def get_my_live_metrics(
    count: int = Query(10, ge=1, le=20, description="Matches to analyse"),
    server_region: str | None = Query(
        None,
        description="Riot platform, e.g. euw1. Inferred from match history if omitted",
    ),
    current_user: User = Depends(require_group(10)),
    session: AsyncSession = Depends(get_session),
):
    puuid = await get_primary_linked_puuid(session, current_user.sub)
    if not puuid:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Link a Riot ID to see live metrics.",
        )

    platform = server_region or await resolve_platform(session, puuid) or "euw1"
    return await LiveAnalyticsService.get_live_metrics_from_api(
        server_region=platform,
        puuid=puuid,
        count=count,
    )


async def _link_game_account_impl(
    body: LinkGameAccountRequest,
    current_user: User,
    session: AsyncSession,
) -> LinkGameAccountResponse:
    puuid, tag = await link_riot_account_for_user(
        session,
        current_user.sub,
        riot_id=body.riot_id,
        game_name=body.game_name,
        tag_line=body.tag_line,
    )

    # Pull a first page of matches straight away, otherwise the dashboard the user
    # lands on next has nothing to show. Kept short because each match is its own Riot
    # round trip and the user is waiting on this response — the "Sync with Riot" button
    # on the match list pulls a deeper window. A Riot outage must not undo a successful
    # link, so failures here only get logged.
    imported = await sync_matches_best_effort(session, puuid, count=5)
    message = f"Successfully linked {tag}"
    if imported and imported["imported"]:
        message = f"{message} — imported {imported['imported']} recent matches"

    return LinkGameAccountResponse(
        puuid=puuid,
        riot_id_tag=tag,
        message=message,
    )


@router.post("/me/game-accounts", response_model=LinkGameAccountResponse)
async def link_game_account(
    body: LinkGameAccountRequest,
    current_user: Annotated[User, Depends(require_group(10))],
    session: Annotated[AsyncSession, Depends(get_session)],
):

    return await _link_game_account_impl(body, current_user, session)


@router.put("/me/game-accounts", response_model=LinkGameAccountResponse)
async def update_game_account(
    body: LinkGameAccountRequest,
    current_user: Annotated[User, Depends(require_group(10))],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    return await _link_game_account_impl(body, current_user, session)
