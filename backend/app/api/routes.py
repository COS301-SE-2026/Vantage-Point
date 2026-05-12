from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.api.auth import get_current_user
from app.services import auth_service
from app.schemas.auth_schemas import UserRegister, UserLogin, UserConfirm, ProfileResponse, PlayerSummary
from typing import Annotated
from datetime import datetime, timedelta


oauth2_scheme = HTTPBearer()

router = APIRouter()
deletion_queue: dict[str, datetime] = {}

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


@router.get("/profile", response_model=ProfileResponse)
async def get_profile(current_user: Annotated[str, Depends(get_current_user)]) -> ProfileResponse:
    """
    Retrieves the authenticated user's profile. 
    """
    summary = PlayerSummary(
        most_played_character="Jinx",
        common_mistakes=["Low vision score", "Overextending late game"],
        avg_kda="8.4 / 4.2 / 6.1",
        win_rate="54%"
    )
    
    return ProfileResponse(
        uuid="b0fc69dc-40a1-704a-5302-a6c936519de9",
        username=current_user,
        total_matches=142,
        player_summary=summary
    )

@router.delete("/profile")
async def delete_account(current_user: Annotated[str, Depends(get_current_user)]):
    deletion_date = datetime.now() + timedelta(days=30)
    deletion_queue[current_user] = deletion_date
    
    print(f"--- Notification email sent to user {current_user} ---")
    print(f"Subject: Account marked for deletion")
    print(f"Your account will be removed on {deletion_date.strftime('%Y-%m-%d')}.")
    
    return {"message": "Account marked for deletion. You have 30 days to undo this action."}

@router.post("/profile/undo-delete")
async def undo_delete(current_user: Annotated[str, Depends(get_current_user)]):
    if current_user in deletion_queue:
        del deletion_queue[current_user]
        return {"message": "Account deletion cancelled successfully."}
    raise HTTPException(status_code=400, detail="Account is not marked for deletion.")

@router.get("/matches")
async def get_matches(current_user: Annotated[str, Depends(get_current_user)]):
    # Mock list of matches
    return [
        {
            "match_id": "NA1_49201",
            "map": "Summoner's Rift",
            "game_mode": "Ranked Solo",
            "duration": "32m 10s",
            "status": "Victory",
            "kda": "10/3/15",
            "champion": "Thresh"
        },
        {
            "match_id": "NA1_49188",
            "map": "Howling Abyss",
            "game_mode": "ARAM",
            "duration": "18m 45s",
            "status": "Defeat",
            "kda": "5/10/12",
            "champion": "Lux"
        }
    ]

