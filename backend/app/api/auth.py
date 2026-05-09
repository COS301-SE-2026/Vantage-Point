from jose import jwt, JWTError
import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.config import get_settings

settings = get_settings()
# This looks for "Authorization: Bearer <token>" in the header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Cache keys to avoid hitting AWS on every single request
JWKS_CACHE = None

async def get_current_user(token: str = Depends(oauth2_scheme)):
    global JWKS_CACHE
    try:
        if not JWKS_CACHE:
            url = f"https://cognito-idp.{settings.aws_region}.amazonaws.com/{settings.cognito_user_pool_id}/.well-known/jwks.json"
            async with httpx.AsyncClient() as client:
                response = await client.get(url)
                JWKS_CACHE = response.json()

        payload = jwt.decode(
            token, JWKS_CACHE, algorithms=["RS256"],
            audience=settings.cognito_client_id,
            issuer=f"https://cognito-idp.{settings.aws_region}.amazonaws.com/{settings.cognito_user_pool_id}"
        )
        return payload.get("sub") # Return the Cognito User ID
    except JWTError:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid Token")