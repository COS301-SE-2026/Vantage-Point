import asyncio
import base64
import hashlib
import hmac
import logging
import uuid
from typing import TYPE_CHECKING, Any, Optional

import boto3
from botocore.exceptions import ClientError
from fastapi import HTTPException, status

from app.config import get_settings

if TYPE_CHECKING:
    from mypy_boto3_cognito_idp import CognitoIdentityProviderClient

settings = get_settings()
logger = logging.getLogger("app.auth")

client: "CognitoIdentityProviderClient" = boto3.client(
    "cognito-idp", region_name=settings.aws_region
)  # type: ignore


def get_secret_hash(username_or_email: str) -> Optional[str]:
    """Calculates HMAC-SHA256 secret hash required for Cognito App Clients with secrets."""
    secret = getattr(settings, "cognito_client_secret", None)
    if not secret:
        return None

    msg = username_or_email + settings.cognito_client_id
    dig = hmac.new(
        str(secret).encode("utf-8"),
        msg=msg.encode("utf-8"),
        digestmod=hashlib.sha256,
    ).digest()
    return base64.b64encode(dig).decode()


def _handle_cognito_error(e: ClientError) -> None:
    error_code = e.response.get("Error", {}).get("Code", "UnknownError")
    error_message = e.response.get("Error", {}).get("Message", str(e))

    status_code = status.HTTP_400_BAD_REQUEST
    if error_code in ["NotAuthorizedException", "UserNotFoundException"]:
        status_code = status.HTTP_401_UNAUTHORIZED
    elif error_code == "TooManyRequestsException":
        status_code = status.HTTP_429_TOO_MANY_REQUESTS
    elif error_code == "UserNotConfirmedException":
        status_code = status.HTTP_403_FORBIDDEN
    elif error_code == "UsernameExistsException":
        status_code = status.HTTP_409_CONFLICT

    raise HTTPException(status_code=status_code, detail=error_message)


async def register_user(email: str, password: str) -> dict[str, Any]:
    """Registers a user by generating an internal UUID for Username and setting email as attribute."""
    clean_email = email.strip().lower()
    internal_username = str(uuid.uuid4())

    try:
        user_attributes = [
            {"Name": "email", "Value": clean_email},
        ]

        kwargs: dict[str, Any] = {
            "ClientId": settings.cognito_client_id,
            "Username": internal_username,
            "Password": password,
            "UserAttributes": user_attributes,
        }

        # Secret hash must be calculated using the internal_username passed to Username
        secret_hash = get_secret_hash(internal_username)
        if secret_hash:
            kwargs["SecretHash"] = secret_hash

        response = await asyncio.to_thread(client.sign_up, **kwargs)

        is_confirmed = response.get("UserConfirmed", False)

        user_pool_id = getattr(settings, "cognito_user_pool_id", None)
        if user_pool_id and str(user_pool_id).strip():
            pool_id = str(user_pool_id).strip()

            # Auto-confirm status so user isn't stuck in UNCONFIRMED state
            await asyncio.to_thread(
                client.admin_confirm_sign_up,
                UserPoolId=user_pool_id,
                Username=internal_username,
            )

            # Explicitly mark email as verified
            await asyncio.to_thread(
                client.admin_update_user_attributes,
                UserPoolId=pool_id,
                Username=internal_username,
                UserAttributes=[{"Name": "email_verified", "Value": "true"}],
            )
            logger.info(f"Auto-confirmed and verified email for: {clean_email}")
            is_confirmed = True

        return {
            "user_sub": response.get("UserSub"),
            "user_confirmed": is_confirmed,
        }

    except ClientError as e:
        _handle_cognito_error(e)
        return {}


async def confirm_user(email_or_username: str, code: str) -> dict[str, str]:
    """Confirms account using email or internal username."""
    identifier = email_or_username.strip().lower()
    try:
        kwargs: dict[str, Any] = {
            "ClientId": settings.cognito_client_id,
            "Username": identifier,
            "ConfirmationCode": code.strip(),
        }

        secret_hash = get_secret_hash(identifier)
        if secret_hash:
            kwargs["SecretHash"] = secret_hash

        await asyncio.to_thread(client.confirm_sign_up, **kwargs)
        return {"status": "success", "message": "User confirmed successfully"}

    except ClientError as e:
        _handle_cognito_error(e)
        return {}


async def login_user(email_or_username: str, password: str) -> dict[str, Any]:
    """Logs in user using email or username via USER_PASSWORD_AUTH."""
    identifier = email_or_username.strip().lower()
    try:
        auth_params = {
            "USERNAME": identifier,
            "PASSWORD": password,
        }

        secret_hash = get_secret_hash(identifier)
        if secret_hash:
            auth_params["SECRET_HASH"] = secret_hash

        response = await asyncio.to_thread(
            client.initiate_auth,
            ClientId=settings.cognito_client_id,
            AuthFlow="USER_PASSWORD_AUTH",
            AuthParameters=auth_params,
        )

        if "AuthenticationResult" in response:
            return response["AuthenticationResult"]

        if "ChallengeName" in response:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Auth challenge required: {response['ChallengeName']}",
            )

        return {}

    except ClientError as e:
        _handle_cognito_error(e)
        return {}


async def logout_user(access_token: str) -> dict[str, str]:
    """Globally signs out the user session."""
    try:
        await asyncio.to_thread(client.global_sign_out, AccessToken=access_token)
        return {"status": "success", "message": "Logged out from all devices"}
    except ClientError as e:
        _handle_cognito_error(e)
        return {}
