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
    puuid: List[str]
    participant_id: List[int]
    frame_interval: int
    timestamp: list[int]
    position_x: Any
    position_y: Any


class MapSuggestData(BaseModel):
    map_replay: MapReplay
    end_of_game_result: str
    armor: Any
    attack_damage: Any
    attack_speed: Any
    health: Any
    health_max: Any
    health_regen: Any
    champion_id: Any
    true_damage_done: Any
    true_damage_done_to_champion: Any
    true_damage_taken: Any
    gold_per_second: Any
    level: Any
    xp: Any
    team_position: Any
    lane: Any


class MatchData(BaseModel):
    end_of_game_result: str
    gameDuration: int
    gameMode: str
    gameName: str
    mapId: int
    champExperience: int
    champLevel: int
    championName: str
    earliestBaron: int
    earliestDragonTakedown: int
    earliestElderDragon: int
    fastestLegendary: int
    highestChampionDamage: int
    takedownFirst25Min: int
    teleportTakedowns: int
    thirdInhibitorDestroyedTime: int
    fistBumpTakedowns: int
    baronTakedowns: int
    bountyGold: int
    damagePerMinute: float
    deatshByEnemyChamps: int
    elderDragonMultikill: int
    enemyJungleMonsterKills: int
    firstTurretKilled: bool
    firstTuttetKilledTime: int
    gameLength: float
    goldPerMinute: float
    kda: float
    killingSprees: int
    lostAnInhibitor: int
    perfectDragonSoulsTaken: int
    quickFirstTurrentKills: int
    quickSoloKills: int
    scuttleCrabKills: int
    soloBaronKills: int
    SWARM_DefeatAatrox: int
    SWARM_DefeatBriar: int
    SWARM_DefeatMiniBosses: int
    SWARM_EvolveWeapon: int
    SWARM_Have3Passives: int
    SWARM_KillEnemy: int
    SWARM_PickupGold: float
    SWARM_ReachLevel50: int
    SWARM_WinWith5EvolvedWeapons: int
    soloKills: int
    stealthWardsPlaced: int
    takedowns: int
    teamBaronKills: int
    teamElderDragonKills: int
    teamRiftHeraldKills: int
    unseenRecalls: int
    visionScorePerMinute: float
    wardTakedowns: int
    platformId: str
    championId: list[int]
    pickTurn: list[int]
    baron_first: bool
    baron_kills: int
    champion_first: bool
    champion_kills: int
    dragon_first: bool
    dragon_kills: int
    horde_first: bool
    horde_kills: int
    inhibitor_first: bool
    inhobitor_kills: int
    riftHerald_first: bool
    riftherald_kills: int
    tower_first: bool
    tower_kills: int
    teams_teamId: int
    teams_win: bool


class ProfileData(BaseModel):
    endOfGameResult: str
    gameDuration: float
    puuid: str
    champExperience: int
    champLevel: int
    goldPerMinute: float
    kda: float
    deaths: int
    doubleKills: int
    killingSprees: int
    largestKillingSpree: int
    largestMultiKill: int
    playerScore0: int
    playerScore1: int
    playerScore2: int
    playerScore3: int
    playerScore4: int
    playerScore5: int
    playerScore6: int
    playerScore7: int
    playerScore8: int
    playerScore9: int
    playerScore10: int
    playerScore11: int
    pentakills: int
    quadrakills: int
    timePlayed: int
    tripleKills: int
    unreal: int
    kills: int
    lane: str
    teamPosition: str


class ChampionData(BaseModel):
    championId: int
    teamPosition: str
    roles: str
    lane: str
    damageDealtToBuildings: list[int]
    damageDealtToObjectives: list[int]
    damageDealtToTurrets: list[int]
    damageSelfMitigated: list[int]
    deaths: list[int]
    inhibitorTakedowns: list[int]
    inhibitorsLost: list[int]
    itemsPurchased: list[int]
    killingSprees: list[int]
    kills: list[int]
    totalHeal: list[int]
    totalHealsOnTeammates: list[int]
    visionScore: list[int]

    currentGold: list[int]
    goldPerSecond: list[int]
    level: list[int]
    minionsKilled: list[int]
    timeEnemySpentControlled: list[int]
    totalGold: list[int]
    xp: list[int]
    magicDamageDone: list[int]       
    magicDamageDoneToChampions: list[int]        
    magicDamageTaken: list[int] 
    physicalDamageDone: list[int] 
    physicalDamageDoneToChampions: list[int] 
    physicalDamageTaken: list[int] 
    abilityPower: list[int] 
    armor: list[int] 
    armorPenPercent: list[int] 
    attackDamage: list[int] 
    attackSpeed: list[int] 
    ccReduction: list[int] 
    health: list[int] 
    healthMax: list[int] 
    healthRegen: list[int] 
    lifesteal: list[int] 
    magicPen: list[int] 
    magicPenPercent: list[int] 
    magicResist: list[int] 
    movementSpeed: list[int] 
    omniVamp: list[int] 
    power: list[int] 
    powerMax: list[int]
    magicDamageDone: list[int]	
    magicDamageDoneToChampions: list[int]	
    magicDamageTaken: list[int]	
    physicalDamageDone: list[int]	
    physicalDamageDoneToChampions: list[int]		
    physicalDamageTaken: list[int]	
    totalDamageDone: list[int]	
    totalDamageDoneToChampions: list[int]		
    totalDamageTaken: list[int]	
    trueDamageDone: list[int]	
    trueDamageDoneToChampions: list[int]		
    trueDamageTaken: list[int]	

class ItemData(BaseModel):
    itemId: list[int]
    timestamp: list[int]
    championId: int
    champLevel: int
    currentGold: list[int]
    level: list[int]
    xp: list[int]
    damageStats_totalDamageDone: list[int]
    damageStats_totalDamageTaken: list[int]
    championStats_health: list[int]
    championStats_healthMax: list[int]
    championStats_healthRegen: list[float]
    championStats_lifesteal: list[float]
    championStats_power: list[int]
    championStats_powerMax: list[int]
    championStats_armor: list[int]


class SkillData(BaseModel):
    skillslot: list[int]
    levelUpType: list[str]
    timestamp: list[int]
    level: list[int]
    championId: int
    goldPerSecond: list[int]
    damageStats_magicDamageDone: list[int]
    damageStats_physicalDamageDone: list[int]
    damageStats_totalDamageDone: list[int]
    championStats_abilityHaste: list[int]
    championStats_armor: list[int]
    championStats_attackDamage: list[int]
    championStats_attackSpeed: list[int]
    championStats_cooldownReduction: list[int]
    championStats_health: list[int]
    championStats_healthMax: list[int]
    championStats_healthRegen: list[float]
    championStats_lifesteal: list[float]
    championStats_movementSpeed: list[int]
    championStats_power: list[int]
    championStats_magicPen: list[int]


class RoleData(BaseModel):
    teamPosition: str
    lane: str
    championId: int
    kills: int
    physicalDamageDealt: int
    totalDamageDealt: int
    magicDamageDealt: int
    totalHeal: int
    totalEnemyJungleMinionsKilled: int
    totalHealsOnTeammates: int
    totalUnitsHealed: int
    wardsKilled: int
    wardsPlaced: int
    detectorWardsPlaced: int
    start_movementSpeed: int
    start_health: int
    start_healthMax: int
    start_healthRegen: float
    start_armor: int
    end_movementSpeed: int
    end_health: int
    end_healthMax: int
    end_healthRegen: float
    end_armor: int

class ChampionStats(BaseModel):
    magicDamageDone: list[int]       
    magicDamageDoneToChampions: list[int]        
    magicDamageTaken: list[int] 
    physicalDamageDone: list[int] 
    physicalDamageDoneToChampions: list[int] 
    physicalDamageTaken: list[int] 
    abilityPower: list[int] 
    armor: list[int] 
    armorPenPercent: list[int] 
    attackDamage: list[int] 
    attackSpeed: list[int] 
    ccReduction: list[int] 
    health: list[int] 
    healthMax: list[int] 
    healthRegen: list[int] 
    lifesteal: list[int] 
    magicPen: list[int] 
    magicPenPercent: list[int] 
    magicResist: list[int] 
    movementSpeed: list[int] 
    omnivamp: list[int] 
    power: list[int] 
    powerMax: list[int]
    physicalVamp: list[int]
    spellVamp: list[int]

class DamageStats(BaseModel):
    magicDamageDone: list[int]	
    magicDamageDoneToChampions: list[int]	
    magicDamageTaken: list[int]	
    physicalDamageDone: list[int]	
    physicalDamageDoneToChampions: list[int]		
    physicalDamageTaken: list[int]	
    totalDamageDone: list[int]	
    totalDamageDoneToChampions: list[int]		
    totalDamageTaken: list[int]	
    trueDamageDone: list[int]	
    trueDamageDoneToChampions: list[int]		
    trueDamageTaken: list[int]	

class Participant(BaseModel):
    currentGold: list[int]	
    goldPerSecond: list[int]	
    jungleMinionsKilled: list[int]	
    level: list[int]	
    minionsKilled: list[int]		
    participantId: int	
    timeEnemySpentControlled: list[int]		
    totalGold: list[int]	
    xp: list[int]	