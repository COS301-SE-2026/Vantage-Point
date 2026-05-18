class MetaObj {
    public int dataVersion;
    public String matchId;
    public String[] participants;
}

class VicDamObj {
    public boolean basic;
    public int magicDamage;
    public String name;
    public int participantId;
    public int physicalDamage;
    public String spellName;
    public int spellSlot;
    public int trueDamage;
    public String type;
}

class EventObj {
    public long timestamp;
    public long realTimestamp;
    public String type;
    public int itemId;
    public int participantId;
    public int creatorId;
    public String wardType;
    public String levelUpType;
    public int skillSlot;
    public int killerId;
    public int level;
    public int[] assistingParticipantIds;
    public int bounty;
    public int killStreakLength;
    public PositionObj position;
    public int shutdownBounty;
    public VicDamObj[] victimDamageDealt;
    public VicDamObj[] victimDamageReceived;
    public int victimId;
    public VicDamObj[] victimTeamfightDamageDealt;
    public VicDamObj[] victimTeamfightDamageReceived;
    public String killType;
    public int afterId;
    public int beforeId;
    public int goldGain;
    public int multiKillLength;
    public String laneType;
    public int teamId;
    public int killerTeamId;
    public String monsterType;
    public String monsterSubType;
    public String name;
    public String buildingType;
    public String towerType;
    public int actualStartTime;
    public long gameId;
    public long winningTeam;
}

class PositionObj {
    public int x;
    public int y;
}

class championStatsObj {
    public int abilityHaste;
    public int abilityPower;
    public int armor;
    public int armorPen;
    public int armorPenPercent;
    public int attackDamage;
    public int attackSpeed;
    public int bonusArmorPenPercent;
    public int bonusMagicPenPercent;
    public int ccReduction;
    public int cooldownReduction;
    public int health;
    public int healthMax;
    public int healthRegen;
    public int lifesteal;
    public int magicPen;
    public int magicPenPercent;
    public int magicResist;
    public int movementSpeed;
    public int omnivamp;
    public int physicalVamp;
    public int power;
    public int powerMax;
    public int powerRegen;
    public int spellVamp;
}

class damageStatsObj {
    public int magicDamageDone;
    public int magicDamageDoneToChampions;
    public int magicDamageTaken;
    public int physicalDamageDone;
    public int physicalDamageDoneToChampions;
    public int physicalDamageTaken;
    public int totalDamageDone;
    public int totalDamageDoneToChampions;
    public int totalDamageTaken;
    public int trueDamageDone;
    public int trueDamageDoneToChampions;
    public int trueDamageTaken;
}

class playerFrameObj {
    public championStatsObj championStats;
    public int currentGold;
    public damageStatsObj damageStats;
    public int goldPerSecond;
    public int jungleMinionsKilled;
    public int level;
    public int minionsKilled;
    public int participantId;
    public PositionObj position;
    public int timeEnemySpentControlled;
    public int totalGold;
    public int xp;
}

class PartFramesObj {
    public playerFrameObj _1;
    public playerFrameObj _2;
    public playerFrameObj _3;
    public playerFrameObj _4;
    public playerFrameObj _5;
    public playerFrameObj _6;
    public playerFrameObj _7;
    public playerFrameObj _8;
    public playerFrameObj _9;
    public playerFrameObj _10;
}

class FrameObj {
    public EventObj[] events;
    public PartFramesObj participantFrames;
    public long timestamp;
}

class ParticipantObj {
    public int participantId;
    public String puuid;
}

class InfoObj {
    public String endOfGameResult;
    public long frameInterval;
    public FrameObj[] frames;
    public long gameId;
    public ParticipantObj[] participants;
}

public class MatchObj {
    public MetaObj metadata;
    public InfoObj info;
}
