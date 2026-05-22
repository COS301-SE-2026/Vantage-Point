from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.deps import get_current_user
from app.database.models import Users
from app.database.session import get_session
from app.schemas.profile import PlayerProfileResponse
from app.schemas.user import (
    AvatarUploadResponse,
    LinkGameAccountRequest,
    LinkGameAccountResponse,
    UpdateUserMeRequest,
    UserMeResponse,
)
from app.services.avatar_storage import delete_avatar_files, save_avatar
from app.services.player_profile import build_player_profile
from app.services.user_accounts import (
    get_primary_linked_account,
    get_primary_linked_puuid,
    link_riot_account_for_user,
    riot_id_tag,
)

router = APIRouter(prefix="/api/v1/users", tags=["users"])


def _user_me_response(user: Users, account) -> UserMeResponse:
    tag = riot_id_tag(account.game_name, account.tag_line) if account else None
    return UserMeResponse(
        id=user.id,
        email=user.email,
        display_name=user.display_name,
        avatar_url=user.avatar_url,
        riot_id_tag=tag,
        has_linked_riot=account is not None,
    )


@router.get("/me", response_model=UserMeResponse)
async def get_me(
    current_user: Users = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    account = await get_primary_linked_account(session, current_user.id)
    return _user_me_response(current_user, account)


@router.patch("/me", response_model=UserMeResponse)
async def update_me(
    body: UpdateUserMeRequest,
    current_user: Users = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    current_user.display_name = body.display_name.strip()
    session.add(current_user)
    await session.commit()
    await session.refresh(current_user)
    account = await get_primary_linked_account(session, current_user.id)
    return _user_me_response(current_user, account)


@router.post("/me/avatar", response_model=AvatarUploadResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: Users = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    avatar_path = await save_avatar(current_user.id, file)
    current_user.avatar_url = avatar_path
    session.add(current_user)
    await session.commit()
    return AvatarUploadResponse(avatar_url=avatar_path)


@router.delete("/me/avatar", status_code=status.HTTP_204_NO_CONTENT)
async def delete_avatar(
    current_user: Users = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    delete_avatar_files(current_user.id)
    current_user.avatar_url = None
    session.add(current_user)
    await session.commit()


@router.get("/me/profile", response_model=PlayerProfileResponse)
async def get_my_profile(
    current_user: Users = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    account = await get_primary_linked_account(session, current_user.id)
    riot_id_tag_value = (
        riot_id_tag(account.game_name, account.tag_line) if account else None
    )
    puuid = await get_primary_linked_puuid(session, current_user.id)
    return await build_player_profile(session, current_user, puuid, riot_id_tag_value)


async def _link_game_account_impl(
    body: LinkGameAccountRequest,
    current_user: Users,
    session: AsyncSession,
) -> LinkGameAccountResponse:
    puuid, tag = await link_riot_account_for_user(
        session,
        current_user.id,
        riot_id=body.riot_id,
        game_name=body.game_name,
        tag_line=body.tag_line,
    )
    return LinkGameAccountResponse(
        puuid=puuid,
        riot_id_tag=tag,
        message=f"Successfully linked {tag}",
    )


@router.post("/me/game-accounts", response_model=LinkGameAccountResponse)
async def link_game_account(
    body: LinkGameAccountRequest,
    current_user: Users = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    return await _link_game_account_impl(body, current_user, session)


@router.put("/me/game-accounts", response_model=LinkGameAccountResponse)
async def update_game_account(
    body: LinkGameAccountRequest,
    current_user: Users = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    return await _link_game_account_impl(body, current_user, session)
