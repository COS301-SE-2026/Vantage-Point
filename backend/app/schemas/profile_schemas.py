from pydantic import BaseModel, Field

class MessageResponse(BaseModel):
    message: str = Field(..., description="Human-readable operation result")


class MatchSummary(BaseModel):
    match_id: str
    map: str
    game_mode: str
    duration: str
    status: str
    kda: str
    champion: str


class RiotKeyUpdateResponse(BaseModel):
    message: str
    user: str
    status: str