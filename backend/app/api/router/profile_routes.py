#todo
#get profile/create profile
##delete, undodelete
from fastapi import Depends, APIRouter
from fastapi.security import OAuth2PasswordBearer
from typing import Annotated
from app.services.profile_services import ProfileService
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_session

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_or_create_profile(session: Annotated[AsyncSession, Depends(get_session)] ,access_token: Annotated[str, Depends(oauth2_scheme)]):
    return await ProfileService.get_or_create_profile(session, access_token=access_token)

async def schedule_account_deletion(session: Annotated[AsyncSession, Depends(get_session)] ,access_token: Annotated[str, Depends(oauth2_scheme)]):
    return await ProfileService.schelude_account_deletion(session, access_token)