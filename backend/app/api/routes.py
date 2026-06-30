# from urllib.parse import parse_qs

# from fastapi import APIRouter, HTTPException, Depends, Request
# from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
# from app.api.auth import get_current_user
# from app.services import auth_service
# from app.Models.auth_schemas import (
#     UserRegister,
#     UserLogin,
#     UserConfirm,
# )
# from app.Models.profile_schemas import (
#     MatchSummary,
#     MessageResponse,
#     ProfileResponse,
#     RiotKeyUpdateResponse,
#     LiveAdvancedMetrics,
#     ProfileCreateRequest,
#     ProfileUpdateRequest,
# )
# from app.Models.generic_schemas import ErrorResponse
# from typing import Annotated, Any
# from pydantic import BaseModel, Field
# from typing import List
# from sqlalchemy.ext.asyncio import AsyncSession
# from app.database.session import get_session
# from app.Models.riot_schemas import SimplifiedMatchResponse
# from app.services.profile_services import ProfileService
# from app.services.analytics import LiveAnalyticsService
# from app.services.riot_service import riot_service, filter_match_for_players

# oauth2_scheme = HTTPBearer()

# router = APIRouter()


# #
# @router.post(
#     "/auth/register",
#     tags=["Authentication"],
#     summary="Register a new user",
#     description="Creates a new Cognito user account with username, email, and password.",
#     response_model=MessageResponse,
#     responses={
#         400: {"model": ErrorResponse, "description": "Registration failed"},
#     },
# )
# async def register(user: UserRegister):
#     result = await auth_service.register_user(user.username, user.password, user.email)
#     if "error" in result:
#         raise HTTPException(status_code=400, detail=result["error"])
#     return {"message": "User registered successfully."}


# @router.post(
#     "/auth/login",
#     tags=["Authentication"],
#     summary="Log in a user",
#     description="Authenticates a user with Cognito and returns the token payload from AWS.",
#     responses={
#         401: {"model": ErrorResponse, "description": "Invalid username or password"},
#     },
# )
# async def login(user: UserLogin) -> dict[str, Any]:
#     result = await auth_service.login_user(user.username, user.password)
#     if "error" in result:
#         raise HTTPException(status_code=401, detail="Invalid username or password")
#     return dict(result)


# @router.post(
#     "/auth/confirm",
#     tags=["Authentication"],
#     include_in_schema=False,
#     summary="Confirm a registered user",
#     description="Confirms a Cognito signup using the verification code sent to the user.",
#     response_model=dict[str, str],
#     responses={
#         401: {"model": ErrorResponse, "description": "Confirmation failed"},
#     },
# )
# async def confirm(data: UserConfirm):
#     result = await auth_service.confirm_user(data.username, data.confirmation_code)
#     if "error" in result:
#         raise HTTPException(status_code=401, detail=result["error"])
#     return result


# @router.post(
#     "/auth/logout",
#     tags=["Authentication"],
#     summary="Log out the current user",
#     description="Invalidates the authenticated user's Cognito access token globally.",
#     response_model=MessageResponse,
#     responses={
#         400: {"model": ErrorResponse, "description": "Logout failed"},
#         403: {"model": ErrorResponse, "description": "Missing or invalid bearer token"},
#     },
# )
# async def logout(
#     token_data: Annotated[HTTPAuthorizationCredentials, Depends(oauth2_scheme)],
# ):
#     # Extracts the raw string credentials from the FastAPI HTTPBearer object
#     # needed for Cognito's global_sign_out
#     # jwt when logout request so use JWT get what user to infer which user logouts
#     raw_token = token_data.credentials
#     result = await auth_service.logout_user(raw_token)
#     if "error" in result:
#         raise HTTPException(status_code=400, detail=result["error"])
#     return {"message": "Successfully logged out from all devices."}


# @router.get(
#     "/profile",
#     tags=["Profile"],
#     summary="Get current user profile",
#     description="Retrieves the authenticated user's profile and mock gameplay summary.",
#     responses={
#         401: {"model": ErrorResponse, "description": "Invalid or expired token"},
#     },
# )
# async def get_profile(
#     current_user: Annotated[str, Depends(get_current_user)],
#     session: Annotated[AsyncSession, Depends(get_session)],
# ) -> ProfileResponse:
#     """
#     Retrieves the authenticated user's profile.
#     """
#     profile = await ProfileService.get_or_create_profile(session, current_user)
#     total_matches, summary = await ProfileService.build_player_summary(
#         session, current_user
#     )

#     return ProfileResponse(
#         uuid=profile.user_id,
#         username=profile.username,
#         total_matches=total_matches,
#         player_summary=summary,
#     )


# @router.delete(
#     "/profile",
#     tags=["Profile"],
#     summary="Schedule account deletion",
#     description="Marks the authenticated account for deletion 30 days from now.",
#     response_model=MessageResponse,
#     responses={
#         401: {"model": ErrorResponse, "description": "Invalid or expired token"},
#     },
# )
# async def delete_account(
#     current_user: Annotated[str, Depends(get_current_user)],
#     session: Annotated[AsyncSession, Depends(get_session)],
# ):
#     deletion_date = await ProfileService.schedule_account_deletion(
#         session, current_user
#     )

#     print(f"--- Notification email sent to user {current_user} ---")
#     print("Subject: Account marked for deletion")
#     print(f"Your account will be removed on {deletion_date.strftime('%Y-%m-%d')}.")

#     return {
#         "message": "Account marked for deletion. You have 30 days to undo this action."
#     }


# @router.post(
#     "/profile/undo-delete",
#     tags=["Profile"],
#     summary="Undo scheduled account deletion",
#     description="Cancels a pending account deletion for the authenticated user.",
#     response_model=MessageResponse,
#     responses={
#         400: {
#             "model": ErrorResponse,
#             "description": "Account is not marked for deletion",
#         },
#         401: {"model": ErrorResponse, "description": "Invalid or expired token"},
#     },
# )
# async def undo_delete(
#     current_user: Annotated[str, Depends(get_current_user)],
#     session: Annotated[AsyncSession, Depends(get_session)],
# ):
#     if await ProfileService.undo_account_deletion(session, current_user):
#         return {"message": "Account deletion cancelled successfully."}
#     raise HTTPException(
#         status_code=400,
#         detail={"error_code": 4002, "message": "Account is not marked for deletion."},
#     )


# @router.get(
#     "/matches",
#     tags=["Matches"],
#     summary="List recent matches",
#     description="Returns a mock list of recent matches for the authenticated user.",
#     response_model=List[MatchSummary],
#     responses={
#         401: {"model": ErrorResponse, "description": "Invalid or expired token"},
#     },
# )
# async def get_matches(current_user: Annotated[str, Depends(get_current_user)]):
#     # Mock list of matches
#     return [
#         {
#             "match_id": "NA1_49201",
#             "map": "Summoner's Rift",
#             "game_mode": "Ranked Solo",
#             "duration": "32m 10s",
#             "status": "Victory",
#             "kda": "10/3/15",
#             "champion": "Thresh",
#         },
#         {
#             "match_id": "NA1_49188",
#             "map": "Howling Abyss",
#             "game_mode": "ARAM",
#             "duration": "18m 45s",
#             "status": "Defeat",
#             "kda": "5/10/12",
#             "champion": "Lux",
#         },
#     ]


# class UpdateAPIKeyRequest(BaseModel):
#     riot_api_key: str = Field(..., description="Riot Games developer API key")


# @router.put(
#     "/profile/riot-key",
#     tags=["Profile"],
#     summary="Update Riot API key",
#     description="Mock endpoint that validates updating the Riot API key for the current session.",
#     response_model=RiotKeyUpdateResponse,
#     responses={
#         401: {"model": ErrorResponse, "description": "Invalid or expired token"},
#         500: {"model": ErrorResponse, "description": "Failed to update API key"},
#     },
# )
# async def update_riot_api_key(
#     request: UpdateAPIKeyRequest,
#     current_user: Annotated[str, Depends(get_current_user)],
# ):
#     """
#     MOCK: Updates the Riot API key for the current authenticated session.
#     """
#     # Simulate updating the RiotService internal state
#     # In a real scenario, this would call riot_service.set_api_key(request.riot_api_key)
#     mock_success = True

#     if not mock_success:
#         raise HTTPException(status_code=500, detail="Failed to update API key")

#     # Log the action to your terminal for verification
#     print("--- [MOCK] API Key Updated ---")
#     print(f"User: {current_user}")
#     print(f"New Key: {request.riot_api_key[:10]}...")  # Masked for safety

#     return {
#         "message": "Riot API Key updated successfully for this session.",
#         "user": current_user,
#         "status": "mock_verified",
#     }


# # =====================================================
# # Riot routes
# # ======================================================


# @router.get(
#     "/riot/matches/{puuid}",
#     tags=["Riot"],
#     summary="Get Riot match IDs",
#     description="Fetches recent Riot match IDs for a player PUUID.",
#     response_model=List[str],
#     responses={
#         404: {"model": ErrorResponse, "description": "Player matches were not found"},
#     },
# )
# # @public #custom decorator used to bypass cognito for testing
# async def get_player_matches(
#     server_region: str, puuid: str, count: int = 5
# ) -> list[str]:
#     "GET a list of match IDs by player PUUID."
#     match_ids: list[str] = await riot_service.get_match_ids(
#         server_region=server_region, puuid=puuid, count=count
#     )

#     return match_ids


# @router.get(
#     "/riot/matches/{match_id}/filtered",
#     tags=["Riot"],
#     summary="Get filtered Riot match",
#     description=(
#         "Fetches a full Riot match and returns a lightweight summary for one player "
#         "plus their teammates."
#     ),
#     response_model=SimplifiedMatchResponse,
#     responses={
#         404: {"model": ErrorResponse, "description": "Match or player was not found"},
#     },
# )
# async def get_filtered_match(match_id: str, puuid: str):
#     """
#     Fetches a full match from Riot's API and shrinks the payload
#     down to a lightweight summary for a single player.
#     """

#     try:
#         raw_match_data = await riot_service.get_match_detail(match_id)
#     except Exception as e:
#         raise HTTPException(status_code=404, detail=f"Failed to fetch match: {str(e)}")

#     full_match = raw_match_data

#     simplified_match = filter_match_for_players(
#         full_match=full_match, target_puuid=puuid
#     )

#     if not simplified_match:
#         raise HTTPException(
#             status_code=404,
#             detail=f"Player with PUUID {puuid} was not found in match {match_id}",
#         )

#     return simplified_match


# @router.get("/{server_region}/{puuid}/live-metrics", tags=["Live Metrics"])
# async def get_live_player_metrics(
#     server_region: str, puuid: str, count: int
# ) -> LiveAdvancedMetrics:
#     """
#     Asynchronously reaches out to Riot's server architecture to evaluate a player's last N matches.
#     Computes precise performance indexes including KDA, Vision, GPM, DPM, CS/Min, and KP% on the fly.
#     """
#     return await LiveAnalyticsService.get_live_metrics_from_api(
#         server_region=server_region, puuid=puuid, count=count
#     )


# @router.post(
#     "/token",
#     include_in_schema=False,
#     responses={
#         400: {"description": "Username and password are required"},
#         401: {"description": "Invalid username or password"},
#     },
# )
# async def swagger_login(request: Request) -> dict[str, str]:
#     form_data = parse_qs((await request.body()).decode())
#     username = form_data.get("username", [""])[0]
#     password = form_data.get("password", [""])[0]

#     if not username or not password:
#         raise HTTPException(
#             status_code=400,
#             detail="Username and password are required",
#         )

#     result = await auth_service.login_user(
#         username,
#         password,
#     )

#     if "error" in result:
#         raise HTTPException(
#             status_code=401,
#             detail="Invalid username or password",
#         )

#     return {
#         "access_token": result["IdToken"],
#         "token_type": "bearer",
#     }


# @router.post(
#     "/profile",
#     tags=["Profile"],
#     summary="Create current user profile",
#     include_in_schema=False,
#     description="Creates a profile for the authenticated user.",
#     responses={
#         401: {"model": ErrorResponse, "description": "Invalid or expired token"},
#         409: {"model": ErrorResponse, "description": "Profile already exists"},
#     },
# )
# async def create_profile(
#     request: ProfileCreateRequest,
#     current_user: Annotated[str, Depends(get_current_user)],
#     session: Annotated[AsyncSession, Depends(get_session)],
# ) -> ProfileResponse:
#     profile = await ProfileService.create_profile(
#         session=session,
#         user_id=current_user,
#         request=request,
#     )

#     total_matches, summary = await ProfileService.build_player_summary(
#         session,
#         current_user,
#     )

#     return ProfileResponse(
#         uuid=profile.user_id,
#         username=profile.username,
#         total_matches=total_matches,
#         player_summary=summary,
#     )


# @router.put(
#     "/profile",
#     tags=["Profile"],
#     summary="Update current user profile",
#     description="Updates the authenticated user's profile.",
#     responses={
#         401: {"model": ErrorResponse, "description": "Invalid or expired token"},
#         404: {
#             "model": ErrorResponse,
#             "description": "Profile or Riot account not found",
#         },
#     },
# )
# async def update_profile(
#     request: ProfileUpdateRequest,
#     current_user: Annotated[str, Depends(get_current_user)],
#     session: Annotated[AsyncSession, Depends(get_session)],
# ) -> ProfileResponse:
#     profile = await ProfileService.update_profile(
#         session=session,
#         user_id=current_user,
#         request=request,
#     )

#     total_matches, summary = await ProfileService.build_player_summary(
#         session,
#         current_user,
#     )

#     return ProfileResponse(
#         uuid=profile.user_id,
#         username=profile.username,
#         total_matches=total_matches,
#         player_summary=summary,
#     )
