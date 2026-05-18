public class MetaObj {
    int dataVersion;
    String matchId;
    String[] participants;
}

public class EventObj {
    long timestamp;
    long realtimestamp;
    String type;
}

public class PositionObj {
    int x;
    int y;
}

public class championStatsObj {
    int abilityHaste;
    int abilityPower;
    int armor;
    int armorPen;
    int armorPenPercent;
    int attackDamage;
    int attackSpeed;
    int bonusArmorPenPercent;
    int bonusMagicPenPercent;
    int ccReduction;
    int cooldownReduction;
    int health;
    int healthMax;
    int healthRegen;
    int lifesteal;
    int magicPen;
    int magicPenPercent;
    int magicResist;
    int movementSpeed;
    int omnivamp;
    int physicalVamp;
    int power;
    int powerMax;
    int powerRegen;
    int spellVamp;
}

public class damageStatsObj {
    int magicDamageDone;
    int magicDamageDoneToChampions;
    int magicDamageTaken;
    int physicalDamageDone;
    int physicalDamageDoneToChampions;
    int physicalDamageTaken;
    int totalDamageDone;
    int totalDamageDoneToChampions;
    int totalDamageTaken;
    int trueDamageDone;
    int trueDamageDoneToChampions;
    int trueDamageTaken;
}

public class playerFrameObj {
    championStatsObj championStats;
    int currentGold;
    damageStatsObj damageStats;
    int goldPerSecond;
    int jungleMinionsKilled;
    int level;
    int minionsKilled;
    int participantId;
    PositionObj position;
    int timeEnemySpentControlled;
    int totalGold;
    int xp;
}

public class PartFramesObj {
    playerFrameObj 1;
    playerFrameObj 2;
    playerFrameObj 3;
    playerFrameObj 4;
    playerFrameObj 5;
    playerFrameObj 6;
    playerFrameObj 7;
    playerFrameObj 8;
    playerFrameObj 9;
    playerFrameObj 10;
}

public class FrameObj {
    EventObj[] events;
    PartFramesObj participantFrames
    long timestamp;
}

public class InfoObj {
    String endofGameResult;
    int frameInterval;
    FrameObj[] frames;
}

public class MatchObj {
    MetaObj metadata;
    InfoObj info;
}
