from fastapi import APIRouter, Depends, File, UploadFile, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from typing import Any, Annotated
from app.api.auth import require_group
from app.Models.profile_schemas import User
from app.database.models import Users
from app.database.session import get_session
from app.Models.profile import PlayerProfileResponse
from app.Models.user import (
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

user_not_found:str = "User not found"

async def _get_users(sub: str, session: AsyncSession) -> Users:
    statement = select(Users).where(Users.cognito_sub == sub)
    result: Any = await session.execute(statement)
    response: Users | None = result.scalar_one_or_none()

    if response is None:
        raise HTTPException(status_code=404, detail=user_not_found)
    
    return response

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


@router.get("/me", response_model=UserMeResponse,responses={404: {"description": user_not_found}})
async def get_me(
    current_user: Annotated[User, Depends(require_group(10))],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    response: Users = await _get_users(current_user.sub, session)
    account = await get_primary_linked_account(session, current_user.sub)
    return _user_me_response(response, account)

@router.patch("/me", response_model=UserMeResponse,responses={404: {"description": user_not_found}})
async def update_me(
    body: UpdateUserMeRequest,
    current_user: Annotated[User, Depends(require_group(10))],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    user: Users = await _get_users(current_user.sub, session)
    user.display_name = body.display_name.strip()
    session.add(user)
    await session.commit()
    await session.refresh(user)
    account = await get_primary_linked_account(session, current_user.sub)
    return _user_me_response(user, account)


@router.post("/me/avatar", response_model=AvatarUploadResponse, responses={404: {"description": user_not_found}})
async def upload_avatar(
    current_user: Annotated[User, Depends(require_group(10))],
    session: Annotated[AsyncSession, Depends(get_session)],
    file: Annotated[UploadFile, File(...)],
):
    avatar_path = await save_avatar(current_user.sub, file)
    user: Users = await _get_users(current_user.sub, session)
    user.avatar_url = avatar_path
    session.add(user)
    await session.commit()
    return AvatarUploadResponse(avatar_url=avatar_path)


@router.delete("/me/avatar", status_code=status.HTTP_204_NO_CONTENT, responses={404: {"description": user_not_found}})
async def delete_avatar(
    current_user: Annotated[User, Depends(require_group(10))],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    delete_avatar_files(current_user.sub)
    user: Users = await _get_users(current_user.sub, session)
    user.avatar_url = None
    session.add(user)
    await session.commit()


@router.get("/me/profile", response_model=PlayerProfileResponse, responses={404: {"description": user_not_found}})
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


async def _link_game_account_impl(
    body: LinkGameAccountRequest,
    current_user: Users,
    session: AsyncSession,
) -> LinkGameAccountResponse:
    puuid, tag = await link_riot_account_for_user(
        session,
        current_user.cognito_sub,
        riot_id=body.riot_id,
        game_name=body.game_name,
        tag_line=body.tag_line,
    )
    return LinkGameAccountResponse(
        puuid=puuid,
        riot_id_tag=tag,
        message=f"Successfully linked {tag}",
    )


@router.post("/me/game-accounts", response_model=LinkGameAccountResponse, responses={404: {"description": user_not_found}})
async def link_game_account(
    body: LinkGameAccountRequest,
    current_user: Annotated[User, Depends(require_group(10))],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    response = await _get_users(current_user.sub, session)
    return await _link_game_account_impl(body, response, session)


@router.put("/me/game-accounts", response_model=LinkGameAccountResponse, responses={404: {"description": user_not_found}})
async def update_game_account(
    body: LinkGameAccountRequest,
    current_user: Annotated[User, Depends(require_group(10))],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    response = await _get_users(current_user.sub, session)
    return await _link_game_account_impl(body, response, session)
