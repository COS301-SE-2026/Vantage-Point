from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.api.auth import get_current_user
from app.services import auth_service
from app.schemas.auth_schemas import UserRegister, UserLogin, UserConfirm
from typing import Annotated


oauth2_scheme = HTTPBearer()

router = APIRouter()

@router.post("/auth/register")
async def register(user: UserRegister):
    result = await auth_service.register_user(user.username, user.password, user.email)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return {"message": "User registered successfully."}

@router.post("/auth/login")
async def login(user: UserLogin):
    result = await auth_service.login_user(user.username, user.password)
    if "error" in result:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return result

@router.post("/auth/confirm")
async def confirm(data: UserConfirm):
    result = await auth_service.confirm_user(data.username, data.confirmation_code)
    if "error" in result:
        raise HTTPException(status_code=401, detail=result["error"])
    return result

@router.post("/auth/logout")
async def logout(token_data: Annotated[HTTPAuthorizationCredentials, Depends(oauth2_scheme)]):
    #Extracts the raw string credentials from the FastAPI HTTPBearer object
    # needed for Cognito's global_sign_out

    raw_token = token_data.credentials
    result = await auth_service.logout_user(raw_token)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return {"message": "Successfully logged out from all devices."}