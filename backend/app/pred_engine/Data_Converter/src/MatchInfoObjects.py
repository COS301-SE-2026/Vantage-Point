# This file exist to refer to about that the json data possibly looks like as an object

# Shared Internal Objects
########################################################


# X.metadata
class MetaObj:
    dataVersion = 0
    matchId = ""
    participants = [""]  # puuids,k can use to check match data string


# Match Timeline
#########################################################
# DATA GROUPS#

# Map replay #XX
# Map suggestion overlay
# Map timeline info (goes with map page but not on the map itself) (gets repulled through api every time)
# Profile data #XX
# Match data #XX
# General data
# XX -> goes to db


# MatchTimeObj.info.[frames].[events].victimDamageDealt
# MatchTimeObj.info.[frames].[events].victimDamageReceived
# MatchTimeObj.info.[frames].[events].victimTeamfightDamageDealt
# MatchTimeObj.info.[frames].[events].victimTeamfightDamageReceived
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


# MatchTimeObj.info.[frames].participantFrames.{all vars}.position
# MatchTimeObj.info.[frames].[events].position
class PositionObj:
    x = 0
    y = 0

    def append_pos(self):
        info = []
        info.append(self.x)
        info.append(self.y)
        return info


# MatchTimeObj.info.[frames].[events]
class EventObj:  # Map timeline info (dependent on what event happened)
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


# MatchTimeObj.info.[frames].participantFrames.{all vars}.championStats
class ChampionStatsObj:
    abilityHaste = 0
    abilityPower = 0
    armor = 0  # Map suggestion overlay
    armorPen = 0
    armorPenPercent = 0
    attackDamage = 0  # Map suggestion overlay
    attackSpeed = 0  # Map suggestion overlay
    bonusArmorPenPercent = 0
    bonusMagicPenPercent = 0
    ccReduction = 0
    cooldownReduction = 0
    health = 0  # Map suggestion overlay
    healthMax = 0  # Map suggestion overlay
    healthRegen = 0  # Map suggestion overlay
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


# MatchTimeObj.info.[frames].participantFrames.{all vars}.damageStats
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
    trueDamageDone = 0  # Map suggestion overlay
    trueDamageDoneToChampions = 0  # Map suggestion overlay
    trueDamageTaken = 0  # Map suggestion overlay


# MatchTimeObj.info.[frames].participantFrames.{all vars}
class playerFrameObj:
    championStats = ChampionStatsObj  # Map suggestion overlay
    currentGold = 0
    damageStats = damageStatsObj  # Map suggestion overlay
    goldPerSecond = 0  # Map suggestion overlay
    jungleMinionsKilled = 0
    level = 0  # Map suggestion overlay
    minionsKilled = 0
    participantId = 0
    position = PositionObj  # Map replay
    timeEnemySpentControlled = 0
    totalGold = 0
    xp = 0  # Map suggestion overlay

    def append_mapSuggest(self):
        info = []
        info.append(self.championStats.armor)
        info.append(self.championStats.attackDamage)
        info.append(self.championStats.attackSpeed)
        info.append(self.championStats.health)
        info.append(self.championStats.healthMax)
        info.append(self.championStats.healthRegen)
        info.append(self.damageStats.trueDamageDone)
        info.append(self.damageStats.trueDamageDoneToChampions)
        info.append(self.damageStats.trueDamageTaken)
        info.append(self.goldPerSecond)
        info.append(self.level)
        info.append(self.xp)
        return info

    def append_mapReplay(self):
        info = []
        info.extend(self.position.append_pos())


# MatchTimeObj.info.[frames].participantFrames
class PartFramesObj:  # Map replay takes first the info of the player themselves
    # need to modify data coming from api to have these vars saves with these names
    # they come from api as numbers
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


# MatchTimeObj.info.[frames]
class FrameObj:
    events = [EventObj]  # Map timeline info
    participantFrames = PartFramesObj  # Map replay #Map suggestion overlay
    timestamp = 0  # Map replay #Map suggestion overlay


# MatchTimeObj.info.[participants]
class MT_ParticipantObj:
    participantId = 0
    puuid = ""


# MatchTimeObj.info
class MT_InfoObj:
    endOfGameResult = ""
    frameInterval = 0  # Map replay #Map suggestion overlay
    frames = [FrameObj]  # Map replay #Map suggestion overlay
    gameId = 0
    participants = [MT_ParticipantObj]


class MatchTimeObj:
    metadata = MetaObj
    info = MT_InfoObj


#########################################################

# Match data
#########################################################


# MatchDataObj.info.[participants].perks.statPerks
class PerkStatObj:  # general data
    defence = 0
    flex = 0
    offense = 0


# MatchDataObj.info.[participants].perks.[styles].[selections]
class PerkStyleSelectObj:  # general data
    perk = 0
    var1 = 0
    var2 = 0
    var3 = 0


# MatchDataObj.info.[participants].perks.[styles]
class PerkStyleObj:  # general data
    description = ""
    selections = [PerkStyleSelectObj]
    style = 0


# MatchDataObj.info.[participants].perks
class PerkObj:  # general data
    statPerks = PerkStatObj
    styles = [PerkStyleObj]


# MatchDataObj.info.[participants].mission
class MissionObj:
    playerScore0 = 0
    playerScore1 = 0
    playerScore2 = 0
    playerScore3 = 0
    playerScore4 = 0
    playerScore5 = 0
    playerScore6 = 0
    playerScore7 = 0
    playerScore8 = 0
    playerScore9 = 0
    playerScore10 = 0
    playerScore11 = 0



# MatchDataObj.info.[participants].challenges
class ChallengesObj:  # Match data (need to sort throught this an decide importance)
    _12AssistStreakCount = 0
    baronBuffGoldAdvantageOverThreshold = 0
    controlWardTimeCoverageInRiverOrEnemyHalf = 0.0
    earliestBaron = 0 # Match data
    earliestDragonTakedown = 0 # Match data
    earliestElderDragon = 0 # Match data
    earlyLaningPhaseGoldExpAdvantage = 0
    fasterSupportQuestCompletion = 0
    fastestLegendary = 0 # Match data
    hadAfkTeammate = 0 # Match data
    highestChampionDamage = 0 # Match data
    highestCrowdControlScore = 0
    highestWardKills = 0
    junglerKillsEarlyJungle = 0
    killsOnLanersEarlyJungleAsJungler = 0
    laningPhaseGoldExpAdvantage = 0
    legendaryCount = 0
    maxCsAdvantageOnLaneOpponent = 0.0
    maxLevelLeadLaneOpponent = 0
    mostWardsDestroyedOneSweeper = 0
    mythicItemUsed = 0
    playedChampSelectPosition = 0
    soloTurretsLategame = 0
    takedownsFirst25Minutes = 0 # Match data
    teleportTakedowns = 0 # Match data
    thirdInhibitorDestroyedTime = 0 # Match data
    threeWardsOneSweeperCount = 0
    visionScoreAdvantageLaneOpponent = 0.0
    InfernalScalePickup = 0
    fistBumpParticipation = 0 # Match data #for funzies
    voidMonsterKill = 0
    abilityUses = 0
    acesBefore15Minutes = 0
    alliedJungleMonsterKills = 0.0
    baronTakedowns = 0 # Match data
    blastConeOppositeOpponentCount = 0
    bountyGold = 0 # Match data
    buffsStolen = 0
    completeSupportQuestInTime = 0
    controlWardsPlaced = 0
    damagePerMinute = 0 # Match data
    damageTakenOnTeamPercentage = 0
    dancedWithRiftHerald = 0
    deathsByEnemyChamps = 0 # Match data
    dodgeSkillShotsSmallWindow = 0
    doubleAces = 0
    dragonTakedowns = 0
    legendaryItemUsed = [0]
    effectiveHealAndShielding = 0.0
    elderDragonKillsWithOpposingSoul = 0 # Match data
    elderDragonMultikills = 0 # Match data
    enemyChampionImmobilizations = 0
    enemyJungleMonsterKills = 0.0 # Match data
    epicMonsterKillsNearEnemyJungler = 0
    epicMonsterKillsWithin30SecondsOfSpawn = 0
    epicMonsterSteals = 0
    epicMonsterStolenWithoutSmite = 0
    firstTurretKilled = 0 # Match data
    firstTurretKilledTime = 0.0 # Match data
    flawlessAces = 0
    fullTeamTakedown = 0
    gameLength = 0.0 # Match data
    getTakedownsInAllLanesEarlyJungleAsLaner = 0
    goldPerMinute = 0.0 # Match data # Profile data
    hadOpenNexus = 0
    immobilizeAndKillWithAlly = 0
    initialBuffCount = 0
    initialCrabCount = 0
    jungleCsBefore10Minutes = 0.0
    junglerTakedownsNearDamagedEpicMonster = 0
    kda = 0.0 # Match data # Profile data
    killAfterHiddenWithAlly = 0
    killedChampTookFullTeamDamageSurvived = 0
    killingSprees = 0 # Match data
    killParticipation = 0.0
    killsNearEnemyTurret = 0
    killsOnOtherLanesEarlyJungleAsLaner = 0
    killsOnRecentlyHealedByAramPack = 0
    killsUnderOwnTurret = 0
    killsWithHelpFromEpicMonster = 0
    knockEnemyIntoTeamAndKill = 0
    kTurretsDestroyedBeforePlatesFall = 0
    landSkillShotsEarlyGame = 0
    laneMinionsFirst10Minutes = 0
    lostAnInhibitor = 0 # Match data
    maxKillDeficit = 0
    mejaisFullStackInTime = 0
    moreEnemyJungleThanOpponent = 0.0
    multiKillOneSpell = 0
    multikills = 0
    multikillsAfterAggressiveFlash = 0
    multiTurretRiftHeraldCount = 0
    outerTurretExecutesBefore10Minutes = 0
    outnumberedKills = 0
    outnumberedNexusKill = 0
    perfectDragonSoulsTaken = 0 # Match data
    perfectGame = 0
    pickKillWithAlly = 0
    poroExplosions = 0
    quickCleanse = 0
    quickFirstTurret = 0 # Match data
    quickSoloKills = 0 # Match data
    riftHeraldTakedowns = 0
    saveAllyFromDeath = 0
    scuttleCrabKills = 0 # Match data
    shortestTimeToAceFromFirstTakedown = 0.0
    skillshotsDodged = 0
    skillshotsHit = 0
    snowballsHit = 0
    soloBaronKills = 0 # Match data
    SWARM_DefeatAatrox = 0 # Match data
    SWARM_DefeatBriar = 0 # Match data
    SWARM_DefeatMiniBosses = 0 # Match data
    SWARM_EvolveWeapon = 0 # Match data
    SWARM_Have3Passives = 0 # Match data
    SWARM_KillEnemy = 0 # Match data
    SWARM_PickupGold = 0.0 # Match data
    SWARM_ReachLevel50 = 0 # Match data
    SWARM_Survive15Min = 0 # Match data
    SWARM_WinWith5EvolvedWeapons = 0 # Match data
    soloKills = 0 # Match data
    stealthWardsPlaced = 0 # Match data
    survivedSingleDigitHpCount = 0
    survivedThreeImmobilizesInFight = 0
    takedownOnFirstTurret = 0
    takedowns = 0 # Match data
    takedownsAfterGainingLevelAdvantage = 0
    takedownsBeforeJungleMinionSpawn = 0
    takedownsFirstXMinutes = 0
    takedownsInAlcove = 0
    takedownsInEnemyFountain = 0
    teamBaronKills = 0 # Match data
    teamDamagePercentage = 0.0
    teamElderDragonKills = 0 # Match data
    teamRiftHeraldKills = 0 # Match data
    tookLargeDamageSurvived = 0
    turretPlatesTaken = 0
    turretsTakenWithRiftHerald = 0
    turretTakedowns = 0
    twentyMinionsIn3SecondsCount = 0
    twoWardsOneSweeperCount = 0
    unseenRecalls = 0 # Match data
    visionScorePerMinute = 0.0 # Match data
    wardsGuarded = 0
    wardTakedowns = 0 # Match data
    wardTakedownsBefore20M = 0
    def append_matchData(self):
        info = []
        info.append(self.earliestBaron)
        info.append(self.earliestDragonTakedown)
        info.append(self.earliestElderDragon)
        info.append(self.fastestLegendary)
        info.append(self.hadAfkTeammate)
        info.append(self.highestChampionDamage)
        info.append(self.takedownsFirst25Minutes)
        info.append(self.teleportTakedowns)
        info.append(self.thirdInhibitorDestroyedTime)
        info.append(self.fistBumpParticipation)
        info.append(self.baronTakedowns)
        info.append(self.bountyGold)
        info.append(self.damagePerMinute)
        info.append(self.deathsByEnemyChamps)
        info.append(self.elderDragonKillsWithOpposingSoul)
        info.append(self.elderDragonMultikills)
        info.append(self.enemyJungleMonsterKills)
        info.append(self.firstTurretKilled)
        info.append(self.firstTurretKilledTime)
        info.append(self.gameLength)
        info.append(self.goldPerMinute)
        info.append(self.kda)
        info.append(self.killingSprees)
        info.append(self.lostAnInhibitor)
        info.append(self.perfectDragonSoulsTaken)
        info.append(self.quickFirstTurret)
        info.append(self.quickSoloKills)
        info.append(self.scuttleCrabKills)
        info.append(self.soloBaronKills)
        info.append(self.SWARM_DefeatAatrox)
        info.append(self.SWARM_DefeatBriar)
        info.append(self.SWARM_DefeatMiniBosses)
        info.append(self.SWARM_EvolveWeapon)
        info.append(self.SWARM_Have3Passives)
        info.append(self.SWARM_KillEnemy)
        info.append(self.SWARM_PickupGold)
        info.append(self.SWARM_ReachLevel50)
        info.append(self.SWARM_WinWith5EvolvedWeapons)
        info.append(self.soloKills)
        info.append(self.stealthWardsPlaced)
        info.append(self.takedowns)
        info.append(self.teamBaronKills)
        info.append(self.teamElderDragonKills)
        info.append(self.teamRiftHeraldKills)
        info.append(self.unseenRecalls)
        info.append(self.visionScorePerMinute)
        info.append(self.wardTakedowns)
        return info


# MatchDataObj.info.[participants]
class M_ParticipantObj:
    allInPings = 0
    assistMePings = 0
    assists = 0
    baronKills = 0
    bountyLevel = 0
    champExperience = 0  # Profile data #Match data
    champLevel = 0  # Profile data #Match data
    championId = 0
    championName = ""  # Match data
    commandPings = 0
    championTransform = 0
    consumablesPurchased = 0
    challenges = ChallengesObj  # Profile data # Match data
    damageDealtToBuildings = 0
    damageDealtToBjectives = 0
    damageDealtToTurrets = 0
    damageSelfMitigated = 0
    deaths = 0  # Profile data
    detectorWardsPlaced = 0
    doubleKills = 0  # Profile data
    dragonKills = 0
    eligibleForProgression = True
    enemyMissingPings = 0
    enemyVisionPings = 0
    firstBloodAssist = True  # Match data
    firstBloodKill = True  # Match data
    firstTowerAssist = True  # Match data
    firstTowerKill = True  # Match data
    gameEndedInEarlySurrender = True  # Match data
    gameEndedInSurrender = True  # Match data
    holdPings = 0
    getBackPings = 0
    goldEarned = 0  # Match data
    goldSpent = 0
    individualPosition = ""  # recommended to use teamPosistion rather
    inhibitorKills = 0
    inhibitorTakedowns = 0
    inhibitorsLost = 0
    item0 = 0
    item1 = 0
    item2 = 0
    item3 = 0
    item4 = 0
    item5 = 0
    item6 = 0
    itemsPurchased = 0  # Match data
    killingSprees = 0  # Profile data
    kills = 0
    lane = ""  # Match data
    largestCriticalStrike = 0
    largestKillingSpree = 0  # Profile data
    largestMultiKill = 0  # Profile data
    logestTimeSpentLiving = 0
    magicDamageDealt = 0
    magicDamageDealtToChampions = 0
    magicDamageTaken = 0
    mission = MissionObj  # Match data
    neutralMinionsKilled = 0
    needVisionPings = 0
    nexusKills = 0
    nexusTakedowns = 0
    nexusLost = 0
    objectivesStolen = 0
    objectivesStolenAssists = 0
    onMyWayPings = 0
    participantId = 0
    playerScore0 = 0  # Profile data
    playerScore1 = 0  # Profile data
    playerScore2 = 0  # Profile data
    playerScore3 = 0  # Profile data
    playerScore4 = 0  # Profile data
    playerScore5 = 0  # Profile data
    playerScore6 = 0  # Profile data
    playerScore7 = 0  # Profile data
    playerScore8 = 0  # Profile data
    playerScore9 = 0  # Profile data
    playerScore10 = 0  # Profile data
    playerScore11 = 0  # Profile data
    pentakills = 0  # Profile data
    perks = PerkObj
    physicalDamageDealt = 0
    physicalDamageDealtToChampions = 0
    physicalDamageTaken = 0
    placement = 0
    playerAugment1 = 0
    playerAugment2 = 0
    playerAugment3 = 0
    playerAugment4 = 0
    playerSubteamId = 0
    pushPings = 0
    profileIcon = 0
    puuid = ""  # Profile data
    quadrakills = 0  # Profile data
    riotIdGameName = ""  # Profile data
    riodItTagline = ""  # Profile data
    role = ""
    sightWardsBoughtInGame = 0
    spell1Casts = 0
    spell2Casts = 0
    spell3Casts = 0
    spell4Casts = 0
    subteamPlacement = 0
    summoner1Casts = 0
    summoner1Id = 0
    summoner2Casts = 0
    summoner2Id = 0
    summonerId = 0
    summonerLevel = 0
    summonerName = ""
    teamEarlySurrender = ""  # Match data
    teamId = 0  # Match data
    teamPosition = ""  # Match data
    timeCCingOthers = 0
    timePlayed = 0  # Profile data
    totalAllyJongleMinionsKilled = 0
    totalDamageDealt = 0
    totalDamageDealtToChampions = 0
    totalDamageShieldedOnTeammates = 0
    totalDamageTaken = 0
    totalEnemyJungleMinionsKilled = 0
    totalHeal = 0
    totalHealsOnTeammates = 0
    totalMinionsKilled = 0
    totalTimeCCDealt = 0
    totolTimeSpentDead = 0
    totalUnitsHealed = 0
    tripleKills = 0  # Profile data
    trueDamageDealt = 0
    trueDamageDealtToChampions = 0
    trueDamageTaken = 0
    turretKills = 0
    turretTakedowns = 0
    turretsLost = 0
    unrealKills = 0  # Profile data
    visionScore = 0  # Match data
    visionClearedPings = 0
    visionWardsBoughtInGame = 0
    wardsKilled = 0
    wardsPlaced = 0
    win = True

    def append_matchData(self):
        info = []
        info.append(self.champExperience)
        info.append(self.champLevel)
        info.append(self.championName)
        info.extend(self.challenges.append_matchData())
        info.append(self.firstBloodAssist)
        info.append(self.firstBloodKill)
        info.append(self.firstTowerAssist)
        info.append(self.firstTowerKill)
        info.append(self.gameEndedInEarlySurrender)
        info.append(self.gameEndedInSurrender)
        info.append(self.goldEarned)
        info.append(self.itemsPurchased)
        info.append(self.lane)
        info.append(self.mission.playerScore0)
        info.append(self.mission.playerScore1)
        info.append(self.mission.playerScore2)
        info.append(self.mission.playerScore3)
        info.append(self.mission.playerScore4)
        info.append(self.mission.playerScore5)
        info.append(self.mission.playerScore6)
        info.append(self.mission.playerScore7)
        info.append(self.mission.playerScore8)
        info.append(self.mission.playerScore9)
        info.append(self.mission.playerScore10)
        info.append(self.mission.playerScore11)
        info.append(self.teamEarlySurrender)
        info.append(self.teamId)
        info.append(self.teamPosition)
        info.append(self.visionScore)
        return info

# MatchDataObj.info.[teams].[bans]
class BanObj:  # Match data
    championId = 0
    pickTurn = 0


# MatchDataObj.info.[teams].objectives.{all variables}
class ObjectiveObj:  # Match data
    first = True
    kills = 0


# MatchDataObj.info.[teams].objectives
class ObjectiveMultiObj:  # Match data
    baron = ObjectiveObj
    champion = ObjectiveObj
    dragon = ObjectiveObj
    horde = ObjectiveObj
    inhibitor = ObjectiveObj
    riftHerald = ObjectiveObj
    tower = ObjectiveObj


# MatchDataObj.info.[teams]
class TeamObj:  # Match data
    bans = [BanObj]
    objectives = ObjectiveMultiObj
    teamId = 0
    win = True
    def append_matchData(self):
        info = []
        for i in self.bans:
            info.append(i.championId)
            info.append(i.pickTurn)
        for i in self.objectives:
            info.append(i.baron.first)
            info.append(i.baron.kills)
            info.append(i.champion.first)
            info.append(i.champion.kills)
            info.append(i.dragon.kills)
            info.append(i.dragon.kills)
            info.append(i.horde.first)
            info.append(i.horde.kills)
            info.append(i.inhibitor.first)
            info.append(i.inhibitor.kills)
            info.append(i.riftHerald.first)
            info.append(i.riftHerald.kills)
            info.append(i.tower.first)
            info.append(i.tower.kills)
        info.append(self.teamId)
        info.append(self.win)
        return info


# MatchDataObj.info
class M_InfoObj:
    endOfGameResult = ""  # Profile data #Match data #Map suggestion overlay
    gameCreation = 0
    gameDuration = 0  # Profile data #Match data
    gameEndTimeStamp = 0  
    gameId = 0
    gameMode = ""  # Match data
    gameName = ""  # Match data
    gameStartTimestamp = 0 
    gameType = ""
    gameVersion = ""
    mapId = 0  # Match data
    participants = [M_ParticipantObj]  # Match data
    platformId = ""  # Match data
    queueId = 0
    teams = [TeamObj]  # Match data
    tournamentCode = ""


class MatchDataObj:
    metadata = MetaObj
    info = M_InfoObj


#########################################################
