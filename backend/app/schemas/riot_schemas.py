from typing import List, Optional, Dict, Any
from pydantic import BaseModel

# ============ Account API ============


class RiotAccountResponse(BaseModel):
    """Response from Riot Account API (by-riot-id)"""

    puuid: str
    gameName: str
    tagLine: str

    class Config:
        json_schema_extra = {
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
