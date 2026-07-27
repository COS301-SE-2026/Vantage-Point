import uuid
from urllib.parse import parse_qs

from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.api.auth import get_current_user
from app.services import auth_service
from app.schemas.auth_schemas import (
    UserRegister,
    UserLogin,
    UserConfirm,
)
from app.config import get_settings
from app.schemas.profile_schemas import (
    MatchSummary,
    MessageResponse,
    ProfileResponse,
    RiotKeyUpdateResponse,
    LiveAdvancedMetrics,
    ProfileCreateRequest,
    ProfileUpdateRequest,
)
from app.schemas.generic_schemas import ErrorResponse
from typing import Annotated, List
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_session
from app.schemas.riot_schemas import SimplifiedMatchResponse
from app.services.profile_services import ProfileService
from app.services.analytics import LiveAnalyticsService
from app.services.riot_service import filter_match_for_players, riot_service
from app.routers.users import router as users_router

oauth2_scheme = HTTPBearer()

router = APIRouter()
settings = get_settings()


# =====================================================
# Authentication Routes
# =====================================================

@router.post(
    "/auth/register",
    tags=["Authentication"],
    summary="Register a new user",
    description="Creates a new Cognito user account with internal UUID, email, and password.",
    response_model=dict[str, str],
    responses={
        400: {"model": ErrorResponse, "description": "Registration failed"},
    },
)
async def register(user: UserRegister) -> dict[str, str]:
    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    # Generate an internal random UUID for Cognito's required Username parameter
    internal_username = str(uuid.uuid4())

    # Register with UUID as internal username and email in attributes
    result = await auth_service.register_user(
        username=internal_username,
        password=user.password,
        email=user.email,
    )
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    # Log in using the email address as the alias
    tokens = await auth_service.login_user(user.email, user.password)
    if "error" in tokens:
        raise HTTPException(status_code=400, detail=tokens["error"])

    return {
        "access_token": tokens["AccessToken"],
        "refresh_token": tokens["RefreshToken"],
        "token_type": "Bearer",
    }


@router.post(
    "/auth/login",
    tags=["Authentication"],
    summary="Log in a user",
    description="Authenticates a user by email alias and returns Cognito tokens.",
    response_model=dict[str, str],
    responses={
        401: {"model": ErrorResponse, "description": "Invalid credentials"},
    },
)
async def login(user: UserLogin) -> dict[str, str]:
    # Login with email and password
    login_identifier = getattr(user, "email", None) or user.username
    result = await auth_service.login_user(login_identifier, user.password)

    if "error" in result:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "access_token": result["AccessToken"],
        "refresh_token": result["RefreshToken"],
        "token_type": "Bearer",
    }


@router.post(
    "/auth/confirm",
    tags=["Authentication"],
    include_in_schema=False,
    summary="Confirm a registered user",
    description="Confirms a Cognito signup using the verification code sent to the user.",
    response_model=dict[str, str],
    responses={
        401: {"model": ErrorResponse, "description": "Confirmation failed"},
    },
)
async def confirm(data: UserConfirm):
    result = await auth_service.confirm_user(data.username, data.confirmation_code)
    if "error" in result:
        raise HTTPException(status_code=401, detail=result["error"])
    return result


@router.post(
    "/auth/logout",
    tags=["Authentication"],
    summary="Log out the current user",
    description="Invalidates the authenticated user's Cognito access token globally.",
    response_model=MessageResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Logout failed"},
        403: {"model": ErrorResponse, "description": "Missing or invalid bearer token"},
    },
)
async def logout(
    token_data: Annotated[HTTPAuthorizationCredentials, Depends(oauth2_scheme)],
):
    # Extracts the raw string credentials from the FastAPI HTTPBearer object
    # needed for Cognito's global_sign_out
    # jwt when logout request so use JWT get what user to infer which user logouts
    raw_token = token_data.credentials
    result = await auth_service.logout_user(raw_token)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return {"message": "Successfully logged out from all devices."}


@router.post(
    "/token",
    include_in_schema=False,
    responses={
        400: {"description": "Username and password are required"},
        401: {"description": "Invalid username or password"},
    },
)
async def swagger_login(request: Request) -> dict[str, str]:
    form_data = parse_qs((await request.body()).decode())
    username = form_data.get("username", [""])[0]
    password = form_data.get("password", [""])[0]

    if not username or not password:
        raise HTTPException(
            status_code=400,
            detail="Username and password are required",
        )

    result = await auth_service.login_user(
        username,
        password,
    )

    if "error" in result:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
        )

    return {
        "access_token": result["IdToken"],
        "token_type": "bearer",
    }


# =====================================================
# Profile Routes
# =====================================================


@router.get(
    "/profile",
    tags=["Profile"],
    summary="Get current user profile",
    description="Retrieves the authenticated user's profile and gameplay summary.",
    responses={
        401: {"model": ErrorResponse, "description": "Invalid or expired token"},
    },
)
async def get_profile(
    current_user: Annotated[str, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> ProfileResponse:
    profile = await ProfileService.get_or_create_profile(session, current_user)
    total_matches, summary = await ProfileService.build_player_summary(
        session, current_user
    )

    return ProfileResponse(
        cognito_sub=profile.cognito_sub,
        display_name=profile.display_name,
        total_matches=total_matches,
        player_summary=summary,
    )


@router.post(
    "/profile",
    tags=["Profile"],
    summary="Create current user profile",
    include_in_schema=False,
    description="Creates a profile for the authenticated user.",
    responses={
        401: {"model": ErrorResponse, "description": "Invalid or expired token"},
        409: {"model": ErrorResponse, "description": "Profile already exists"},
    },
)
async def create_profile(
    request: ProfileCreateRequest,
    current_user: Annotated[str, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> ProfileResponse:
    profile = await ProfileService.create_profile(
        session=session,
        user_id=current_user,
        request=request,
    )

    total_matches, summary = await ProfileService.build_player_summary(
        session,
        current_user,
    )

    return ProfileResponse(
        cognito_sub=profile.cognito_sub,
        display_name=profile.display_name,
        total_matches=total_matches,
        player_summary=summary,
    )


@router.put(
    "/profile",
    tags=["Profile"],
    summary="Update current user profile",
    description="Updates the authenticated user's profile.",
    responses={
        401: {"model": ErrorResponse, "description": "Invalid or expired token"},
        404: {
            "model": ErrorResponse,
            "description": "Profile or Riot account not found",
        },
    },
)
async def update_profile(
    request: ProfileUpdateRequest,
    current_user: Annotated[str, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> ProfileResponse:
    profile = await ProfileService.update_profile(
        session=session,
        user_id=current_user,
        request=request,
    )

    total_matches, summary = await ProfileService.build_player_summary(
        session,
        current_user,
    )

    return ProfileResponse(
        cognito_sub=profile.cognito_sub,
        display_name=profile.display_name,
        total_matches=total_matches,
        player_summary=summary,
    )


@router.delete(
    "/profile",
    tags=["Profile"],
    summary="Schedule account deletion",
    description="Marks the authenticated account for deletion 30 days from now.",
    response_model=MessageResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Invalid or expired token"},
    },
)
async def delete_account(
    current_user: Annotated[str, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    deletion_date = await ProfileService.schedule_account_deletion(
        session, current_user
    )

    print(f"--- Notification email sent to user {current_user} ---")
    print("Subject: Account marked for deletion")
    print(f"Your account will be removed on {deletion_date.strftime('%Y-%m-%d')}.")

    return {
        "message": "Account marked for deletion. You have 30 days to undo this action."
    }


@router.post(
    "/profile/undo-delete",
    tags=["Profile"],
    summary="Undo scheduled account deletion",
    description="Cancels a pending account deletion for the authenticated user.",
    response_model=MessageResponse,
    responses={
        400: {
            "model": ErrorResponse,
            "description": "Account is not marked for deletion",
        },
        401: {"model": ErrorResponse, "description": "Invalid or expired token"},
    },
)
async def undo_delete(
    current_user: Annotated[str, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    if await ProfileService.undo_account_deletion(session, current_user):
        return {"message": "Account deletion cancelled successfully."}
    raise HTTPException(
        status_code=400,
        detail={"error_code": 4002, "message": "Account is not marked for deletion."},
    )


class UpdateAPIKeyRequest(BaseModel):
    riot_api_key: str = Field(..., description="Riot Games developer API key")


@router.put(
    "/profile/riot-key",
    tags=["Profile"],
    summary="Update Riot API key",
    description="Mock endpoint that validates updating the Riot API key for the current session.",
    response_model=RiotKeyUpdateResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Invalid or expired token"},
        500: {"model": ErrorResponse, "description": "Failed to update API key"},
    },
)
async def update_riot_api_key(
    request: UpdateAPIKeyRequest,
    current_user: Annotated[str, Depends(get_current_user)],
):
    mock_success = True

    if not mock_success:
        raise HTTPException(status_code=500, detail="Failed to update API key")

    print("--- [MOCK] API Key Updated ---")
    print(f"User: {current_user}")
    print(f"New Key: {request.riot_api_key[:10]}...")

    return {
        "message": "Riot API Key updated successfully for this session.",
        "user": current_user,
        "status": "mock_verified",
    }


# =====================================================
# Matches & Riot Routes
# =====================================================


@router.get(
    "/matches",
    tags=["Matches"],
    summary="List recent matches",
    description="Returns a list of recent matches for the authenticated user.",
    response_model=List[MatchSummary],
    responses={
        401: {"model": ErrorResponse, "description": "Invalid or expired token"},
    },
)
async def get_matches(current_user: Annotated[str, Depends(get_current_user)]):
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


@router.get(
    "/riot/matches/{puuid}",
    tags=["Riot"],
    summary="Get Riot match IDs",
    description="Fetches recent Riot match IDs for a player PUUID.",
    response_model=List[str],
    responses={
        401: {"model": ErrorResponse, "description": "Invalid or expired token"},
        404: {"model": ErrorResponse, "description": "Player matches were not found"},
    },
)
async def get_player_matches(
    server_region: str,
    puuid: str,
    current_user: Annotated[str, Depends(get_current_user)],
    count: int = 5,
) -> list[str]:
    match_ids: list[str] = await riot_service.get_match_ids(
        server_region=server_region, puuid=puuid, count=count
    )
    return match_ids


@router.get(
    "/riot/matches/{match_id}/filtered",
    tags=["Riot"],
    summary="Get filtered Riot match",
    description=(
        "Fetches a full Riot match and returns a lightweight summary for one player "
        "plus their teammates."
    ),
    response_model=SimplifiedMatchResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Invalid or expired token"},
        404: {"model": ErrorResponse, "description": "Match or player was not found"},
    },
)
async def get_filtered_match(
    match_id: str,
    puuid: str,
    current_user: Annotated[str, Depends(get_current_user)],
):
    try:
        raw_match_data = await riot_service.get_match_detail(match_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Failed to fetch match: {str(e)}")

    simplified_match = filter_match_for_players(
        full_match=raw_match_data, target_puuid=puuid
    )

    if not simplified_match:
        raise HTTPException(
            status_code=404,
            detail=f"Player with PUUID {puuid} was not found in match {match_id}",
        )

    return simplified_match


@router.get(
    "/{server_region}/{puuid}/live-metrics",
    tags=["Live Metrics"],
    summary="Get live performance metrics",
    description="Calculates live performance indexes across recent matches.",
    response_model=LiveAdvancedMetrics,
    responses={
        401: {"model": ErrorResponse, "description": "Invalid or expired token"},
    },
)
async def get_live_player_metrics(
    server_region: str,
    puuid: str,
    count: int,
    current_user: Annotated[str, Depends(get_current_user)],
) -> LiveAdvancedMetrics:
    return await LiveAnalyticsService.get_live_metrics_from_api(
        server_region=server_region, puuid=puuid, count=count
    )

router.include_router(users_router)
