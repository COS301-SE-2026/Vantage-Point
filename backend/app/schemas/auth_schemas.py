from pydantic import BaseModel, EmailStr, Field

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)

class TokenResponse(BaseModel):
    access_token: str
    id_token: str
    refresh_token: str
    token_type = "Bearer"

#most probably will add this for 2 authentication so included so far
class UserConfirm(BaseModel):
    username: str
    confirmation_code: str = Field(..., min_length=6, max_length=6)