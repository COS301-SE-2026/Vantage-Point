from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.Models.admin_model import ChampionAssetResponse, MapAssetResponse
from app.Models.profile_schemas import User
from app.api.auth import require_group
from app.database.session import get_session
from app.services.admin_assets import admin_assets_service

router = APIRouter(prefix="/api/v1/admin/assets", tags=["admin-assets"])


@router.get(
    "/maps",
    response_model=list[MapAssetResponse],
    summary="List map assets",
)
async def list_map_assets(
    _: Annotated[User, Depends(require_group(20))],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    return await admin_assets_service.list_map_assets(session)


@router.post(
    "/maps",
    response_model=MapAssetResponse,
    summary="Upload (or replace) a map's display asset",
)
async def upload_map_asset(
    _: Annotated[User, Depends(require_group(20))],
    session: Annotated[AsyncSession, Depends(get_session)],
    map_id: Annotated[int, Form()],
    display_name: Annotated[str, Form()],
    file: Annotated[UploadFile, File()],
):
    return await admin_assets_service.upsert_map_asset(
        session, map_id, display_name, file
    )


@router.get(
    "/champions",
    response_model=list[ChampionAssetResponse],
    summary="List champion assets",
)
async def list_champion_assets(
    _: Annotated[User, Depends(require_group(20))],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    return await admin_assets_service.list_champion_assets(session)


@router.post(
    "/champions",
    response_model=ChampionAssetResponse,
    summary="Upload (or replace) a champion's display asset",
)
async def upload_champion_asset(
    _: Annotated[User, Depends(require_group(20))],
    session: Annotated[AsyncSession, Depends(get_session)],
    champion_id: Annotated[int, Form()],
    display_name: Annotated[str, Form()],
    file: Annotated[UploadFile, File()],
):
    return await admin_assets_service.upsert_champion_asset(
        session, champion_id, display_name, file
    )
