"""Seed payloads for profile achievements and featured-game banners."""

from dataclasses import dataclass


@dataclass(frozen=True)
class SeedAchievementDefinition:
    id: str
    label: str
    description: str
    source_field: str


@dataclass(frozen=True)
class SeedUserAchievement:
    achievement_id: str
    count: int


@dataclass(frozen=True)
class SeedFeaturedGame:
    sort_order: int
    game_name: str
    cover_image_key: str
    card_image_key: str | None
    efficiency_score: int
    time_spent_seconds: int
    wins: int
    losses: int
    average_kda: float


PROFILE_MATCHES_SAMPLED = 20

SEED_ACHIEVEMENT_DEFINITIONS: list[SeedAchievementDefinition] = [
    SeedAchievementDefinition(
        "triple-kill",
        "Triple",
        "Triple kills across sampled matches",
        "challenges.tripleKills",
    ),
    SeedAchievementDefinition(
        "first-blood",
        "First Blood",
        "First blood kills",
        "challenges.firstBloodKill",
    ),
    SeedAchievementDefinition(
        "killing-spree",
        "Spree",
        "Killing sprees of 3+",
        "challenges.killingSprees",
    ),
    SeedAchievementDefinition(
        "high-kp",
        "Team Fight",
        "Matches with 70%+ kill participation",
        "challenges.killParticipation",
    ),
    SeedAchievementDefinition(
        "vision",
        "Ward King",
        "Top vision score on team",
        "challenges.visionScorePerMinute",
    ),
    SeedAchievementDefinition(
        "damage",
        "Carry",
        "Highest damage to champions on team",
        "challenges.teamDamagePercentage",
    ),
    SeedAchievementDefinition(
        "turrets",
        "Siege",
        "Turret takedowns",
        "challenges.turretTakedowns",
    ),
]

SEED_USER_ACHIEVEMENTS: list[SeedUserAchievement] = [
    SeedUserAchievement("triple-kill", 4),
    SeedUserAchievement("first-blood", 3),
    SeedUserAchievement("killing-spree", 12),
    SeedUserAchievement("high-kp", 9),
    SeedUserAchievement("vision", 6),
    SeedUserAchievement("damage", 7),
    SeedUserAchievement("turrets", 18),
]

# 1:04:34:23 and 0:42:18:05 (D:HH:MM:SS)
SEED_FEATURED_GAMES: list[SeedFeaturedGame] = [
    SeedFeaturedGame(
        sort_order=0,
        game_name="League Of Legends",
        cover_image_key="league_wild_rift_cover",
        card_image_key="league_wild_rift_card",
        efficiency_score=115,
        time_spent_seconds=1 * 86400 + 4 * 3600 + 34 * 60 + 23,
        wins=13,
        losses=7,
        average_kda=3.8,
    ),
    SeedFeaturedGame(
        sort_order=1,
        game_name="League Of Legends",
        cover_image_key="league_wild_rift_cover",
        card_image_key="league_wild_rift_card",
        efficiency_score=98,
        time_spent_seconds=42 * 3600 + 18 * 60 + 5,
        wins=7,
        losses=5,
        average_kda=3.2,
    ),
]
