#todo
#register, login, logout, confirm(email)

from app.services import auth_service
from app.Models.auth_model import User

async def register(user: User):
    return await auth_service.register_user(user=user)

async def login(username: str, password: str):
    return await auth_service.login_user(username, password)

async def logout(access_token: str):
    return await auth_service.logout_user(access_token)
    