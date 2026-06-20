from typing import List, Optional, Dict, Any
from pydantic import BaseModel

# ============ Account API ============


class RiotAccountResponse(BaseModel):
    """Response from Riot Account API (by-riot-id)"""

    puuid: str
    gameName: str
    tagLine: str

    class Config:
        json_schema_extra: Dict[str, Any] = {
            "example": {
                "puuid": "z1x2c3v4b5n6m7_8a9s0d1f2g3h4j5k6l7_8q9w0e1r2t3y4u5i6o7p8",
                "gameName": "Sn1per1",
                "tagLine": "NA2",
            }
        }


# ============ Summoner API (Legacy) ============


class SummonerResponse(BaseModel):
    """Response from Summoner API"""

    id: str
    accountId: str
    puuid: str
    name: str
    profileIconId: int
    revisionDate: int
    summonerLevel: int


# ============ Match API ============


class ParticipantPerks(BaseModel):
    """Perks/Runes for a participant"""

    statPerks: Dict[str, int]
    styles: List[Dict[str, Any]]


class MatchParticipant(BaseModel):
    """Complete participant data from match"""

    puuid: str
    summonerId: str
    summonerName: str
    summonerLevel: int
    championId: int
    championName: str
    teamPosition: str  # TOP, JUNGLE, MIDDLE, BOTTOM, UTILITY
    teamId: int
    win: bool

    # KDA
    kills: int
    deaths: int
    assists: int

    # Gold & CS
    goldEarned: int
    goldSpent: int
    totalMinionsKilled: int
    neutralMinionsKilled: int

    # Damage
    totalDamageDealtToChampions: int
    physicalDamageDealtToChampions: int
    magicDamageDealtToChampions: int
    trueDamageDealtToChampions: int
    damageSelfMitigated: int

    # Vision
    visionScore: int
    wardsPlaced: int
    wardsKilled: int
    visionWardsBoughtInGame: int

    # Items
    item0: int
    item1: int
    item2: int
    item3: int
    item4: int
    item5: int
    item6: int

    # Multikills
    doubleKills: int
    tripleKills: int
    quadraKills: int
    pentaKills: int
    largestMultiKill: int

    # Objectives
    baronKills: int
    dragonKills: int
    turretKills: int
    inhibitorKills: int
    objectivesStolen: int

    # Summoner Spells
    summoner1Id: int
    summoner1Casts: int
    summoner2Id: int
    summoner2Casts: int

    # Time
    timePlayed: int
    totalTimeSpentDead: int
    longestTimeSpentLiving: int

    # Perks/Runes
    perks: ParticipantPerks

    # Challenge stats
    challenges: Optional[Dict[str, Any]] = None


class TeamObjective(BaseModel):
    """Team objective stats"""

    first: bool
    kills: int


class TeamObjectives(BaseModel):
    """All team objectives"""

    baron: TeamObjective
    dragon: TeamObjective
    tower: TeamObjective
    inhibitor: TeamObjective
    riftHerald: TeamObjective
    champion: Optional[TeamObjective] = None
    horde: Optional[TeamObjective] = None


class TeamBan(BaseModel):
    """Champion bans"""

    championId: int
    pickTurn: int


class Team(BaseModel):
    """Team data"""

    teamId: int
    win: bool
    bans: List[TeamBan]
    objectives: TeamObjectives


class MatchInfo(BaseModel):
    """Match info section"""

    gameId: int
    gameCreation: int
    gameDuration: int
    gameEndTimestamp: int
    gameStartTimestamp: int
    gameMode: str
    gameName: str
    gameType: str
    gameVersion: str
    mapId: int
    platformId: str
    queueId: int
    tournamentCode: Optional[str] = None
    endOfGameResult: str
    participants: List[MatchParticipant]
    teams: List[Team]


class MatchMetadata(BaseModel):
    """Match metadata"""

    dataVersion: str
    matchId: str
    participants: List[str]  # List of PUUIDs


class RiotMatchResponse(BaseModel):
    """Complete Riot match response"""

    metadata: MatchMetadata
    info: MatchInfo


class RiotMatchListResponse(BaseModel):
    """List of match IDs"""

    match_ids: List[str]
    puuid: str
    count: int


# simplified shcemas


class SimplifiedPlayerStats(BaseModel):
    summoner_name: str
    champion_name: str
    kills: int
    deaths: int
    assists: int
    kda: float
    role: str

    double_kills: int
    triple_kills: int
    quadra_kills: int
    penta_kills: int
    largest_multikill: int

    primary_runes: Optional[List[int]] = None
    secondary_runes: Optional[List[int]] = None

    class Config:
        json_schema_extra: Dict[str, Any] = {
            "example": {
                "summoner_name": "CoolPlayer",
                "champion_name": "Yasuo",
                "kills": 12,
                "deaths": 3,
                "assists": 8,
                "kda": 6.67,
                "team_position": "MIDDLE",
                "role": "SOLO",
                "double_kills": 2,
                "triple_kills": 1,
                "quadra_kills": 0,
                "penta_kills": 0,
                "largest_multikill": 3,
                "primary_runes": [8112, 8126, 8138, 8135],
                "secondary_runes": [8232, 8234],
            }
        }


class SimplifiedTeammate(BaseModel):
    summoner_name: str
    champion_name: str
    kills: int
    deaths: int
    assists: int
    kda: float
    role: str


class SimplifiedMatchResponse(BaseModel):
    match_id: str
    game_mode: str
    map_id: int
    duration_seconds: int
    your_stats: SimplifiedPlayerStats
    teammates: List[SimplifiedTeammate]
    your_team_won: bool

    class Config:
        json_schema_extra: Dict[str, Any] = {
            "example": {
                "match_id": "EUW1_1234567890",
                "game_mode": "CLASSIC",
                "map_id": 11,
                "duration_seconds": 2345,
                "your_stats": {
                    "summoner_name": "CoolPlayer",
                    "champion_name": "Yasuo",
                    "kills": 12,
                    "deaths": 3,
                    "assists": 8,
                    "kda": 6.67,
                    "team_position": "MIDDLE",
                    "role": "SOLO",
                    "double_kills": 2,
                    "triple_kills": 1,
                    "quadra_kills": 0,
                    "penta_kills": 0,
                    "largest_multikill": 3,
                    "primary_runes": [8112, 8126, 8138, 8135],
                    "secondary_runes": [8232, 8234],
                },
                "teammates": [
                    {
                        "summoner_name": "Teammate1",
                        "champion_name": "LeeSin",
                        "kills": 5,
                        "deaths": 4,
                        "assists": 10,
                        "kda": 3.75,
                        "team_position": "JUNGLE",
                        "role": "NONE",
                    }
                ],
                "your_team_won": True,
            }
        }

class MapReplay(BaseModel):
    puuid: str
    participant_id: str
    frame_interval: int
    timestamp: int
    position_x = []
    position_y = []

class MapSuggestData(BaseModel):
    map_replay: MapReplay
    game_result: str
    armor = []
    attack_damage: int
    attack_speed: int
    health: int
    health_max: int
    health_regen: int
    champion_id: int
    true_damage_done = []
    true_damage_done_to_champion = []
    true_damage_taken = []
    gold_per_second = []
    level: int
    xp: int
    team_position: int
    lane: str
