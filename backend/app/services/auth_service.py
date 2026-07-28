import boto3
import hmac
import hashlib
import base64
import asyncio
import logging
from fastapi import HTTPException
from app.config import get_settings
from botocore.exceptions import ClientError
from typing import TYPE_CHECKING, Any, NoReturn
from collections.abc import Mapping

if TYPE_CHECKING:
    from mypy_boto3_cognito_idp import CognitoIdentityProviderClient

settings = get_settings()
logger = logging.getLogger("app.auth")

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


async def register_user(username: str, password: str, email: str) -> Mapping[str, Any]:
    try:
        response = await asyncio.to_thread(
            client.sign_up,
            ClientId=settings.cognito_client_id,
            SecretHash=get_secret_hash(username),
            Username=username,
            Password=password,
            UserAttributes=[{"Name": "email", "Value": email}],
        )

        # 2. AUTO-CONFIRM
        # This makes the user active immediately so they can login.
        if settings.debug:  # Use debug flag from config.py
            await asyncio.to_thread(
                client.admin_confirm_sign_up,
                UserPoolId=settings.cognito_user_pool_id,
                Username=username,
                SecretHash=get_secret_hash(username),  # type: ignore[call-arg]
            )
            logger.info(f"User automatically confirmed in debug mode: {username}")

        # await asyncio.to_thread(log_registration, username, email)
        logger.info(f"User registration initialized: {username} | Email: {email}")
        return response

    except ClientError as e:
        _handle_cognito_error(e)


async def login_user(username: str, password: str) -> Mapping[str, Any]:
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
        # This returns the AccessToken, IdToken, and RefreshToken
        return response["AuthenticationResult"]
    except ClientError as e:
        _handle_cognito_error(e)


async def confirm_user(username: str, code: str):
    """Confirm the user using the code sent to their email."""
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
            # SecretHash is NOT needed for revoke_token,
            # but ClientSecret IS if your client has one
        )
        return {"status": "success", "message": "Refresh token revoked."}
    except ClientError as e:
        _handle_cognito_error(e)
