# app/api/routes.py
from fastapi import APIRouter, Depends
from app.api.auth import get_current_user

router = APIRouter()

@router.get("/user/profile")
async def read_profile(current_user: dict = Depends(get_current_user)):
    # The 'sub' is the unique Cognito ID for the user
    user_id = current_user.get("sub")
    return {"message": f"Hello User {user_id}", "data": current_user}