import asyncio
import base64
from collections.abc import Mapping
import hashlib
import hmac
import logging
from typing import TYPE_CHECKING, Any, NoReturn, Optional

import boto3
from botocore.exceptions import ClientError
from fastapi import HTTPException, status

from app.config import get_settings

if TYPE_CHECKING:
    from mypy_boto3_cognito_idp import CognitoIdentityProviderClient

settings = get_settings()
logger = logging.getLogger("app.auth")

# Initialize the Cognito Client
client: "CognitoIdentityProviderClient" = boto3.client("cognito-idp", region_name=settings.aws_region)  # type: ignore


def log_registration(user_id: str, email: str) -> None:
    """Logs user registration by appending to registrations.txt."""
    with open("registrations.txt", "a") as f:
        f.write(f"{user_id},{email}\n")


def get_secret_hash(username: str) -> Optional[str]:
    """Calculates secret hash only if cognito_client_secret is provided."""
    secret = getattr(settings, "cognito_client_secret", None)
    if not secret:
        return None

    msg = username + settings.cognito_client_id
    dig = hmac.new(
        str(secret).encode("utf-8"),
        msg=msg.encode("utf-8"),
        digestmod=hashlib.sha256,
    ).digest()
    return base64.b64encode(dig).decode()


def handle_cognito_error(e: ClientError) -> NoReturn:
    """Helper to extract Cognito errors and raise a HTTP Exception 400/401/429 accordingly."""
    error_code = e.response.get("Error", {}).get("Code", "UnknownError")
    error_message = e.response.get("Error", {}).get("Message", str(e))

    status_code = status.HTTP_400_BAD_REQUEST
    if error_code in ["NotAuthorizedException", "UserNotFoundException"]:
        status_code = status.HTTP_401_UNAUTHORIZED
    elif error_code == "TooManyRequestsException":
        status_code = status.HTTP_429_TOO_MANY_REQUESTS

    raise HTTPException(status_code=status_code, detail=error_message)


async def register_user(username: str, password: str, email: str):
    if not (("@" in email) and (len(password) >= 8) and (len(username) > 0)):
        raise HTTPException(
            status_code=400, detail="Param does not meet min requirements"
        )

    try:
        kwargs: dict[str, Any] = {
            "ClientId": settings.cognito_client_id,
            "Username": username,
            "Password": password,
            "UserAttributes": [{"Name": "email", "Value": email}],
        }
        secret_hash = get_secret_hash(username)
        if secret_hash:
            kwargs["SecretHash"] = secret_hash

        response = await asyncio.to_thread(client.sign_up, **kwargs)

        if getattr(settings, "debug", False):
            await asyncio.to_thread(
                client.admin_confirm_sign_up,
                UserPoolId=settings.cognito_user_pool_id,
                Username=username,
            )

            await asyncio.to_thread(
                client.admin_update_user_attributes,
                UserPoolId=settings.cognito_user_pool_id,
                Username=username,
                UserAttributes=[{"Name": "email_verified", "Value": "true"}],
            )
            logger.info(
                f"User auto-confirmed and email verified in debug mode: {username}"
            )

        return response
    except ClientError as e:
        handle_cognito_error(e)


async def login_user(username: str, password: str) -> Mapping[str, Any]:
    if not (len(username) > 0 and len(password) >= 8):
        raise HTTPException(
            status_code=400, detail="Param does not meet min requirements"
        )
    try:
        auth_params = {
            "USERNAME": username,
            "PASSWORD": password,
        }
        secret_hash = get_secret_hash(username)
        if secret_hash:
            auth_params["SECRET_HASH"] = secret_hash

        response = await asyncio.to_thread(
            client.initiate_auth,
            ClientId=settings.cognito_client_id,
            AuthFlow="USER_PASSWORD_AUTH",
            AuthParameters=auth_params,
        )
        return response.get("AuthenticationResult", {})
    except ClientError as e:
        handle_cognito_error(e)


async def confirm_user(username: str, code: str) -> dict[str, str]:
    """Confirm the user using the code sent to their email."""
    try:
        kwargs: dict[str, Any] = {
            "ClientId": settings.cognito_client_id,
            "Username": username,
            "ConfirmationCode": code,
        }
        secret_hash = get_secret_hash(username)
        if secret_hash:
            kwargs["SecretHash"] = secret_hash

        await asyncio.to_thread(client.confirm_sign_up, **kwargs)
        return {"status": "success"}
    except ClientError as e:
        handle_cognito_error(e)


async def logout_user(access_token: str) -> dict[str, str]:
    """Invalidates the user's tokens globally in Cognito."""
    try:
        await asyncio.to_thread(client.global_sign_out, AccessToken=access_token)
        return {"status": "success", "message": "Logged out from all devices"}
    except ClientError as e:
        handle_cognito_error(e)


async def revoke_refresh_token(refresh_token: str) -> dict[str, str]:
    """Revokes a specific refresh token and its associated access tokens."""
    try:
        kwargs: dict[str, Any] = {
            "Token": refresh_token,
            "ClientId": settings.cognito_client_id,
        }
        secret = getattr(settings, "cognito_client_secret", None)
        if secret:
            kwargs["ClientSecret"] = secret

        await asyncio.to_thread(client.revoke_token, **kwargs)
        return {"status": "success", "message": "Refresh token revoked."}
    except ClientError as e:
        handle_cognito_error(e)
