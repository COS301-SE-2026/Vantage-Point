from fastapi import Depends, APIRouter, HTTPException
from app.Models.auth_model import User
from app.api.auth import require_group
from typing import Any, Annotated
from app.database.session import get_session
from sqlalchemy.ext.asyncio import AsyncSession

from app.Models.riot_schemas import (MapReplay, MapSuggestData, MatchData, ItemData, RoleData)
from app.pred_engine.ai_caller import (get_knn_output, get_champ_pred, get_item_pred, get_role_pred, get_skill_pred, create_models)
from app.services.analytics import LiveAnalyticsServiceDep

router = APIRouter()

@router.get(
    "/knn-model",
)
async def get_knn_output_model(_: Annotated[User, Depends(require_group(10))], match_id: str, puuid: str, session: Annotated[AsyncSession, Depends(get_session)], live_analytics: LiveAnalyticsServiceDep) -> Any:
    try:
        data: Any = await live_analytics.map_suggest_data(match_id=match_id, puuid=puuid, session=session)
        return get_knn_output(data.convert_to_arr())
    except HTTPException as e:
        raise HTTPException(status_code=500, detail=str(e))

# @router.get(
#     "/champ-model",
# )
# async def get_champ_pred_model(_: Annotated[User, Depends(require_group(10))], match_id: str, puuid: str, session: Annotated[AsyncSession, Depends(get_session)], live_analytics: LiveAnalyticsServiceDep) -> Any:
#     try:
#         data: Any = await live_analytics.champion_data(match_id=match_id, puuid=puuid)
#         return get_champ_pred(data)
#     except HTTPException as e:
#             raise HTTPException(status_code=500, detail=str(e))

# @router.get(
#     "/item-model",
# )
# async def get_item_pred_model(_: Annotated[User, Depends(require_group(10))], match_id: str, puuid: str, session: Annotated[AsyncSession, Depends(get_session)], live_analytics: LiveAnalyticsServiceDep) -> Any:
#         data: Any = await live_analytics.item_data(match_id=match_id, puuid=puuid, session=session)
#         return get_item_pred(data)

# @router.get(
#     "/role-model",
# )
# async def get_role_pred_model(_: Annotated[User, Depends(require_group(10))], match_id: str, puuid: str, session: Annotated[AsyncSession, Depends(get_session)], live_analytics: LiveAnalyticsServiceDep) -> Any:
#     try: 
#         data: Any = await live_analytics.role_data(match_id=match_id, puuid=puuid)
#         return get_role_pred(data)
#     except HTTPException as e:
#             raise HTTPException(status_code=500, detail=str(e))


# @router.get(
#     "/skill-model",
# )
# async def get_skill_pred_model(_: Annotated[User, Depends(require_group(10))], match_id: str, puuid: str, session: Annotated[AsyncSession, Depends(get_session)], live_analytics: LiveAnalyticsServiceDep) -> Any:
#     try:
#         data: Any = await live_analytics.skill_data(match_id=match_id, puuid=puuid, session=session)
#         return get_skill_pred(data.convert_to_arr())
#     except HTTPException as e:
#             raise HTTPException(status_code=500, detail=str(e))
