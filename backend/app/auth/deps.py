# from fastapi import Depends, HTTPException, status
# from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
# from sqlalchemy.ext.asyncio import AsyncSession
# from sqlmodel import select

# from app.api.auth import get_current_user as get_cognito_sub
# from app.database.models import Users
# from app.database.session import get_session

# security = HTTPBearer(auto_error=False)


# async def get_current_user(
#     credentials: HTTPAuthorizationCredentials | None = Depends(security),
#     session: AsyncSession = Depends(get_session),
# ) -> Users:
#     if credentials is None or credentials.scheme.lower() != "bearer":
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Not authenticated",
#             headers={"WWW-Authenticate": "Bearer"},
#         )

#     payload = await get_cognito_sub(credentials.credentials)
#     sub = str(payload.get("sub"))

#     result = await session.execute(select(Users).where(Users.cognito_sub == sub))
#     user = result.scalar_one_or_none()
#     if not user:
#         user = Users(
#             cognito_sub=sub,
#             email=payload.get("email") or f"{sub[:8]}@placeholder.invalid",
#             display_name=None,
#         )
#         session.add(user)
#         await session.commit()
#         await session.refresh(user)

#     return user
