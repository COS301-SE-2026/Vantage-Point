from pydantic import BaseModel, EmailStr, Field
from typing import Optional

# ============ Request Models ============


class RegisterRequest(BaseModel):
    """Registration payload sent by the web client.

    `username` and `confirm_password` are accepted for the older Swagger-facing shape;
    the client identifies accounts by email and confirms the password in the browser.
    """

    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(..., min_length=8, description="Password (min 8 characters)")
    display_name: Optional[str] = Field(
        default=None, max_length=64, description="Name shown across the dashboard"
    )
    username: Optional[str] = Field(default=None, min_length=3, max_length=50)
    confirm_password: Optional[str] = Field(default=None, min_length=8)


class LoginRequest(BaseModel):
    """Login payload. The client sends the email in `username`; `email` also works."""

    password: str = Field(..., description="Your password")
    username: Optional[str] = Field(default=None, max_length=64)
    email: Optional[str] = Field(default=None, max_length=64)

    def identifier(self) -> str:
        return (self.username or self.email or "").strip()


class AuthTokens(BaseModel):
    """Locally signed token pair accepted by every /api/v1 route."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    """Request new access token using refresh token"""

    refresh_token: str = Field(..., description="Refresh token from login")


# ============ Cognito request bodies ============
# These carry secrets: passwords, verification codes and tokens. Each one is a body
# rather than a set of query parameters, because a URL is written to the server's
# access log, the browser's history and any Referer header the page emits.


class CognitoRegisterRequest(BaseModel):
    """Registration payload for the Cognito-backed `/register` route.

    Distinct from `RegisterRequest` because Cognito keys accounts by username and
    cannot register without one, where the local shape treats it as optional.
    """

    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(..., min_length=8, description="Password (min 8 characters)")


class ConfirmUserRequest(BaseModel):
    """The code Cognito emailed the user, and who it was sent to."""

    username: str = Field(..., min_length=1, max_length=50)
    code: str = Field(..., min_length=6, max_length=6, description="6-digit code")


class RefreshAuthRequest(BaseModel):
    """A refresh exchange. Cognito needs the username to compute the secret hash."""

    username: str = Field(..., min_length=1, max_length=50)
    refresh_token: str = Field(..., description="Refresh token from login")
