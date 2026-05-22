"""Seed payloads for dev match history and detail scoreboards."""

import json
from dataclasses import dataclass
from datetime import date
from typing import Any

VIEWER_PUUID = "seed-viewer-puuid"
VIEWER_RIOT_ID = "You#EUW"

GAME_VERSION = "14.24.1"
QUEUE_ID = 420
MAP_ID = 11

POSITION_ORDER = ("TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY")

_PLAYED_EPOCH = {
    "2025-04-19": 1_745_107_200_000,
    "2025-04-18": 1_745_020_800_000,
}

_MATCH_EPOCH_OFFSET: dict[str, int] = {
    "EUW1_700000001": 0,
    "EUW1_700000002": 1,
    "EUW1_700000003": 2,
    "EUW1_700000004": 3,
    "EUW1_700000005": 4,
    "EUW1_700000006": 5,
    "EUW1_700000007": 6,
    "EUW1_700000008": 7,
}

CHAMPION_ID_TO_NAME: dict[int, str] = {
    51: "Caitlyn",
    64: "Lee Sin",
    86: "Garen",
    99: "Lux",
    103: "Ahri",
    122: "Darius",
    134: "Syndra",
    157: "Yasuo",
    222: "Jinx",
    234: "Viego",
    238: "Zed",
    412: "Thresh",
    89: "Leona",
    54: "Malphite",
    111: "Nautilus",
    267: "Nami",
    21: "Miss Fortune",
    777: "Yone",
}

ITEM_BUILDS: dict[str, list[int]] = {
    "adc": [3031, 3006, 3046, 3035, 3036, 0, 3363],
    "ap": [3089, 3020, 3135, 3157, 0, 0, 3364],
    "bruiser": [3078, 3053, 6333, 3065, 0, 0, 3340],
    "tank": [3068, 3075, 3742, 3111, 0, 0, 3340],
    "jungle": [6692, 3153, 3044, 3814, 0, 0, 3364],
    "support": [3190, 3107, 3222, 2055, 3869, 0, 3364],
}

SPELLS_DEFAULT: tuple[int, ...] = (4, 14)
SPELLS_JUNGLE: tuple[int, ...] = (4, 11)


@dataclass(frozen=True)
class SeedMatchRow:
    match_id: str
    game_duration: int
    played_on: date


@dataclass(frozen=True)
class SeedViewerParticipant:
    match_id: str
    champion_id: int
    win: bool
    kills: int
    deaths: int
    assists: int
    cs: int
    individual_position: str
    team_id: int
    gold_earned: int
    damage_to_champions: int
    vision_score: int
    kill_participation: float


@dataclass(frozen=True)
class BotSlot:
    champion_id: int
    position: str
    kills: int
    deaths: int
    assists: int
    cs: int
    gold_earned: int
    damage_to_champions: int
    vision_score: int
    item_key: str = "bruiser"
    summoner_spells: tuple[int, ...] = SPELLS_DEFAULT


@dataclass(frozen=True)
class MatchBotRoster:
    allies: tuple[BotSlot, BotSlot, BotSlot, BotSlot]
    enemies: tuple[BotSlot, BotSlot, BotSlot, BotSlot, BotSlot]
    ally_bans: tuple[int, ...]
    enemy_bans: tuple[int, ...]


def _bot(
    champion_id: int,
    position: str,
    kills: int,
    deaths: int,
    assists: int,
    cs: int,
    gold: int,
    damage: int,
    vision: int = 25,
    item_key: str = "bruiser",
    spells: tuple[int, ...] = SPELLS_DEFAULT,
) -> BotSlot:
    return BotSlot(
        champion_id=champion_id,
        position=position,
        kills=kills,
        deaths=deaths,
        assists=assists,
        cs=cs,
        gold_earned=gold,
        damage_to_champions=damage,
        vision_score=vision,
        item_key=item_key,
        summoner_spells=spells,
    )


# Four ally bots + five enemies per match (viewer fills the 5th ally slot).
SEED_MATCH_BOT_ROSTERS: dict[str, MatchBotRoster] = {
    "EUW1_700000001": MatchBotRoster(
        allies=(
            _bot(122, "TOP", 2, 9, 3, 142, 9800, 11200, 22, "tank"),
            _bot(234, "JUNGLE", 5, 7, 8, 118, 9200, 12800, 38, "jungle", SPELLS_JUNGLE),
            _bot(103, "MIDDLE", 7, 6, 4, 188, 10800, 19500, 28, "ap"),
            _bot(412, "UTILITY", 0, 9, 16, 24, 7600, 4200, 72, "support"),
        ),
        enemies=(
            _bot(86, "TOP", 6, 3, 5, 176, 11200, 14800, 24, "bruiser"),
            _bot(
                64, "JUNGLE", 3, 4, 14, 128, 10100, 13200, 42, "jungle", SPELLS_JUNGLE
            ),
            _bot(134, "MIDDLE", 9, 4, 6, 201, 11800, 21000, 30, "ap"),
            _bot(51, "BOTTOM", 10, 5, 4, 232, 13200, 24500, 26, "adc"),
            _bot(99, "UTILITY", 1, 6, 19, 30, 7800, 5100, 68, "support"),
        ),
        ally_bans=(157, 64, 238, 555, 89),
        enemy_bans=(222, 51, 134, 777, 360),
    ),
    "EUW1_700000002": MatchBotRoster(
        allies=(
            _bot(86, "TOP", 4, 2, 7, 184, 10900, 16200, 22, "bruiser"),
            _bot(
                64, "JUNGLE", 6, 4, 11, 134, 10400, 13800, 44, "jungle", SPELLS_JUNGLE
            ),
            _bot(222, "BOTTOM", 9, 3, 5, 228, 12500, 23800, 24, "adc"),
            _bot(89, "UTILITY", 1, 5, 20, 28, 8200, 4800, 76, "support"),
        ),
        enemies=(
            _bot(122, "TOP", 5, 6, 2, 158, 10200, 14500, 20, "bruiser"),
            _bot(234, "JUNGLE", 4, 8, 6, 112, 9400, 12100, 35, "jungle", SPELLS_JUNGLE),
            _bot(134, "MIDDLE", 6, 5, 8, 192, 11100, 18800, 27, "ap"),
            _bot(51, "BOTTOM", 7, 6, 3, 205, 11600, 20100, 25, "adc"),
            _bot(267, "UTILITY", 2, 7, 12, 32, 7400, 3900, 62, "support"),
        ),
        ally_bans=(157, 238, 555, 360, 89),
        enemy_bans=(103, 222, 64, 777, 134),
    ),
    "EUW1_700000003": MatchBotRoster(
        allies=(
            _bot(64, "JUNGLE", 7, 3, 9, 148, 10800, 15200, 46, "jungle", SPELLS_JUNGLE),
            _bot(103, "MIDDLE", 6, 4, 10, 198, 11400, 20500, 32, "ap"),
            _bot(222, "BOTTOM", 11, 2, 6, 242, 13800, 25200, 28, "adc"),
            _bot(412, "UTILITY", 2, 4, 22, 36, 8600, 5200, 82, "support"),
        ),
        enemies=(
            _bot(54, "TOP", 3, 8, 4, 142, 9800, 11800, 18, "tank"),
            _bot(234, "JUNGLE", 5, 7, 5, 108, 9600, 12500, 36, "jungle", SPELLS_JUNGLE),
            _bot(134, "MIDDLE", 8, 6, 4, 178, 10500, 17200, 26, "ap"),
            _bot(21, "BOTTOM", 9, 5, 2, 198, 11200, 19800, 22, "adc"),
            _bot(99, "UTILITY", 0, 9, 11, 26, 7200, 3600, 58, "support"),
        ),
        ally_bans=(122, 51, 238, 777, 267),
        enemy_bans=(86, 222, 64, 555, 134),
    ),
    "EUW1_700000004": MatchBotRoster(
        allies=(
            _bot(86, "TOP", 3, 6, 4, 168, 10100, 13800, 20, "bruiser"),
            _bot(103, "MIDDLE", 5, 7, 9, 176, 10600, 17800, 29, "ap"),
            _bot(222, "BOTTOM", 8, 6, 2, 198, 11800, 21200, 23, "adc"),
            _bot(111, "UTILITY", 1, 8, 14, 22, 7400, 4100, 70, "support"),
        ),
        enemies=(
            _bot(122, "TOP", 7, 2, 3, 172, 11400, 16800, 24, "bruiser"),
            _bot(
                234, "JUNGLE", 9, 4, 5, 124, 11200, 14200, 40, "jungle", SPELLS_JUNGLE
            ),
            _bot(134, "MIDDLE", 10, 3, 8, 188, 12000, 22400, 31, "ap"),
            _bot(51, "BOTTOM", 12, 2, 4, 218, 12800, 24800, 27, "adc"),
            _bot(267, "UTILITY", 2, 5, 16, 34, 8000, 5400, 74, "support"),
        ),
        ally_bans=(157, 51, 777, 360, 89),
        enemy_bans=(64, 222, 238, 555, 134),
    ),
    "EUW1_700000005": MatchBotRoster(
        allies=(
            _bot(122, "TOP", 4, 5, 2, 152, 10400, 14200, 21, "bruiser"),
            _bot(234, "JUNGLE", 6, 6, 7, 116, 9800, 13100, 39, "jungle", SPELLS_JUNGLE),
            _bot(134, "MIDDLE", 8, 4, 9, 194, 11600, 20800, 30, "ap"),
            _bot(267, "UTILITY", 2, 6, 17, 30, 7900, 4600, 71, "support"),
        ),
        enemies=(
            _bot(86, "TOP", 5, 4, 6, 180, 11000, 15500, 23, "bruiser"),
            _bot(
                64, "JUNGLE", 2, 5, 13, 136, 10200, 12800, 41, "jungle", SPELLS_JUNGLE
            ),
            _bot(103, "MIDDLE", 7, 5, 5, 202, 11300, 19200, 28, "ap"),
            _bot(222, "BOTTOM", 6, 8, 4, 186, 10800, 18500, 24, "adc"),
            _bot(412, "UTILITY", 1, 7, 15, 28, 7600, 4300, 66, "support"),
        ),
        ally_bans=(222, 157, 64, 89, 777),
        enemy_bans=(51, 103, 238, 555, 360),
    ),
    "EUW1_700000006": MatchBotRoster(
        allies=(
            _bot(234, "JUNGLE", 4, 8, 4, 108, 9200, 11800, 37, "jungle", SPELLS_JUNGLE),
            _bot(134, "MIDDLE", 6, 6, 3, 168, 10400, 17500, 27, "ap"),
            _bot(51, "BOTTOM", 5, 7, 1, 174, 10000, 16800, 22, "adc"),
            _bot(99, "UTILITY", 0, 10, 9, 22, 7100, 3800, 64, "support"),
        ),
        enemies=(
            _bot(86, "TOP", 8, 2, 4, 188, 11800, 17200, 25, "bruiser"),
            _bot(
                64, "JUNGLE", 7, 3, 10, 140, 11000, 14500, 43, "jungle", SPELLS_JUNGLE
            ),
            _bot(103, "MIDDLE", 11, 2, 6, 212, 12200, 23200, 33, "ap"),
            _bot(222, "BOTTOM", 9, 4, 5, 226, 12600, 24100, 26, "adc"),
            _bot(412, "UTILITY", 2, 5, 18, 34, 8400, 4900, 77, "support"),
        ),
        ally_bans=(86, 103, 64, 267, 777),
        enemy_bans=(122, 222, 51, 555, 134),
    ),
    "EUW1_700000007": MatchBotRoster(
        allies=(
            _bot(86, "TOP", 6, 3, 5, 192, 11500, 16800, 24, "bruiser"),
            _bot(
                64, "JUNGLE", 5, 4, 12, 138, 10700, 14100, 45, "jungle", SPELLS_JUNGLE
            ),
            _bot(222, "BOTTOM", 10, 2, 8, 236, 13200, 24600, 27, "adc"),
            _bot(89, "UTILITY", 1, 4, 21, 32, 8800, 5000, 80, "support"),
        ),
        enemies=(
            _bot(122, "TOP", 4, 7, 2, 148, 10100, 13200, 19, "bruiser"),
            _bot(234, "JUNGLE", 6, 8, 4, 114, 9500, 12200, 38, "jungle", SPELLS_JUNGLE),
            _bot(103, "MIDDLE", 5, 6, 7, 184, 10800, 18100, 29, "ap"),
            _bot(51, "BOTTOM", 8, 5, 3, 208, 11400, 20500, 25, "adc"),
            _bot(111, "UTILITY", 2, 8, 11, 26, 7300, 3700, 61, "support"),
        ),
        ally_bans=(134, 157, 238, 360, 89),
        enemy_bans=(103, 222, 64, 777, 51),
    ),
    "EUW1_700000008": MatchBotRoster(
        allies=(
            _bot(122, "TOP", 3, 8, 1, 138, 9600, 12500, 20, "bruiser"),
            _bot(234, "JUNGLE", 5, 9, 6, 102, 9000, 11200, 36, "jungle", SPELLS_JUNGLE),
            _bot(103, "MIDDLE", 4, 7, 5, 162, 9800, 15800, 26, "ap"),
            _bot(51, "BOTTOM", 7, 5, 3, 188, 10400, 19200, 23, "adc"),
        ),
        enemies=(
            _bot(86, "TOP", 7, 2, 6, 182, 11200, 15900, 22, "bruiser"),
            _bot(64, "JUNGLE", 8, 3, 9, 146, 11400, 15200, 44, "jungle", SPELLS_JUNGLE),
            _bot(134, "MIDDLE", 10, 1, 8, 198, 11800, 21800, 30, "ap"),
            _bot(222, "BOTTOM", 11, 2, 4, 224, 12800, 25200, 25, "adc"),
            _bot(267, "UTILITY", 2, 4, 17, 36, 8200, 4800, 69, "support"),
        ),
        ally_bans=(412, 157, 64, 555, 777),
        enemy_bans=(103, 222, 51, 89, 134),
    ),
}

_VIEWER_BY_MATCH: dict[str, SeedViewerParticipant] = {
    v.match_id: v for v in []  # filled after SEED_VIEWER_PARTICIPANTS
}


def _champion_name(champion_id: int) -> str:
    return CHAMPION_ID_TO_NAME.get(champion_id, f"Champion{champion_id}")


def _participant_from_bot(bot: BotSlot, team_win: bool) -> dict[str, Any]:
    name = _champion_name(bot.champion_id)
    return {
        "puuid": f"puuid-{bot.champion_id}-{bot.position}",
        "riot_id": f"{name.replace(' ', '')}Bot#EUW",
        "champion_id": bot.champion_id,
        "champion_name": name,
        "position": bot.position,
        "win": team_win,
        "kills": bot.kills,
        "deaths": bot.deaths,
        "assists": bot.assists,
        "cs": bot.cs,
        "gold_earned": bot.gold_earned,
        "damage_to_champions": bot.damage_to_champions,
        "vision_score": bot.vision_score,
        "items": ITEM_BUILDS.get(bot.item_key, ITEM_BUILDS["bruiser"]),
        "summoner_spells": list(bot.summoner_spells),
        "is_viewer": False,
    }


def _participant_from_viewer(
    viewer: SeedViewerParticipant, team_win: bool
) -> dict[str, Any]:
    name = _champion_name(viewer.champion_id)
    item_key = {
        "BOTTOM": "adc",
        "MIDDLE": "ap",
        "TOP": "bruiser",
        "JUNGLE": "jungle",
        "UTILITY": "support",
    }.get(viewer.individual_position, "bruiser")
    spells = SPELLS_JUNGLE if viewer.individual_position == "JUNGLE" else SPELLS_DEFAULT
    return {
        "puuid": VIEWER_PUUID,
        "riot_id": VIEWER_RIOT_ID,
        "champion_id": viewer.champion_id,
        "champion_name": name,
        "position": viewer.individual_position,
        "win": team_win,
        "kills": viewer.kills,
        "deaths": viewer.deaths,
        "assists": viewer.assists,
        "cs": viewer.cs,
        "gold_earned": viewer.gold_earned,
        "damage_to_champions": viewer.damage_to_champions,
        "vision_score": viewer.vision_score,
        "items": ITEM_BUILDS[item_key],
        "summoner_spells": list(spells),
        "is_viewer": True,
    }


def _slot_for_position(slots: tuple[BotSlot, ...], position: str) -> BotSlot | None:
    for slot in slots:
        if slot.position == position:
            return slot
    return None


def _build_team_participants(
    viewer: SeedViewerParticipant,
    bots: tuple[BotSlot, ...],
    team_id: int,
    team_win: bool,
) -> list[dict[str, Any]]:
    participants: list[dict[str, Any]] = []
    for position in POSITION_ORDER:
        if team_id == viewer.team_id and position == viewer.individual_position:
            participants.append(_participant_from_viewer(viewer, team_win))
        else:
            bot = _slot_for_position(bots, position)
            if bot:
                participants.append(_participant_from_bot(bot, team_win))
    return participants


def _build_teams_for_match(
    viewer: SeedViewerParticipant, roster: MatchBotRoster
) -> list[dict[str, Any]]:
    ally_win = viewer.win
    enemy_win = not ally_win

    blue_win = ally_win if viewer.team_id == 100 else enemy_win
    red_win = ally_win if viewer.team_id == 200 else enemy_win

    if viewer.team_id == 100:
        blue_bots, red_bots = roster.allies, roster.enemies
        blue_bans, red_bans = roster.ally_bans, roster.enemy_bans
    else:
        blue_bots, red_bots = roster.enemies, roster.allies
        blue_bans, red_bans = roster.enemy_bans, roster.ally_bans

    blue = {
        "team_id": 100,
        "win": blue_win,
        "bans": list(blue_bans),
        "objectives": {
            "baron": 1 if blue_win else 0,
            "dragon": 3 if blue_win else 2,
            "rift_herald": 1 if blue_win else 0,
            "tower": 9 if blue_win else 4,
            "inhibitor": 2 if blue_win else 0,
        },
        "participants": _build_team_participants(viewer, blue_bots, 100, blue_win),
    }

    red = {
        "team_id": 200,
        "win": red_win,
        "bans": list(red_bans),
        "objectives": {
            "baron": 1 if red_win else 0,
            "dragon": 3 if red_win else 2,
            "rift_herald": 1 if red_win else 0,
            "tower": 9 if red_win else 4,
            "inhibitor": 2 if red_win else 0,
        },
        "participants": _build_team_participants(viewer, red_bots, 200, red_win),
    }

    return [blue, red]


def build_detail_json(match_id: str) -> str:
    viewer = _VIEWER_BY_MATCH[match_id]
    roster = SEED_MATCH_BOT_ROSTERS[match_id]
    teams = _build_teams_for_match(viewer, roster)
    return json.dumps({"teams": teams, "match_id": match_id})


SEED_MATCHES: list[SeedMatchRow] = [
    SeedMatchRow("EUW1_700000001", 25 * 60, date(2025, 4, 19)),
    SeedMatchRow("EUW1_700000002", 30 * 60, date(2025, 4, 19)),
    SeedMatchRow("EUW1_700000003", 40 * 60, date(2025, 4, 19)),
    SeedMatchRow("EUW1_700000004", 20 * 60, date(2025, 4, 19)),
    SeedMatchRow("EUW1_700000005", 28 * 60, date(2025, 4, 19)),
    SeedMatchRow("EUW1_700000006", 22 * 60, date(2025, 4, 19)),
    SeedMatchRow("EUW1_700000007", 35 * 60, date(2025, 4, 18)),
    SeedMatchRow("EUW1_700000008", 18 * 60, date(2025, 4, 18)),
]

SEED_VIEWER_PARTICIPANTS: list[SeedViewerParticipant] = [
    SeedViewerParticipant(
        "EUW1_700000001",
        222,
        False,
        4,
        8,
        6,
        165,
        "BOTTOM",
        200,
        10_500,
        16_000,
        22,
        0.55,
    ),
    SeedViewerParticipant(
        "EUW1_700000002",
        103,
        True,
        8,
        3,
        6,
        210,
        "MIDDLE",
        100,
        12_000,
        22_000,
        35,
        0.72,
    ),
    SeedViewerParticipant(
        "EUW1_700000003", 86, True, 5, 2, 4, 198, "TOP", 100, 11_500, 19_000, 28, 0.65
    ),
    SeedViewerParticipant(
        "EUW1_700000004",
        64,
        False,
        4,
        5,
        12,
        142,
        "JUNGLE",
        100,
        9_800,
        14_000,
        40,
        0.80,
    ),
    SeedViewerParticipant(
        "EUW1_700000005",
        51,
        True,
        11,
        2,
        5,
        224,
        "BOTTOM",
        200,
        14_000,
        28_000,
        30,
        0.70,
    ),
    SeedViewerParticipant(
        "EUW1_700000006", 122, False, 3, 7, 2, 156, "TOP", 200, 9_000, 15_000, 18, 0.45
    ),
    SeedViewerParticipant(
        "EUW1_700000007",
        134,
        True,
        9,
        4,
        7,
        205,
        "MIDDLE",
        100,
        13_500,
        25_000,
        32,
        0.68,
    ),
    SeedViewerParticipant(
        "EUW1_700000008",
        412,
        False,
        1,
        6,
        14,
        28,
        "UTILITY",
        200,
        7_500,
        8_000,
        78,
        0.85,
    ),
]

_VIEWER_BY_MATCH.update({v.match_id: v for v in SEED_VIEWER_PARTICIPANTS})


def game_creation_for(played_on: date, match_id: str | None = None) -> int:
    key = played_on.isoformat()
    base = _PLAYED_EPOCH.get(key, _PLAYED_EPOCH["2025-04-19"])
    if match_id and match_id in _MATCH_EPOCH_OFFSET:
        return base + _MATCH_EPOCH_OFFSET[match_id] * 60_000
    return base
