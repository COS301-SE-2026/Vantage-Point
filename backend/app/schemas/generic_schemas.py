from pydantic import BaseModel
from typing import Any, Optional

class APIResponse(BaseModel):
    status: str = "success"
    message: Optional[str] = None
    data: Optional[Any] = None

class ErrorResponse(BaseModel):
    status: str = "error"
    detail: str