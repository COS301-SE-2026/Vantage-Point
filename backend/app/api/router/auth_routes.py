from app.api.auth import oauth2_scheme
from app.schemas.auth_schemas import (
    CognitoRegisterRequest,
    ConfirmUserRequest,
    LoginRequest,
    RefreshAuthRequest,
)
from app.services import auth_service
from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials
from typing import Annotated, Any

router = APIRouter()


@router.post(
    "/register",
    response_model=dict[str, Any],
    summary="Register a new user",
    description=(
        "Creates a new cognito user and sends a verification code using cognito. "
        "Credentials go in the request body, never the query string."
    ),
    tags=["Auth"],
    responses={400: {"description": "Username already exists or invalid password"}},
)
async def register(body: CognitoRegisterRequest):
    return await auth_service.register_user(body.username, body.password, body.email)


# returns tokens. Not a user
@router.post(
    "/login",
    response_model=Any,
    summary="Login a user",
    description=(
        "Login a cognito user. Credentials go in the request body: as query "
        "parameters they would be written to the access log, the browser's history "
        "and any Referer header the page sends."
    ),
    tags=["Auth"],
    responses={
        400: {"description": "User does not exist"},
    },
)
async def login(body: LoginRequest):
    return await auth_service.login_user(body.identifier(), body.password)


@router.post(
    "/confim-user",
    response_model=dict[str, str],
    summary="Confirm user account",
    description="Confirms a user in cognito pool. Verifies email bny taking in code",
    tags=["Auth"],
    responses={400: {"description": "Invalid code"}},
)
async def confirm_user(body: ConfirmUserRequest):
    return await auth_service.confirm_user(body.username, body.code)


@router.post(
    "/logout",
    response_model=dict[str, str],
    summary="Logout a user",
    description=(
        "Logs a user out of Cognito everywhere. The access token is read from the "
        "Authorization header, which is where the client already carries it, rather "
        "than being repeated in the body. Cognito is what validates it."
    ),
    tags=["Auth"],
)
async def logout(
    credential: Annotated[HTTPAuthorizationCredentials, Depends(oauth2_scheme)],
):
    return await auth_service.logout_user(credential.credentials)


# trying to make it easier, probably just refresh the token before the expiry date hits otherwise this is going to fail
# use 10 becuase all people will be apart of the User group, and if not will be higher in the system so wont cause issues
@router.post(
    "/refresh-auth",
    summary="Refresh Access token",
    description="Endpoint to be used by frontend to refresh and get a valid accesstoken to be used again",
    tags=["Auth"],
)
async def refresh_access_token(body: RefreshAuthRequest):
    return await auth_service.refresh_access_token(body.username, body.refresh_token)
