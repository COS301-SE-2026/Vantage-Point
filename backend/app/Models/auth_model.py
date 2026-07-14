from pydantic import BaseModel, EmailStr


class User(BaseModel):
    sub: str
    password: str
    username: str
    email: EmailStr
