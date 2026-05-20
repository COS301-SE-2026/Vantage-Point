from fastapi import APIRouter, HTTPException, Query, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.api.auth import get_current_user
from app.services import auth_service, riot_service
from app.schemas.auth_schemas import (
    UserRegister,
    UserLogin,
    UserConfirm,
    ProfileResponse,
    PlayerSummary,
)
from typing import Annotated
from datetime import datetime, timedelta
from pydantic import BaseModel
from typing import List
from app.schemas.riot_schemas import SimplifiedMatchResponse
from app.services.riot_service import riot_service, filter_match_for_players

oauth2_scheme = HTTPBearer()

router = APIRouter()
deletion_queue: dict[str, datetime] = {}

#
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
async def logout(
    token_data: Annotated[HTTPAuthorizationCredentials, Depends(oauth2_scheme)],
):
    # Extracts the raw string credentials from the FastAPI HTTPBearer object
    # needed for Cognito's global_sign_out
    #jwt when logout request so use JWT get what user to infer which user logouts
    raw_token = token_data.credentials
    result = await auth_service.logout_user(raw_token)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return {"message": "Successfully logged out from all devices."}


@router.get("/profile", response_model=ProfileResponse)
async def get_profile(
    current_user: Annotated[str, Depends(get_current_user)],
) -> ProfileResponse:
    """
    Retrieves the authenticated user's profile.
    """
    summary = PlayerSummary(
        most_played_character="Jinx",
        common_mistakes=["Low vision score", "Overextending late game"],
        avg_kda="8.4 / 4.2 / 6.1",
        win_rate="54%",
    )

    return ProfileResponse(
        uuid="b0fc69dc-40a1-704a-5302-a6c936519de9",
        username=current_user,
        total_matches=142,
        player_summary=summary,
    )


@router.delete("/profile")
async def delete_account(current_user: Annotated[str, Depends(get_current_user)]):
    deletion_date = datetime.now() + timedelta(days=30)
    deletion_queue[current_user] = deletion_date

    print(f"--- Notification email sent to user {current_user} ---")
    print("Subject: Account marked for deletion")
    print(f"Your account will be removed on {deletion_date.strftime('%Y-%m-%d')}.")

    return {
        "message": "Account marked for deletion. You have 30 days to undo this action."
    }


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
            "champion": "Thresh",
        },
        {
            "match_id": "NA1_49188",
            "map": "Howling Abyss",
            "game_mode": "ARAM",
            "duration": "18m 45s",
            "status": "Defeat",
            "kda": "5/10/12",
            "champion": "Lux",
        },
    ]


class UpdateAPIKeyRequest(BaseModel):
    riot_api_key: str


@router.put("/profile/riot-key")
async def update_riot_api_key(
    request: UpdateAPIKeyRequest,
    current_user: Annotated[str, Depends(get_current_user)],
):
    """
    MOCK: Updates the Riot API key for the current authenticated session.
    """
    # Simulate updating the RiotService internal state
    # In a real scenario, this would call riot_service.set_api_key(request.riot_api_key)
    mock_success = True

    if not mock_success:
        raise HTTPException(status_code=500, detail="Failed to update API key")

    # Log the action to your terminal for verification
    print("--- [MOCK] API Key Updated ---")
    print(f"User: {current_user}")
    print(f"New Key: {request.riot_api_key[:10]}...")  # Masked for safety

    return {
        "message": "Riot API Key updated successfully for this session.",
        "user": current_user,
        "status": "mock_verified",
    }


# =====================================================
# Riot routes
# ======================================================

@router.get("/riot/matches/{puuid}", response_model=List[str])
#@public #custom decorator used to bypass cognito for testing
async def get_player_matches(puuid: str, count: int = 5) -> list[str]:
    "GET a list of match IDs by player PUUID."
    match_ids: list[str] = await riot_service.get_match_ids(puuid=puuid, count=count)

    return match_ids

router = APIRouter(tags=["Matches"])

@router.get("/api/mathces/{match_id}/filtered", response_model=SimplifiedMatchResponse)
#@public
async def get_filtered_match(match_id: str, puuid: str = Query(..., description="The exact PUUID of the player to filter the match data for")):
    """
    Fetches a full match from Riot's API and shrinks the payload 
    down to a lightweight summary for a single player.
    """

    try:
        raw_match_data = await riot_service.get_match_detail(match_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Failed to fetch match: {str(e)}")
    
    full_match = raw_match_data

    simplified_match = filter_match_for_players(full_match=full_match, target_puuid=puuid)

    if not simplified_match:
        raise HTTPException(status_code=404, detail=f"Player with PUUID {puuid} was not found in match {match_id}")
    
    return simplified_match
