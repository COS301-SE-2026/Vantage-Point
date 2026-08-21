/**
 * A fabricated match for the landing page previews.
 *
 * The marketing page shows the real Match Replay components rather than a
 * screenshot of them, so it needs a scoreboard and a timeline in exactly the
 * shapes the API returns. Nothing here is fetched: the routes are hand drawn
 * over Summoner's Rift and sampled into per minute frames, which is enough for
 * the map overlay to draw paths, kill markers and champion portraits the same
 * way it does inside the dashboard.
 */
import type {
  MatchDetail,
  ParticipantDetail,
  TeamDetail,
} from "../types/match";
import type {
  MapBounds,
  MatchTimeline,
  TimelineEvent,
  TimelineFrame,
  TimelineParticipantFrame,
  TimelinePosition,
} from "../types/timeline";
import type { ReplayCoachingNote } from "../lib/replayCoaching";

/** Riot's playable extent, square, with the origin in the blue base corner. */
const RIFT_SPAN = 14870;

const FRAME_INTERVAL_MS = 60_000;
const GAME_MINUTES = 25;

export const SAMPLE_GAME_DURATION_MS = GAME_MINUTES * FRAME_INTERVAL_MS;

export const SAMPLE_MAP_BOUNDS: MapBounds = {
  min_x: 0,
  min_y: 0,
  max_x: RIFT_SPAN,
  max_y: RIFT_SPAN,
};

/**
 * A point on the rift as fractions of its width, measured from the blue base
 * corner. Riot's Y axis grows upward, so 1 is the top lane side of the map.
 */
export type RiftFraction = readonly [number, number];

export function riotPosition([fx, fy]: RiftFraction): TimelinePosition {
  return { x: Math.round(fx * RIFT_SPAN), y: Math.round(fy * RIFT_SPAN) };
}

interface SamplePlayer {
  readonly puuid: string;
  readonly riotId: string;
  readonly championName: string;
  readonly championId: number;
  readonly position: string;
  readonly teamId: number;
  readonly kills: number;
  readonly deaths: number;
  readonly assists: number;
  readonly cs: number;
  /** Waypoints the player walks between minute 0 and the final whistle. */
  readonly route: readonly RiftFraction[];
}

/**
 * Blue side loses, and the viewer is the bot lane carry, so the coaching notes
 * and the death markers both have something to say.
 */
const SAMPLE_PLAYERS_SOURCE: readonly SamplePlayer[] = [
  {
    puuid: "sample-garen",
    riotId: "Ironbrand#EUW",
    championName: "Garen",
    championId: 86,
    position: "TOP",
    teamId: 100,
    kills: 3,
    deaths: 4,
    assists: 5,
    cs: 201,
    route: [
      [0.08, 0.11],
      [0.1, 0.34],
      [0.13, 0.6],
      [0.21, 0.79],
      [0.34, 0.87],
      [0.46, 0.9],
      [0.3, 0.78],
    ],
  },
  {
    puuid: "sample-lee-sin",
    riotId: "Blindmonk#EUW",
    championName: "Lee Sin",
    championId: 64,
    position: "JUNGLE",
    teamId: 100,
    kills: 6,
    deaths: 6,
    assists: 9,
    cs: 148,
    route: [
      [0.1, 0.13],
      [0.23, 0.3],
      [0.31, 0.46],
      [0.45, 0.55],
      [0.56, 0.43],
      [0.68, 0.35],
      [0.55, 0.5],
      [0.4, 0.63],
    ],
  },
  {
    puuid: "sample-ahri",
    riotId: "Ninetails#EUW",
    championName: "Ahri",
    championId: 103,
    position: "MIDDLE",
    teamId: 100,
    kills: 7,
    deaths: 5,
    assists: 7,
    cs: 219,
    route: [
      [0.13, 0.13],
      [0.29, 0.29],
      [0.41, 0.41],
      [0.5, 0.5],
      [0.59, 0.59],
      [0.49, 0.49],
      [0.63, 0.63],
    ],
  },
  {
    puuid: "sample-jinx",
    riotId: "Vantage#VP1",
    championName: "Jinx",
    championId: 222,
    position: "BOTTOM",
    teamId: 100,
    kills: 4,
    deaths: 8,
    assists: 6,
    cs: 165,
    route: [
      [0.12, 0.1],
      [0.36, 0.1],
      [0.56, 0.11],
      [0.72, 0.15],
      [0.82, 0.23],
      [0.88, 0.34],
      [0.75, 0.29],
      [0.58, 0.5],
    ],
  },
  {
    puuid: "sample-thresh",
    riotId: "Chainwarden#EUW",
    championName: "Thresh",
    championId: 412,
    position: "UTILITY",
    teamId: 100,
    kills: 1,
    deaths: 7,
    assists: 18,
    cs: 41,
    route: [
      [0.14, 0.13],
      [0.37, 0.13],
      [0.57, 0.14],
      [0.71, 0.19],
      [0.8, 0.27],
      [0.85, 0.38],
      [0.71, 0.33],
      [0.55, 0.54],
    ],
  },
  {
    puuid: "sample-darius",
    riotId: "Hemorrhage#EUW",
    championName: "Darius",
    championId: 122,
    position: "TOP",
    teamId: 200,
    kills: 8,
    deaths: 2,
    assists: 4,
    cs: 224,
    route: [
      [0.9, 0.9],
      [0.72, 0.92],
      [0.55, 0.9],
      [0.4, 0.88],
      [0.27, 0.82],
      [0.21, 0.7],
      [0.35, 0.72],
    ],
  },
  {
    puuid: "sample-vi",
    riotId: "Piltover#EUW",
    championName: "Vi",
    championId: 254,
    position: "JUNGLE",
    teamId: 200,
    kills: 9,
    deaths: 3,
    assists: 11,
    cs: 162,
    route: [
      [0.88, 0.88],
      [0.73, 0.71],
      [0.59, 0.58],
      [0.45, 0.46],
      [0.35, 0.36],
      [0.5, 0.48],
      [0.62, 0.6],
      [0.5, 0.52],
    ],
  },
  {
    puuid: "sample-yasuo",
    riotId: "Unforgiven#EUW",
    championName: "Yasuo",
    championId: 157,
    position: "MIDDLE",
    teamId: 200,
    kills: 10,
    deaths: 4,
    assists: 6,
    cs: 241,
    route: [
      [0.88, 0.88],
      [0.75, 0.75],
      [0.63, 0.63],
      [0.53, 0.53],
      [0.61, 0.61],
      [0.48, 0.48],
      [0.56, 0.56],
    ],
  },
  {
    puuid: "sample-caitlyn",
    riotId: "Sheriff#EUW",
    championName: "Caitlyn",
    championId: 51,
    position: "BOTTOM",
    teamId: 200,
    kills: 7,
    deaths: 3,
    assists: 8,
    cs: 233,
    route: [
      [0.9, 0.88],
      [0.9, 0.66],
      [0.88, 0.45],
      [0.84, 0.29],
      [0.74, 0.19],
      [0.62, 0.13],
      [0.72, 0.26],
    ],
  },
  {
    puuid: "sample-nautilus",
    riotId: "Titan#EUW",
    championName: "Nautilus",
    championId: 111,
    position: "UTILITY",
    teamId: 200,
    kills: 2,
    deaths: 5,
    assists: 21,
    cs: 38,
    route: [
      [0.87, 0.86],
      [0.87, 0.64],
      [0.85, 0.43],
      [0.81, 0.28],
      [0.71, 0.18],
      [0.59, 0.15],
      [0.69, 0.29],
    ],
  },
];

function toParticipant(player: SamplePlayer): ParticipantDetail {
  return {
    puuid: player.puuid,
    riot_id: player.riotId,
    champion_id: player.championId,
    champion_name: player.championName,
    position: player.position,
    win: player.teamId === 200,
    kills: player.kills,
    deaths: player.deaths,
    assists: player.assists,
    cs: player.cs,
    gold_earned: 9800 + player.cs * 22,
    damage_to_champions: 12000 + player.kills * 1450,
    vision_score: 18 + player.assists,
    items: [],
    summoner_spells: [4, 7],
    is_viewer: player.puuid === "sample-jinx",
  };
}

function team(teamId: number): TeamDetail {
  const participants = SAMPLE_PLAYERS_SOURCE.filter(
    (player) => player.teamId === teamId,
  ).map(toParticipant);

  return {
    team_id: teamId,
    win: teamId === 200,
    bans: [],
    objectives: {
      baron: teamId === 200 ? 1 : 0,
      dragon: teamId === 200 ? 3 : 1,
      rift_herald: teamId === 200 ? 1 : 1,
      tower: teamId === 200 ? 8 : 3,
      inhibitor: teamId === 200 ? 2 : 0,
    },
    participants,
  };
}

export const SAMPLE_MATCH: MatchDetail = {
  match_id: "EUW1_SAMPLE",
  game_creation: 0,
  game_duration: GAME_MINUTES * 60,
  game_version: "14.24.1",
  queue_id: 420,
  queue_label: "Ranked Solo",
  map_id: 11,
  map_label: "Summoner's Rift",
  teams: [team(100), team(200)],
};

export const SAMPLE_PLAYERS: readonly ParticipantDetail[] =
  SAMPLE_PLAYERS_SOURCE.map(toParticipant);

export const SAMPLE_VIEWER = SAMPLE_PLAYERS.find(
  (player) => player.is_viewer,
) as ParticipantDetail;

export const SAMPLE_TEAM_BY_PUUID: ReadonlyMap<string, number> = new Map(
  SAMPLE_PLAYERS_SOURCE.map((player) => [player.puuid, player.teamId]),
);

/** Walks a waypoint list, returning the point a fraction `t` along it. */
function sampleRoute(route: readonly RiftFraction[], t: number): RiftFraction {
  const clamped = Math.min(1, Math.max(0, t));
  const legs = route.length - 1;
  const scaled = clamped * legs;
  const leg = Math.min(legs - 1, Math.floor(scaled));
  const ratio = scaled - leg;
  const [ax, ay] = route[leg];
  const [bx, by] = route[leg + 1];
  return [ax + (bx - ax) * ratio, ay + (by - ay) * ratio];
}

/**
 * A deterministic drift off the straight leg, so a path reads as a champion
 * moving rather than as a ruler. Seeded per player, never random: the preview
 * has to look the same on every render and in every test run.
 */
function drift(t: number, seed: number): number {
  return 0.013 * Math.sin(t * 11 + seed);
}

function frameFor(player: SamplePlayer, minute: number, seed: number) {
  const t = minute / GAME_MINUTES;
  const [fx, fy] = sampleRoute(player.route, t);
  const level = Math.min(18, 1 + Math.floor(minute * 0.68));

  return {
    puuid: player.puuid,
    position: riotPosition([
      Math.min(0.98, Math.max(0.02, fx + drift(t, seed))),
      Math.min(0.98, Math.max(0.02, fy + drift(t, seed + 2.1))),
    ]),
    level,
    damage_to_champions: Math.round(minute * 520 + player.kills * 120),
    xp: level * 780,
    cs: Math.round((player.cs * minute) / GAME_MINUTES),
    current_gold: 220 + minute * 40,
    total_gold: 500 + minute * 380,
    health: 640 + level * 95,
    health_max: 640 + level * 95,
    armor: 32 + level * 4,
    magic_resist: 30 + level * 2,
    attack_damage: 58 + level * 5,
    ability_power: player.position === "MIDDLE" ? 40 + level * 12 : 0,
    movement_speed: 335,
  } satisfies TimelineParticipantFrame;
}

const SAMPLE_FRAMES: readonly TimelineFrame[] = Array.from(
  { length: GAME_MINUTES + 1 },
  (_, minute) => ({
    timestamp_ms: minute * FRAME_INTERVAL_MS,
    participants: SAMPLE_PLAYERS_SOURCE.map((player, index) =>
      frameFor(player, minute, index * 1.7),
    ),
  }),
);

const BLUE_BASE: RiftFraction = [0.08, 0.08];
const RED_BASE: RiftFraction = [0.92, 0.92];

/** A point `distance` of the map's width from `from` along the line to `to`. */
function towards(
  from: RiftFraction,
  to: RiftFraction,
  distance: number,
): RiftFraction {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const length = Math.hypot(dx, dy) || 1;
  return [
    from[0] + (dx / length) * distance,
    from[1] + (dy / length) * distance,
  ];
}

const VIEWER_ROUTE = SAMPLE_PLAYERS_SOURCE.find(
  (player) => player.puuid === "sample-jinx",
)?.route as readonly RiftFraction[];

/** Where the viewer was at a given minute, before the per frame drift. */
function viewerAt(minute: number): RiftFraction {
  return sampleRoute(VIEWER_ROUTE, minute / GAME_MINUTES);
}

/**
 * Fights are placed off the viewer's own route rather than at hand picked
 * coordinates, so a marker always lands on the path the map draws. Deaths sit a
 * step towards the enemy base, which is the overextension the whole preview is
 * about; the viewer's kills sit right on the route.
 */
const DEATH_STEP = 0.06;

interface SampleKill {
  readonly minute: number;
  readonly seconds: number;
  readonly actor: string;
  readonly victim: string;
}

/** Eight deaths and four kills for the viewer, matching the scoreboard line. */
const SAMPLE_KILLS: readonly SampleKill[] = [
  { minute: 4, seconds: 15, actor: "sample-vi", victim: "sample-jinx" },
  { minute: 6, seconds: 40, actor: "sample-jinx", victim: "sample-caitlyn" },
  { minute: 8, seconds: 20, actor: "sample-vi", victim: "sample-jinx" },
  { minute: 11, seconds: 40, actor: "sample-jinx", victim: "sample-caitlyn" },
  { minute: 13, seconds: 10, actor: "sample-yasuo", victim: "sample-jinx" },
  { minute: 15, seconds: 20, actor: "sample-caitlyn", victim: "sample-jinx" },
  { minute: 17, seconds: 5, actor: "sample-vi", victim: "sample-jinx" },
  { minute: 18, seconds: 10, actor: "sample-darius", victim: "sample-jinx" },
  { minute: 19, seconds: 30, actor: "sample-jinx", victim: "sample-nautilus" },
  { minute: 21, seconds: 45, actor: "sample-darius", victim: "sample-jinx" },
  { minute: 23, seconds: 0, actor: "sample-yasuo", victim: "sample-jinx" },
  { minute: 24, seconds: 10, actor: "sample-jinx", victim: "sample-nautilus" },
];

function fightPosition(kill: SampleKill): RiftFraction {
  const seconds = kill.minute + kill.seconds / 60;
  const on = viewerAt(seconds);
  return kill.victim === "sample-jinx" ? towards(on, RED_BASE, DEATH_STEP) : on;
}

const SAMPLE_EVENTS: readonly TimelineEvent[] = SAMPLE_KILLS.map((kill) => ({
  timestamp_ms: kill.minute * FRAME_INTERVAL_MS + kill.seconds * 1000,
  type: "CHAMPION_KILL",
  position: riotPosition(fightPosition(kill)),
  actor_puuid: kill.actor,
  victim_puuid: kill.victim,
  assist_puuids: [],
  team_id: null,
  item_id: null,
  skill_slot: null,
  level: null,
  monster_type: null,
  building_type: null,
  lane_type: null,
  ward_type: null,
}));

export const SAMPLE_TIMELINE: MatchTimeline = {
  match_id: SAMPLE_MATCH.match_id,
  frame_interval_ms: FRAME_INTERVAL_MS,
  game_duration_ms: SAMPLE_GAME_DURATION_MS,
  map_id: 11,
  map_bounds: SAMPLE_MAP_BOUNDS,
  participants: SAMPLE_PLAYERS_SOURCE.map((player) => ({
    puuid: player.puuid,
    distance_travelled: 78_000,
  })),
  frames: SAMPLE_FRAMES,
  events: SAMPLE_EVENTS,
};

/**
 * Where the viewer died, and where the nearest winning snapshot had that role
 * standing at the same minute. The positioning section draws the pair.
 */
export interface PositioningCorrection {
  readonly minute: number;
  readonly died: RiftFraction;
  readonly ghost: RiftFraction;
}

/** The correction is a step back down the same line the death is forward of. */
const GHOST_STEP = 0.13;

export const POSITIONING_CORRECTIONS: readonly PositioningCorrection[] =
  SAMPLE_KILLS.filter((kill) => kill.victim === "sample-jinx")
    .filter((kill) => [8, 13, 17, 21].includes(kill.minute))
    .map((kill) => {
      const died = fightPosition(kill);
      return {
        minute: kill.minute,
        died,
        ghost: towards(died, BLUE_BASE, GHOST_STEP),
      };
    });

/**
 * Written rather than derived: `buildReplayCoachingNotes` reads a real
 * scoreboard, and the preview only needs three cards that say what the panel
 * says in the product.
 */
export const SAMPLE_COACHING_NOTES: readonly ReplayCoachingNote[] = [
  {
    id: "sample-note-river",
    heading: "You die past the river line",
    body: "Four of eight deaths are on the enemy half of the bot river with no ward behind you. The model puts the safe line one screen back.",
  },
  {
    id: "sample-note-tempo",
    heading: "The 13 minute window is costing you",
    body: "Between minute 11 and 14 you hold the same forward brush every game. Winning carries at your rank are rotating mid by then.",
  },
  {
    id: "sample-note-farm",
    heading: "Farm holds up, spacing does not",
    body: "165 CS is on pace for the lobby. Your damage share falls because you enter fights from the front instead of the flank.",
  },
];
