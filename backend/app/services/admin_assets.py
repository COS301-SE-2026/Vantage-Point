from fastapi import HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import col, select

from app.Models.admin_model import ChampionAssetResponse, MapAssetResponse
from app.database.models import Champions, MapAssets
from app.services.asset_storage import save_asset
from app.utils.game_labels import MAP_LABELS


def _map_to_response(row: MapAssets) -> MapAssetResponse:
    return MapAssetResponse(
        map_id=row.map_id,
        display_name=row.name,
        image_url=row.image_path or "",
    )


def _champion_to_response(row: Champions) -> ChampionAssetResponse:
    return ChampionAssetResponse(
        champion_id=row.champion_id,
        display_name=row.name,
        image_url=row.image_path or "",
    )


class admin_assets_service:
    @staticmethod
    async def list_map_assets(session: AsyncSession) -> list[MapAssetResponse]:
        result = await session.execute(
            select(MapAssets).order_by(col(MapAssets.map_id))
        )
        return [_map_to_response(row) for row in result.scalars().all()]

    @staticmethod
    async def upsert_map_asset(
        session: AsyncSession, map_id: int, display_name: str, file: UploadFile
    ) -> MapAssetResponse:
        if map_id not in MAP_LABELS:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Unknown map_id {map_id}",
            )

        image_path = await save_asset("maps", str(map_id), file)
        row = await session.get(MapAssets, map_id)
        if row:
            row.name = display_name
            row.image_path = image_path
        else:
            row = MapAssets(
                map_id=map_id, name=display_name, image_path=image_path
            )
        session.add(row)
        await session.commit()
        await session.refresh(row)
        return _map_to_response(row)

    @staticmethod
    async def list_champion_assets(
        session: AsyncSession,
    ) -> list[ChampionAssetResponse]:
        result = await session.execute(
            select(Champions).order_by(col(Champions.champion_id))
        )
        return [_champion_to_response(row) for row in result.scalars().all()]

    @staticmethod
    async def upsert_champion_asset(
        session: AsyncSession, champion_id: int, display_name: str, file: UploadFile
    ) -> ChampionAssetResponse:
        image_path = await save_asset("champions", str(champion_id), file)
        row = await session.get(Champions, champion_id)
        if row:
            row.name = display_name
            row.image_path = image_path
        else:
            row = Champions(
                champion_id=champion_id,
                name=display_name,
                tags="Unknown",
                image_path=image_path,
            )
        session.add(row)
        await session.commit()
        await session.refresh(row)
        return _champion_to_response(row)