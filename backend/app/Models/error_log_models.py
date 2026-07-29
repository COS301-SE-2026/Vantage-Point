from pydantic import BaseModel
from datetime import datetime

class GetErrorLogLists(BaseModel):
    id: int
    error_code: str
    service: str
    severity: str
    message: str
    occuret_at: str
    reviewed: str