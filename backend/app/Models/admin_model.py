from pydantic import BaseModel
from datetime import datetime

class UserResponse(BaseModel):
    username: str
    email: str | None
    sub: str | None
    user_created_date: datetime
    user_last_modified_date: datetime
    enabled: bool
    user_status: str

class Response(BaseModel):
    success: bool = True
    message: str = ""

class CreateGroupResponse(BaseModel):
    group_name: str
    user_pool_id: str
    descriptipn: str
    precedence: int
    last_modified_date: datetime
    creation_date: datetime