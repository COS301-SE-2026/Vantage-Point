from pydantic import BaseModel


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
