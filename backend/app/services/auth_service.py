import boto3
import hmac
import hashlib
import base64
import asyncio
from fastapi import HTTPException
from app.config import get_settings
from botocore.exceptions import ClientError
from typing import TYPE_CHECKING, Any, NoReturn, cast
from collections.abc import Mapping
from app.Models.auth_model import User

if TYPE_CHECKING:
    from mypy_boto3_cognito_idp import CognitoIdentityProviderClient

settings = get_settings()

# Initialize the Cognito Client
client: "CognitoIdentityProviderClient" = boto3.client("cognito-idp", region_name=settings.aws_region)  # type: ignore


def get_secret_hash(username: str):
    """
    Cognito requires a keyed-hash to verify the client.
    """
    msg = username + settings.cognito_client_id
    dig = hmac.new(
        str(settings.cognito_client_secret).encode("utf-8"),
        msg=msg.encode("utf-8"),
        digestmod=hashlib.sha256,
    ).digest()
    return base64.b64encode(dig).decode()

#might change to do all over log and then move to another functionality
def log_registration(username: str, email: str):
    """Writes new user info to a local text file"""
    with open("registrations.txt", "a") as f:
        f.write(f"User: {username} | Email: {email} | Status: REGISTERED\n")


def _handle_cognito_error(e: ClientError) -> NoReturn:
    """Helper to extract Cognito errors and raise a standardized HTTP exception."""
    error_code = e.response.get("Error", {}).get("Code", "UnknownError")
    error_message = e.response.get("Error", {}).get("Message", str(e))

    # Map common Cognito errors to appropriate HTTP status codes
    status_code = 400
    if error_code in ["NotAuthorizedException", "UserNotFoundException"]:
        status_code = 401
    elif error_code == "TooManyRequestsException":
        status_code = 429

    raise HTTPException(status_code=status_code, detail=error_message)


async def register_user(user: User):
    if not (("@" in user.email) and (len(user.password) >= 8) and (len(user.username) > 0)):
        raise HTTPException(
            status_code=400,detail="Param does not met min requirements"
        )
    
    try:
        response = await asyncio.to_thread(
            client.sign_up,
            ClientId=settings.cognito_client_id,
            SecretHash=get_secret_hash(user.username),
            Username=user.username,
            Password=user.password,
            UserAttributes= [{"Name": "Email", "Value": "email"}]
        )
        return response
    except ClientError as e:
        _handle_cognito_error(e)

async def login_user(username: str, password: str) -> Mapping[str, Any]:
    if not (len(username) > 0 and len(password) >= 8):
        raise HTTPException(
            status_code=400,
            detail="Param does not meet min requirements"
        )
    try:
        response = await asyncio.to_thread(
            client.initiate_auth,
            ClientId=settings.cognito_client_id,
            AuthFlow="USER_PASSWORD_AUTH",
            AuthParameters={
                "USERNAME": username,
                "PASSWORD": password,
                "SECRET_HASH": get_secret_hash(username),
            },
        )
        auth_result = cast(dict[str, Any], response["AuthenticationResult"])
        return {
            "access_token": auth_result["AccessToken"],
            "id_token": auth_result["IdToken"],
            "refresh_token": auth_result["RefreshToken"],
            "expires_in":3600
        }
    except ClientError as e:
        _handle_cognito_error(e)

async def confirm_user(username: str, code: str):
    """Confirm the user using the code sent to their email."""
    if not (len(username) > 0 & len(code) == 6):
        raise HTTPException(
            status_code=400,
            detail="Not meeting min param requirements"
        )
    try:
        await asyncio.to_thread(
            client.confirm_sign_up,
            ClientId=settings.cognito_client_id,
            SecretHash=get_secret_hash(username),
            Username=username,
            ConfirmationCode=code,
        )
        return {"status": "success"}
    except ClientError as e:
        _handle_cognito_error(e)

async def logout_user(access_token: str) -> dict[str, str]:
    """
    Invalidates the user's tokens globally in Cognito.
    """
    try:
        await asyncio.to_thread(client.global_sign_out, AccessToken=access_token)
        return {"status": "success", "message": "Logged out from all devices"}
    except ClientError as e:
        _handle_cognito_error(e)

async def revoke_refresh_token(refresh_token: str) -> dict[str, str]:
    """
    Revokes a specific refresh token and its associated access tokens.
    """
    try:
        await asyncio.to_thread(
            client.revoke_token,
            Token=refresh_token,
            ClientId=settings.cognito_client_id,
            ClientSecret=settings.cognito_client_secret,
        )
        return {"status": "success", "message": "Refresh token revoked."}
    except ClientError as e:
        _handle_cognito_error(e)
