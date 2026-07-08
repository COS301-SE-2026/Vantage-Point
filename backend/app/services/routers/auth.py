# Auth is handled via AWS Cognito.
# See app/api/routes.py for /auth/register, /auth/login, /auth/confirm, /auth/logout.
# So almost all of this file is deprecated/deleted because we don't use it anymore,
# it is removed and not commented out due to sonarqube secuirty concerns

from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])
