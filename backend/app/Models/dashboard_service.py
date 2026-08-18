from pydantic import BaseModel


class ActivityResponse(BaseModel):
    timestamp: int
    event_type: str | None
    message: str | None
