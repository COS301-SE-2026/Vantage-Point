# This file exist to refer to about that the json data possibly looks like as an object


class MetaObj:
    dataVersion = 0
    matchId = ""
    participants = [""]


class VicDamObj:
    basic = True
    magicDamage = 0
    name = ""
    participantId = 0
    physicalDamage = 0
    spellName = ""
    spellSlot = 0
    trueDamage = 0
    type = ""


class PositionObj:
    x = 0
    y = 0


class EventObj:
    timeStamp = 0
    realTimestamp = 0
    type = ""
    itemId = 0
    participantId = 0
    creatorId = 0
    wardType = ""
    levelUpType = ""
    skillSlot = 0
    killerId = 0
    level = 0
    assistingParticipantIds = [0]
    bounty = 0
    killStreakLength = 0
    position = PositionObj
    shutdownBounty = 0
    victimDamageDealt = VicDamObj
    victimDamageReceived = VicDamObj
    victimId = 0
    victimTeamfightDamageDealt = VicDamObj
    victimTeamfightDamageReceived = VicDamObj
    killType = ""
    afterId = 0
    beforeId = 0
    goldGain = 0
    multiKillLength = 0
    laneType = ""
    teamId = 0
    killerTeamId = 0
    monsterType = ""
    monsterSubTypes = ""
    name = ""
    buildingType = ""
    towerType = ""
    actualStartTime = 0
    gameId = 0
    winningTeam = 0


class ChampionStatsObj:
    abilityHaste = 0
    abilityPower = 0
    armor = 0
    armorPen = 0
    armorPenPercent = 0
    attackDamage = 0
    attackSpeed = 0
    bonusArmorPenPercent = 0
    bonusMagicPenPercent = 0
    ccReduction = 0
    cooldownReduction = 0
    health = 0
    healthMax = 0
    healthRegen = 0
    lifesteal = 0
    magicPen = 0
    MagicPenPercent = 0
    magicResist = 0
    movementSpeed = 0
    omnivamp = 0
    physicalVamp = 0
    power = 0
    powerMax = 0
    spellVamp = 0


class damageStatsObj:
    magicDamageDone = 0
    magicDamageDoneToChampions = 0
    magicDamageTaken = 0
    physicalDamageDone = 9
    physicalDamageDoneToChampions = 0
    physicalDamageTaken = 0
    totalDamageDone = 0
    totalDamageDoneToChampions = 0
    totalDamageTaken = 0
    trueDamageDone = 0
    trueDamageDoneToChampions = 0
    trueDamageTaken = 0


class playerFrameObj:
    championStats = ChampionStatsObj
    currentGold = 0
    damageStats = damageStatsObj
    goldPerSecond = 0
    jungleMinionsKilled = 0
    level = 0
    minionsKilled = 0
    participantId = 0
    position = PositionObj
    timeEnemySpentControlled = 0
    totalGold = 0
    xp = 0


class PartFramesObj:
    _1 = playerFrameObj
    _2 = playerFrameObj
    _3 = playerFrameObj
    _4 = playerFrameObj
    _5 = playerFrameObj
    _6 = playerFrameObj
    _7 = playerFrameObj
    _8 = playerFrameObj
    _9 = playerFrameObj
    _10 = playerFrameObj


class FrameObj:
    events = [EventObj]
    participantFrames = PartFramesObj
    timestamp = 0


class ParticipantObj:
    participantId = 0
    puuid = ""


class InfoObj:
    endOfGameResult = ""
    frameInterval = 0
    frames = [FrameObj]
    gameId = 0
    participants = [ParticipantObj]


class MatchObj:
    metadata = MetaObj
    info = InfoObj
