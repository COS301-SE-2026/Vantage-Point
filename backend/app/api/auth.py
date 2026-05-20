from jose import jwt, JWTError
import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.config import get_settings

settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Cache keys to avoid hitting AWS on every single request
jwks_cache = None


async def get_current_user(token: str = Depends(oauth2_scheme)):
    global jwks_cache
    issuer = f"https://cognito-idp.{settings.aws_region}.amazonaws.com/{settings.cognito_user_pool_id}"
    url = f"{issuer}/.well-known/jwks.json"

    try:
        if jwks_cache is None:
            async with httpx.AsyncClient() as client:
                response = await client.get(url)
            jwks_cache = response.json()

        # 2. Decode and verify the token
        payload = jwt.decode(
            token,
            jwks_cache,
            algorithms=["RS256"],
            audience=settings.cognito_client_id,
            issuer=issuer,
        )

        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token missing subject")

        return str(user_id)  # Return the Cognito User ID
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
