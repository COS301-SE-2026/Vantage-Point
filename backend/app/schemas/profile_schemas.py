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


class PlayerSummary(BaseModel):
    most_played_character: str
    common_mistakes: list[str]
    avg_kda: str
    win_rate: str


class ProfileResponse(BaseModel):
    uuid: str
    username: str
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
