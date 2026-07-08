from pydantic import BaseModel, Field
from typing import Optional


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


class PlayerSummary(BaseModel):
    most_played_character: str
    common_mistakes: list[str]
    avg_kda: str
    win_rate: str


class ProfileResponse(BaseModel):
    cognito_sub: str
    display_name: Optional[str] = None
    total_matches: int
    player_summary: PlayerSummary


class LiveAdvancedMetrics(BaseModel):
    games_analyzed: int
    avg_kda: str
    avg_vision_score: float
    avg_kill_participation_pct: float
    avg_cs_per_minute: float
    avg_damage_per_minute: float
    avg_gold_per_minute: float
    win_rate: str


class ProfileCreateRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    riot_puuid: Optional[str] = None


class ProfileUpdateRequest(BaseModel):
    username: Optional[str] = Field(default=None, min_length=3, max_length=50)
    riot_puuid: Optional[str] = None
