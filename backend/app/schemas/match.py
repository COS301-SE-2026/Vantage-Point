from pydantic import BaseModel


class ObjectivesSummaryResponse(BaseModel):
    baron: int
    dragon: int
    rift_herald: int
    tower: int
    inhibitor: int


class ChampionBanResponse(BaseModel):
    champion_id: int
    champion_name: str


class ParticipantDetailResponse(BaseModel):
    puuid: str
    riot_id: str | None
    champion_id: int
    champion_name: str
    position: str
    win: bool
    kills: int
    deaths: int
    assists: int
    cs: int
    gold_earned: int
    damage_to_champions: int
    vision_score: int
    items: list[int]
    summoner_spells: list[int]
    is_viewer: bool


class TeamDetailResponse(BaseModel):
    team_id: int
    win: bool
    bans: list[ChampionBanResponse]
    objectives: ObjectivesSummaryResponse
    participants: list[ParticipantDetailResponse]


class MatchDetailResponse(BaseModel):
    match_id: str
    game_creation: int
    game_duration: int
    game_version: str
    queue_id: int
    queue_label: str
    map_id: int
    map_label: str
    teams: list[TeamDetailResponse]


class MatchHistorySummaryResponse(BaseModel):
    match_id: str
    champion_name: str
    outcome: str
    duration_minutes: int
    map_label: str
    played_on: str
    kills: int
    deaths: int
    assists: int
    cs: int
    position: str
