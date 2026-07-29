from pydantic import BaseModel


class GetErrorLogLists(BaseModel):
    id: int
    error_code: str
    service: str
    severity: str
    message: str
    occuret_at: str
    reviewed: str


class ToggleReview(BaseModel):
    id: int
    reviewed: bool
