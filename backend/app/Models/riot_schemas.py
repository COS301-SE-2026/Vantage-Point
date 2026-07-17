from typing import List, Any
from pydantic import BaseModel

class MapReplay(BaseModel):
    puuid: List[str]
    participant_id: List[int]
    frame_interval: int
    timestamp: list[int]
    position_x: Any
    position_y: Any


class MapSuggestData(BaseModel):
    position_x:list[int]
    position_y:list[int]
    team_position:str
    lane:str
    role:str
    timestamp:list[int]
    prev_x:list[int]
    prev_y:list[int]
    prev_prev_x:list[int]
    prev_prev_y:list[int]
    champExperience:int
    champLevel:int
    championId:int
    gameDuration:int
    deaths:int
    itemsPurchased:int
    killingSprees:int
    kills:int
    visionScore:int
    jungleMinionsKilled:list[int]
    level: Any
    minionsKilled:list[int]
    timeEnemySpentControlled:list[int]
    xp: Any
    totalDamageDone:list[int]
    totalDamageDoneToChampions:list[int]
    totalDamageTaken:list[int]
    abilityHaste:list[int]
    abilityPower:list[int]
    armor: Any
    attackDamage: Any
    attackSpeed: Any
    ccReduction:list[int]
    cooldownReduction:list[int]
    health: Any
    health_max: Any
    health_regen: Any
    lifesteal:list[int]
    movementSpeed:list[int]
    power:list[int]
    powerMax:list[int]


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
    hadAfkTeammate: int
    highestChampionDamage: int
    takedownFirst25Min: int
    teleportTakedowns: int
    thirdInhibitorDestroyedTime: int
    fistBumpTakedowns: int
    baronTakedowns: int
    bountyGold: int
    damagePerMinute: float
    deatshByEnemyChamps: int
    elderDragonKillsWithOpposingSoul: int
    elderDragonMultikill: int
    enemyJungleMonsterKills: int
    firstTurretKilled: bool
    firstTuttetKilledTime: float
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
    role: str
    lane: str
    damageDealtToBuildings: int
    damageDealtToObjectives: int
    damageDealtToTurrets: int
    damageSelfMitigated: int
    deaths: int
    inhibitorTakedowns: int
    inhibitorsLost: int
    itemsPurchased: int
    killingSprees: int
    kills: int
    totalHeal: int
    totalHealsOnTeammates: int
    visionScore: int

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
    healthRegen: list[float] 
    lifesteal: list[float] 
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
    lane: str
    champExperience: int
    champLevel: int
    championId: int
    currentGold: list[int]
    level: list[int]
    minionsKilled: list[int]
    timeEnemySpentControlled: list[int]
    totalGold: list[int]
    position_x: list[int]
    position_y: list[int]
    xp: list[int]
    totalDamageDone: list[int]
    totalDamageTaken: list[int]
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
    abilityPower: list[int]
    armor: list[int]
    armorPenPercent: list[int]
    attackDamage: list[int]
    attackSpeed: list[int]
    ccReduction: list[int]
    health: list[int]
    healthMax: list[int]
    healthRegen: list[float]
    lifesteal: list[float]
    magicPen: list[int]
    magicPenPercent: list[int]
    magicResist: list[int]
    movementSpeed: list[int]
    omnivamp: list[int]
    power: list[int]
    powerMax: list[int]
    

class SkillData(BaseModel):
    skillslot: list[int]
    levelUpType: list[str]
    timestamp: list[int]
    championId: int
    damageSelfMitigated: int
    deaths: int
    kills: int
    totalHeal: int
    level: list[int]
    timeEnemySpentControlled: list[int]
    totalGold: list[int]
    xp: list[int]
    position_x: list[int]
    position_y: list[int]
    magicDamageDone: list[int]
    physicalDamageDone: list[int]
    totalDamageDone: list[int]
    totalDamageDoneToChampions: list[int]
    totalDamageTaken: list[int]
    armor: list[int]
    attackDamage: list[int]
    attackSpeed: list[int]
    health: list[int]
    healthMax: list[int]
    movementSpeed: list[int]
    power: list[int]
    powerMax: list[int]


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
    abilityPower: list[int] 
    armor: list[int] 
    armorPenPercent: list[int] 
    attackDamage: list[int] 
    attackSpeed: list[int] 
    ccReduction: list[int] 
    health: list[int] 
    healthMax: list[int] 
    healthRegen: list[float] 
    lifesteal: list[float] 
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
    participantId: str	
    timeEnemySpentControlled: list[int]		
    totalGold: list[int]	
    xp: list[int]	