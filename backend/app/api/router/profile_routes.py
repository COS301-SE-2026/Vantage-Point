#todo
#get profile/create profile
##delete, undodelete
from fastapi import Depends, APIRouter
from fastapi.security import OAuth2PasswordBearer
from typing import Annotated
from app.services.profile_services import ProfileService
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_session
from app.Models.profile_schemas import User
from datetime import datetime

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

router = APIRouter()

@router.post(
        "/profile/get",
        response_model=User,
        summary="Get or create a Profile",
        description="Looks up user in both cognito and db then gets or create in db",
        tags=["profile"]
)
async def get_or_create_profile(session: Annotated[AsyncSession, Depends(get_session)] ,access_token: Annotated[str, Depends(oauth2_scheme)]):
    return await ProfileService.get_or_create_profile(session, access_token=access_token)

@router.post(
        "/profile/schedule_delete",
        response_model=datetime,
        summary="Schedules a account for deletion",
        description="Schedules account for deletion(soft delete) in 30 days"
        tags=["profile"]
)
async def schedule_account_deletion(session: Annotated[AsyncSession, Depends(get_session)] ,access_token: Annotated[str, Depends(oauth2_scheme)]):
    return await ProfileService.schelude_account_deletion(session, access_token)

@router.post(
        "/profile/undo_delete",
        response_model=str,
        summary="Undo soft delete",
        description="Undo soft delete set date to invalid date and stops deletion",
        tags=["profile"]
)
async def undo_account_deletion(session: Annotated[AsyncSession, Depends(get_session)] ,access_token: Annotated[str, Depends(oauth2_scheme)]):
    return await ProfileService.undo_account_deletion(session, access_token)



#todo update email/user in db