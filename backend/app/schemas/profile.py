from pydantic import BaseModel, EmailStr
from datetime import datetime


class RadarMetricResponse(BaseModel):
    key: str
    label: str
    value: int
    raw_label: str


class RecentChampionResponse(BaseModel):
    champion_id: int
    champion_name: str
    games_played: int


class PlayerAchievementResponse(BaseModel):
    id: str
    label: str
    description: str
    source_field: str
    count: int


class FeaturedGameSlideResponse(BaseModel):
    game_name: str
    cover_image_key: str
    card_image_key: str | None = None
    efficiency_score: int
    time_spent_label: str
    win_rate_label: str
    kda_label: str


class PlayerProfileResponse(BaseModel):
    display_name: str
    riot_id_tag: str
    avatar_initials: str
    avatar_url: str | None = None
    matches_sampled: int
    radar_metrics: list[RadarMetricResponse]
    recent_champions: list[RecentChampionResponse]
    achievements: list[PlayerAchievementResponse]
    featured_games: list[FeaturedGameSlideResponse]


class LiveAdvancedMetrics(BaseModel):
    games_analyzed: int
    avg_kda: str
    avg_vision_score: float
    avg_kill_participation_pct: float
    avg_cs_per_minute: float
    avg_damage_per_minute: float
    avg_gold_per_minute: float
    win_rate: str


class MatchSummary(BaseModel):
    match_id: str
    champion_name: str
    kills: int
    deaths: int
    assists: int
    win: bool
    game_creation: datetime | None = None


class MessageResponse(BaseModel):
    message: str


class ProfileCreateRequest(BaseModel):
    display_name: str
    email: EmailStr | None = None


class ProfileUpdateRequest(BaseModel):
    display_name: str | None = None
    email: EmailStr | None = None
    avatar_url: str | None = None


class ProfileResponse(BaseModel):
    sub: str | None = None
    username: str | None = None
    email: str | None = None
    display_name: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
    scheduled_deletion: datetime | None = None


class RiotKeyUpdateResponse(BaseModel):
    message: str
    success: bool = True
