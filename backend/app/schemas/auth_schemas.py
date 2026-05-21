from pydantic import BaseModel, EmailStr, Field
from typing import Any, ClassVar, Optional, List
from datetime import datetime

# ============ Request Models ============

class UserRegister(BaseModel):
    """User registration request"""

    username: str = Field(
        ..., min_length=3, max_length=50, description="Unique username"
    )
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(..., min_length=8, description="Password (min 8 characters)")
    confirm_password: str = Field(..., min_length=8, description="Must match password")

    class Config:
        json_schema_extra: ClassVar[dict[str, Any]] = {
            "example": {
                "username": "Sn1per1",
                "email": "player@example.com",
                "password": "securepassword123",
                "confirm_password": "securepassword123",
            }
        }

class UserLogin(BaseModel):
    """User login request"""

    username: str = Field(..., min_length=3, max_length=50, description="Your username")
    password: str = Field(..., min_length=8, description="Your password")

    class Config:
        json_schema_extra: ClassVar[dict[str, Any]] = {
            "example": {"username": "Sn1per1", "password": "securepassword123"}
        }

class UserConfirm(BaseModel):
    """Email confirmation request (for 2FA/email verification)"""

    username: str = Field(..., description="Username to confirm")
    confirmation_code: str = Field(
        ..., min_length=6, max_length=6, description="6-digit confirmation code"
    )

class RefreshTokenRequest(BaseModel):
    """Request new access token using refresh token"""

    refresh_token: str = Field(..., description="Refresh token from login")

class ChangePasswordRequest(BaseModel):
    """Request to change password"""

    old_password: str = Field(..., min_length=8)
    new_password: str = Field(..., min_length=8)
    confirm_new_password: str = Field(..., min_length=8)

# ============ Response Models ============

class UserInfo(BaseModel):
    """User information response"""

    id: str
    username: str
    email: str
    riot_puuid: Optional[str] = None
    riot_game_name: Optional[str] = None
    riot_tag_line: Optional[str] = None
    is_active: bool = True
    is_verified: bool = False
    created_at: datetime
    last_login: Optional[datetime] = None

class TokenResponse(BaseModel):
    """Authentication token response"""

    access_token: str
    refresh_token: str
    id_token: Optional[str] = None  # For future OIDC integration
    token_type: str = "Bearer"
    expires_in: int = 3600  # 1 hour in seconds

    class Config:
        json_schema_extra: ClassVar[dict[str, Any]] = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIs...",
                "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
                "token_type": "Bearer",
                "expires_in": 3600,
            }
        }

class LoginResponse(BaseModel):
    """Complete login response"""

    user: UserInfo
    tokens: TokenResponse

class RegisterResponse(BaseModel):
    """Registration response"""

    message: str
    user_id: str
    username: str
    email: str
    requires_verification: bool = True

# ============ Token Payload Models ============

class AccessTokenPayload(BaseModel):
    """JWT Access Token Payload"""

    sub: str  # user_id
    username: str
    exp: int  # expiration timestamp
    iat: int  # issued at timestamp
    type: str = "access"

class RefreshTokenPayload(BaseModel):
    """JWT Refresh Token Payload"""

    sub: str  # user_id
    username: str
    exp: int
    iat: int
    type: str = "refresh"

class PlayerSummary(BaseModel):
    most_played_character: str
    common_mistakes: List[str]
    avg_kda: str
    win_rate: str

class ProfileResponse(BaseModel):
    uuid: str
    username: str
    total_matches: int
    player_summary: PlayerSummary
