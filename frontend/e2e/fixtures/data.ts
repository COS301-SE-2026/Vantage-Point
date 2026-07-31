/**
 * Wire-shaped fixtures: every object here mirrors what the FastAPI backend
 * actually serialises (snake_case), *not* the camelCase types the frontend maps
 * them into. Changing a field name here should mean the backend changed too.
 */

/**
 * Where the app sends its requests: `VITE_API_URL`, or the client's fallback.
 * Routing on the origin matters: a path glob on "/api/" would also swallow the
 * dev server's own module requests for the app's `src/api/` directory.
 */
export const API_ORIGIN = new URL(
  process.env.VITE_API_URL ?? "http://localhost:8000",
).origin;

export const ACCESS_TOKEN = "e2e-access-token-1";
export const REFRESH_TOKEN = "e2e-refresh-token-1";
export const ROTATED_ACCESS_TOKEN = "e2e-access-token-2";
export const ROTATED_REFRESH_TOKEN = "e2e-refresh-token-2";

export const TEST_EMAIL = "tester@vantagepoint.dev";
export const TEST_PASSWORD = "sup3r-secret-pw";
export const TEST_RIOT_ID = "VantageTester#EUW";
/** Cognito emails a six-digit code; /verify-email redeems it. */
export const CONFIRMATION_CODE = "123456";

export interface UserMeBody {
  cognito_sub: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  riot_id_tag: string | null;
  has_linked_riot: boolean;
}

export function makeUser(overrides: Partial<UserMeBody> = {}): UserMeBody {
  return {
    cognito_sub: "sub-e2e-0001",
    email: TEST_EMAIL,
    display_name: "Vantage Tester",
    avatar_url: null,
    riot_id_tag: TEST_RIOT_ID,
    has_linked_riot: true,
    ...overrides,
  };
}

/** A signed-up account that has not linked a Riot ID yet. */
export const UNLINKED_USER: Partial<UserMeBody> = {
  riot_id_tag: null,
  has_linked_riot: false,
};

export interface MatchHistoryRowBody {
  match_id: string;
  champion_name: string;
  outcome: "Victory" | "Defeat";
  duration_minutes: number;
  map_label: string;
  played_on: string;
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  position: string;
}

/**
 * Six games over three days, deliberately spread across outcomes, roles,
 * durations, CS and KDA so the filter/sort/search assertions each have a
 * single unambiguous winner.
 *
 * Day labels rendered by the app (en-GB, "d MMMM"): 14 May, 13 May, 12 May.
 */
export const MATCH_HISTORY: readonly MatchHistoryRowBody[] = [
  {
    match_id: "EUW1_1001",
    champion_name: "Jinx",
    outcome: "Victory",
    duration_minutes: 32,
    map_label: "Summoner's Rift",
    played_on: "2026-05-14",
    kills: 12,
    deaths: 2,
    assists: 8,
    cs: 210,
    position: "BOTTOM",
  },
  {
    match_id: "EUW1_1002",
    champion_name: "Lee Sin",
    outcome: "Defeat",
    duration_minutes: 28,
    map_label: "Summoner's Rift",
    played_on: "2026-05-14",
    kills: 3,
    deaths: 9,
    assists: 6,
    cs: 150,
    position: "JUNGLE",
  },
  {
    match_id: "EUW1_1003",
    champion_name: "Thresh",
    outcome: "Victory",
    duration_minutes: 35,
    map_label: "Summoner's Rift",
    played_on: "2026-05-13",
    kills: 1,
    deaths: 4,
    assists: 22,
    cs: 40,
    position: "UTILITY",
  },
  {
    match_id: "EUW1_1004",
    champion_name: "Garen",
    outcome: "Defeat",
    duration_minutes: 41,
    map_label: "Summoner's Rift",
    played_on: "2026-05-13",
    kills: 5,
    deaths: 5,
    assists: 5,
    cs: 180,
    position: "TOP",
  },
  {
    match_id: "EUW1_1005",
    champion_name: "Ahri",
    outcome: "Victory",
    duration_minutes: 25,
    map_label: "Summoner's Rift",
    played_on: "2026-05-12",
    kills: 9,
    deaths: 3,
    assists: 11,
    cs: 240,
    position: "MIDDLE",
  },
  {
    match_id: "EUW1_1006",
    champion_name: "Yasuo",
    outcome: "Defeat",
    duration_minutes: 19,
    map_label: "Summoner's Rift",
    played_on: "2026-05-12",
    kills: 7,
    deaths: 8,
    assists: 4,
    cs: 199,
    position: "MIDDLE",
  },
];

/** The id used by every match-detail / replay / metrics spec. */
export const PRIMARY_MATCH_ID = "EUW1_1001";
export const VIEWER_PUUID = "puuid-blue-1";

export interface ParticipantBody {
  puuid: string;
  riot_id: string | null;
  champion_id: number;
  champion_name: string;
  position: string;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  gold_earned: number;
  damage_to_champions: number;
  vision_score: number;
  items: number[];
  summoner_spells: number[];
  is_viewer: boolean;
}

const BLUE_ROSTER: ReadonlyArray<{
  champion: string;
  championId: number;
  position: string;
  riotId: string;
}> = [
  {
    champion: "Jinx",
    championId: 222,
    position: "BOTTOM",
    riotId: TEST_RIOT_ID,
  },
  {
    champion: "Thresh",
    championId: 412,
    position: "UTILITY",
    riotId: "Hooker#EUW",
  },
  {
    champion: "Ahri",
    championId: 103,
    position: "MIDDLE",
    riotId: "NineTails#EUW",
  },
  {
    champion: "Lee Sin",
    championId: 64,
    position: "JUNGLE",
    riotId: "InsecKing#EUW",
  },
  {
    champion: "Garen",
    championId: 86,
    position: "TOP",
    riotId: "SpinToWin#EUW",
  },
];

const RED_ROSTER: ReadonlyArray<{
  champion: string;
  championId: number;
  position: string;
  riotId: string;
}> = [
  {
    champion: "Caitlyn",
    championId: 51,
    position: "BOTTOM",
    riotId: "Sheriff#NA1",
  },
  {
    champion: "Lulu",
    championId: 117,
    position: "UTILITY",
    riotId: "Yordle#NA1",
  },
  {
    champion: "Yasuo",
    championId: 157,
    position: "MIDDLE",
    riotId: "ZeroDeaths#NA1",
  },
  {
    champion: "Elise",
    championId: 60,
    position: "JUNGLE",
    riotId: "SpiderQueen#NA1",
  },
  { champion: "Darius", championId: 122, position: "TOP", riotId: "Noxus#NA1" },
];

function buildParticipants(
  side: "blue" | "red",
  win: boolean,
): ParticipantBody[] {
  const roster = side === "blue" ? BLUE_ROSTER : RED_ROSTER;
  return roster.map((entry, index) => ({
    puuid: `puuid-${side}-${String(index + 1)}`,
    riot_id: entry.riotId,
    champion_id: entry.championId,
    champion_name: entry.champion,
    position: entry.position,
    win,
    kills: win ? 12 - index : 4 + index,
    deaths: win ? 2 + index : 8 - index,
    assists: win ? 8 + index : 5 + index,
    cs: 210 - index * 25,
    gold_earned: 15400 - index * 900,
    damage_to_champions: 28400 - index * 2600,
    vision_score: 24 + index * 3,
    items: [3006, 3031, 3094, 6676, 3036, 3363, 0],
    summoner_spells: [4, 7],
    /** Exactly one participant across the whole match is the signed-in user. */
    is_viewer: side === "blue" && index === 0,
  }));
}

export interface MatchDetailBody {
  match_id: string;
  game_creation: number;
  game_duration: number;
  game_version: string;
  queue_id: number;
  queue_label: string;
  map_id: number;
  map_label: string;
  teams: Array<{
    team_id: number;
    win: boolean;
    bans: Array<{ champion_id: number; champion_name: string }>;
    objectives: {
      baron: number;
      dragon: number;
      rift_herald: number;
      tower: number;
      inhibitor: number;
    };
    participants: ParticipantBody[];
  }>;
}

/** 32 minutes, blue-side win, viewer is the Jinx on blue. */
export function makeMatchDetail(
  matchId: string = PRIMARY_MATCH_ID,
  overrides: Partial<MatchDetailBody> = {},
): MatchDetailBody {
  return {
    match_id: matchId,
    game_creation: Date.UTC(2026, 4, 14, 18, 30, 0),
    game_duration: 32 * 60,
    game_version: "14.24.1",
    queue_id: 420,
    queue_label: "Ranked Solo/Duo",
    map_id: 11,
    map_label: "Summoner's Rift",
    teams: [
      {
        team_id: 100,
        win: true,
        bans: [
          { champion_id: 157, champion_name: "Yasuo" },
          { champion_id: 238, champion_name: "Zed" },
          { champion_id: 141, champion_name: "Kayn" },
          { champion_id: 555, champion_name: "Pyke" },
          { champion_id: 875, champion_name: "Sett" },
        ],
        objectives: {
          baron: 1,
          dragon: 3,
          rift_herald: 1,
          tower: 8,
          inhibitor: 2,
        },
        participants: buildParticipants("blue", true),
      },
      {
        team_id: 200,
        win: false,
        bans: [
          { champion_id: 84, champion_name: "Akali" },
          { champion_id: 39, champion_name: "Irelia" },
          { champion_id: 245, champion_name: "Ekko" },
          { champion_id: 517, champion_name: "Sylas" },
          { champion_id: 350, champion_name: "Yuumi" },
        ],
        objectives: {
          baron: 0,
          dragon: 1,
          rift_herald: 1,
          tower: 3,
          inhibitor: 0,
        },
        participants: buildParticipants("red", false),
      },
    ],
    ...overrides,
  };
}

export interface TimelineBody {
  match_id: string;
  frame_interval_ms: number;
  game_duration_ms: number;
  map_id: number;
  map_bounds: { min_x: number; min_y: number; max_x: number; max_y: number };
  participants: Array<{ puuid: string; distance_travelled: number }>;
  frames: Array<{
    timestamp_ms: number;
    participants: Array<Record<string, unknown>>;
  }>;
  events: Array<Record<string, unknown>>;
}

const ALL_PUUIDS: readonly string[] = [
  ...buildParticipants("blue", true),
  ...buildParticipants("red", false),
].map((p) => p.puuid);

/** 33 one-minute frames plus a handful of kills, wards and skill/item events. */
export function makeTimeline(
  matchId: string = PRIMARY_MATCH_ID,
  overrides: Partial<TimelineBody> = {},
): TimelineBody {
  const frameCount = 33;
  const frames = Array.from({ length: frameCount }, (_unused, minute) => ({
    timestamp_ms: minute * 60_000,
    participants: ALL_PUUIDS.map((puuid, index) => ({
      puuid,
      /** A slow diagonal walk so `pathUpTo` produces a visible polyline. */
      position: {
        x: 1_200 + minute * 380 + index * 60,
        y: 1_400 + minute * 340 + index * 45,
      },
      level: Math.min(18, 1 + Math.floor(minute * 0.55)),
      damage_to_champions: minute * (900 - index * 40),
      xp: minute * 620,
      cs: minute * 7 + index,
      current_gold: 300 + minute * 40,
      total_gold: 500 + minute * 380,
      health: 640 + minute * 55,
      health_max: 640 + minute * 55,
      armor: 32 + minute * 2,
      magic_resist: 30 + minute,
      attack_damage: 60 + minute * 4,
      ability_power: index % 2 === 0 ? 0 : 20 + minute * 5,
      movement_speed: 330 + Math.floor(minute / 6) * 15,
    })),
  }));

  const events: Array<Record<string, unknown>> = [
    {
      timestamp_ms: 300_000,
      type: "CHAMPION_KILL",
      position: { x: 4_200, y: 4_400 },
      actor_puuid: VIEWER_PUUID,
      victim_puuid: "puuid-red-1",
      assist_puuids: ["puuid-blue-2"],
      team_id: 100,
      item_id: null,
      skill_slot: null,
      level: null,
      monster_type: null,
      building_type: null,
      lane_type: "BOT_LANE",
      ward_type: null,
    },
    {
      timestamp_ms: 720_000,
      type: "CHAMPION_KILL",
      position: { x: 8_100, y: 7_900 },
      actor_puuid: "puuid-red-3",
      victim_puuid: VIEWER_PUUID,
      assist_puuids: [],
      team_id: 200,
      item_id: null,
      skill_slot: null,
      level: null,
      monster_type: null,
      building_type: null,
      lane_type: "MID_LANE",
      ward_type: null,
    },
    {
      timestamp_ms: 900_000,
      type: "ELITE_MONSTER_KILL",
      position: { x: 9_800, y: 4_300 },
      actor_puuid: VIEWER_PUUID,
      victim_puuid: null,
      assist_puuids: [],
      team_id: 100,
      item_id: null,
      skill_slot: null,
      level: null,
      monster_type: "DRAGON",
      building_type: null,
      lane_type: null,
      ward_type: null,
    },
    {
      timestamp_ms: 1_200_000,
      type: "BUILDING_KILL",
      position: { x: 5_800, y: 6_200 },
      actor_puuid: VIEWER_PUUID,
      victim_puuid: null,
      assist_puuids: [],
      team_id: 100,
      item_id: null,
      skill_slot: null,
      level: null,
      monster_type: null,
      building_type: "TOWER_BUILDING",
      lane_type: "MID_LANE",
      ward_type: null,
    },
    ...[1, 2, 3, 4].map((slot) => ({
      timestamp_ms: slot * 90_000,
      type: "SKILL_LEVEL_UP",
      position: null,
      actor_puuid: VIEWER_PUUID,
      victim_puuid: null,
      assist_puuids: [],
      team_id: null,
      item_id: null,
      skill_slot: slot,
      level: slot,
      monster_type: null,
      building_type: null,
      lane_type: null,
      ward_type: null,
    })),
    ...[3006, 3031, 3094].map((itemId, index) => ({
      timestamp_ms: 240_000 + index * 300_000,
      type: "ITEM_PURCHASED",
      position: null,
      actor_puuid: VIEWER_PUUID,
      victim_puuid: null,
      assist_puuids: [],
      team_id: null,
      item_id: itemId,
      skill_slot: null,
      level: null,
      monster_type: null,
      building_type: null,
      lane_type: null,
      ward_type: null,
    })),
  ];

  return {
    match_id: matchId,
    frame_interval_ms: 60_000,
    game_duration_ms: 32 * 60_000,
    map_id: 11,
    map_bounds: { min_x: 0, min_y: 0, max_x: 14_870, max_y: 14_980 },
    participants: ALL_PUUIDS.map((puuid, index) => ({
      puuid,
      distance_travelled: 120_000 + index * 4_000,
    })),
    frames,
    events,
    ...overrides,
  };
}

export interface LiveMetricsBody {
  games_analyzed: number;
  avg_kda: string;
  avg_vision_score: number;
  avg_kill_participation_pct: number;
  avg_cs_per_minute: number;
  avg_damage_per_minute: number;
  avg_gold_per_minute: number;
  win_rate: string;
}

export function makeLiveMetrics(
  overrides: Partial<LiveMetricsBody> = {},
): LiveMetricsBody {
  return {
    games_analyzed: 5,
    avg_kda: "8.2 / 3.4 / 6.1",
    avg_vision_score: 24.5,
    avg_kill_participation_pct: 62,
    avg_cs_per_minute: 7.4,
    avg_damage_per_minute: 812,
    avg_gold_per_minute: 415,
    win_rate: "60%",
    ...overrides,
  };
}

export interface ProfileBody {
  display_name: string;
  riot_id_tag: string;
  avatar_initials: string;
  avatar_url: string | null;
  matches_sampled: number;
  radar_metrics: Array<{
    key: string;
    label: string;
    value: number;
    raw_label: string;
  }>;
  recent_champions: Array<{
    champion_id: number;
    champion_name: string;
    games_played: number;
  }>;
  achievements: Array<{
    id: string;
    label: string;
    description: string;
    source_field: string;
    count: number;
  }>;
  featured_games: Array<{
    game_name: string;
    cover_image_key: string;
    card_image_key?: string;
    efficiency_score: number;
    time_spent_label: string;
    win_rate_label: string;
    kda_label: string;
  }>;
}

export function makeProfile(overrides: Partial<ProfileBody> = {}): ProfileBody {
  return {
    display_name: "Vantage Tester",
    riot_id_tag: TEST_RIOT_ID,
    avatar_initials: "VT",
    avatar_url: null,
    matches_sampled: 6,
    radar_metrics: [
      { key: "kda", label: "KDA", value: 78, raw_label: "3.4" },
      { key: "vision", label: "Vision", value: 61, raw_label: "24.5" },
      { key: "cs", label: "CS/min", value: 72, raw_label: "7.4" },
      { key: "damage", label: "Damage", value: 84, raw_label: "812" },
      { key: "gold", label: "Gold", value: 66, raw_label: "415" },
    ],
    recent_champions: [
      { champion_id: 222, champion_name: "Jinx", games_played: 12 },
      { champion_id: 412, champion_name: "Thresh", games_played: 7 },
      { champion_id: 103, champion_name: "Ahri", games_played: 4 },
    ],
    achievements: [
      {
        id: "pentakills",
        label: "Pentakills",
        description: "Five kills in quick succession.",
        source_field: "pentakills",
        count: 1,
      },
      {
        id: "solo-kills",
        label: "Solo kills",
        description: "Kills with no assists.",
        source_field: "soloKills",
        count: 14,
      },
    ],
    featured_games: [
      {
        game_name: "League of Legends",
        cover_image_key: "league_of_legends_cover",
        card_image_key: "league_of_legends_card",
        efficiency_score: 82,
        time_spent_label: "3:14:22:05",
        win_rate_label: "60%",
        kda_label: "3.4",
      },
    ],
    ...overrides,
  };
}
