from pydantic import BaseModel

class Users(BaseModel):
    username: str
    email: str
    sub: str
    user_created_date: str
    user_last_modified_date: str
    enanled: str
    user_status: str