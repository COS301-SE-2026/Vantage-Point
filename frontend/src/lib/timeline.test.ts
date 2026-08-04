import { describe, expect, it } from "vitest";
import {
  buildAnalysisSnapshot,
  formatTimelineClock,
  frameIndexAt,
  itemsAt,
  objectivesAt,
  participantStateAt,
  pathUpTo,
  projectPosition,
  skillPointsAt,
} from "./timeline";
import type {
  MapBounds,
  MatchTimeline,
  TimelineEvent,
  TimelineParticipantFrame,
} from "../types/timeline";

const BOUNDS: MapBounds = { min_x: 0, min_y: 0, max_x: 1000, max_y: 1000 };

function participantFrame(
  puuid: string,
  x: number,
  y: number,
  overrides: Partial<TimelineParticipantFrame> = {},
): TimelineParticipantFrame {
  return {
    puuid,
    position: { x, y },
    level: 1,
    damage_to_champions: 0,
    xp: 0,
    cs: 0,
    current_gold: 0,
    total_gold: 0,
    health: 600,
    health_max: 600,
    armor: 40,
    magic_resist: 32,
    attack_damage: 60,
    ability_power: 0,
    movement_speed: 335,
    ...overrides,
  };
}

function event(overrides: Partial<TimelineEvent>): TimelineEvent {
  return {
    timestamp_ms: 0,
    type: "CHAMPION_KILL",
    position: null,
    actor_puuid: null,
    victim_puuid: null,
    assist_puuids: [],
    team_id: null,
    item_id: null,
    skill_slot: null,
    level: null,
    monster_type: null,
    building_type: null,
    lane_type: null,
    ward_type: null,
    ...overrides,
  };
}

const timeline: MatchTimeline = {
  match_id: "EUW1_1",
  frame_interval_ms: 60_000,
  game_duration_ms: 120_000,
  map_id: 11,
  map_bounds: BOUNDS,
  participants: [{ puuid: "me", distance_travelled: 1234 }],
  frames: [
    {
      timestamp_ms: 0,
      participants: [
        participantFrame("me", 0, 0),
        participantFrame("mate", 100, 100),
      ],
    },
    {
      timestamp_ms: 60_000,
      participants: [
        participantFrame("me", 400, 800, { level: 6, health: 900, armor: 55 }),
        participantFrame("mate", 200, 200, {
          level: 5,
          health: 800,
          armor: 50,
        }),
      ],
    },
    {
      timestamp_ms: 120_000,
      participants: [
        participantFrame("me", 800, 800, { level: 11 }),
        participantFrame("mate", 300, 300, { level: 9 }),
      ],
    },
  ],
  events: [
    event({
      timestamp_ms: 10_000,
      type: "SKILL_LEVEL_UP",
      actor_puuid: "me",
      skill_slot: 1,
    }),
    event({
      timestamp_ms: 20_000,
      type: "SKILL_LEVEL_UP",
      actor_puuid: "me",
      skill_slot: 2,
    }),
    event({
      timestamp_ms: 30_000,
      type: "SKILL_LEVEL_UP",
      actor_puuid: "me",
      skill_slot: 1,
    }),
    event({
      timestamp_ms: 90_000,
      type: "SKILL_LEVEL_UP",
      actor_puuid: "me",
      skill_slot: 4,
    }),
    event({
      timestamp_ms: 95_000,
      type: "SKILL_LEVEL_UP",
      actor_puuid: "other",
      skill_slot: 3,
    }),
    event({
      timestamp_ms: 15_000,
      type: "ITEM_PURCHASED",
      actor_puuid: "me",
      item_id: 1001,
    }),
    event({
      timestamp_ms: 25_000,
      type: "ITEM_PURCHASED",
      actor_puuid: "me",
      item_id: 3031,
    }),
    event({
      timestamp_ms: 26_000,
      type: "ITEM_SOLD",
      actor_puuid: "me",
      item_id: 1001,
    }),
    event({
      timestamp_ms: 70_000,
      type: "ITEM_PURCHASED",
      actor_puuid: "me",
      item_id: 3006,
    }),
    event({
      timestamp_ms: 40_000,
      type: "CHAMPION_KILL",
      actor_puuid: "me",
      victim_puuid: "enemy",
      position: { x: 500, y: 500 },
    }),
    event({
      timestamp_ms: 100_000,
      type: "CHAMPION_KILL",
      actor_puuid: "enemy",
      victim_puuid: "me",
      position: { x: 600, y: 600 },
    }),
    event({
      timestamp_ms: 50_000,
      type: "BUILDING_KILL",
      building_type: "TOWER_BUILDING",
      team_id: 200,
    }),
    event({
      timestamp_ms: 55_000,
      type: "BUILDING_KILL",
      building_type: "INHIBITOR_BUILDING",
      team_id: 200,
    }),
    event({
      timestamp_ms: 60_000,
      type: "BUILDING_KILL",
      building_type: "TOWER_BUILDING",
      team_id: 100,
    }),
    event({
      timestamp_ms: 80_000,
      type: "ELITE_MONSTER_KILL",
      monster_type: "DRAGON",
      team_id: 100,
    }),
    event({
      timestamp_ms: 110_000,
      type: "ELITE_MONSTER_KILL",
      monster_type: "BARON_NASHOR",
      team_id: 100,
    }),
  ],
};

describe("projectPosition", () => {
  it("flips the Y axis, because Riot's grows upward and a screen's grows down", () => {
    expect(projectPosition({ x: 0, y: 1000 }, BOUNDS)).toEqual({
      leftPct: 0,
      topPct: 0,
    });
    expect(projectPosition({ x: 1000, y: 0 }, BOUNDS)).toEqual({
      leftPct: 100,
      topPct: 100,
    });
    expect(projectPosition({ x: 500, y: 500 }, BOUNDS)).toEqual({
      leftPct: 50,
      topPct: 50,
    });
  });

  it("clamps points that sit outside the playable box", () => {
    const point = projectPosition({ x: -500, y: 5000 }, BOUNDS);
    expect(point.leftPct).toBe(0);
    expect(point.topPct).toBe(0);
  });
});

describe("frameIndexAt", () => {
  it("returns the last frame at or before the clock", () => {
    expect(frameIndexAt(timeline, 0)).toBe(0);
    expect(frameIndexAt(timeline, 59_999)).toBe(0);
    expect(frameIndexAt(timeline, 60_000)).toBe(1);
    expect(frameIndexAt(timeline, 999_999)).toBe(2);
  });
});

describe("participantStateAt", () => {
  it("interpolates position between frames so playback is continuous", () => {
    const state = participantStateAt(timeline, "me", 90_000);
    // Halfway from (400,800) to (800,800).
    expect(state?.position).toEqual({ x: 600, y: 800 });
  });

  it("takes stats from the preceding frame rather than interpolating them", () => {
    const state = participantStateAt(timeline, "me", 90_000);
    expect(state?.level).toBe(6);
    expect(state?.armor).toBe(55);
  });

  it("is undefined before the first frame or for an unknown player", () => {
    expect(participantStateAt(timeline, "me", -1)).toBeUndefined();
    expect(participantStateAt(timeline, "nobody", 60_000)).toBeUndefined();
  });
});

describe("pathUpTo", () => {
  it("stops at the clock and finishes on the interpolated head", () => {
    const path = pathUpTo(timeline, "me", 90_000);
    expect(path).toEqual([
      { x: 0, y: 0 },
      { x: 400, y: 800 },
      { x: 600, y: 800 },
    ]);
  });
});

describe("skillPointsAt", () => {
  it("counts points per slot for one player only", () => {
    expect(skillPointsAt(timeline, "me", 120_000)).toEqual([2, 1, 0, 1]);
  });

  it("ignores points spent after the clock", () => {
    expect(skillPointsAt(timeline, "me", 25_000)).toEqual([1, 1, 0, 0]);
  });
});

describe("itemsAt", () => {
  it("applies purchases and removes sold items", () => {
    expect(itemsAt(timeline, "me", 120_000)).toEqual([3031, 3006]);
  });

  it("reflects the build at the moment asked for", () => {
    expect(itemsAt(timeline, "me", 20_000)).toEqual([1001]);
  });

  it("drops the most recent purchase on an undo", () => {
    const withUndo: MatchTimeline = {
      ...timeline,
      events: [
        event({
          timestamp_ms: 1000,
          type: "ITEM_PURCHASED",
          actor_puuid: "me",
          item_id: 1055,
        }),
        event({ timestamp_ms: 2000, type: "ITEM_UNDO", actor_puuid: "me" }),
      ],
    };
    expect(itemsAt(withUndo, "me", 5000)).toEqual([]);
  });
});

describe("objectivesAt", () => {
  it("credits buildings to the team that did not lose them", () => {
    const blue = objectivesAt(timeline, 100, 120_000);
    expect(blue.tower).toBe(1);
    expect(blue.inhibitor).toBe(1);

    const red = objectivesAt(timeline, 200, 120_000);
    expect(red.tower).toBe(1);
    expect(red.inhibitor).toBe(0);
  });

  it("credits elite monsters to the team that took them", () => {
    const blue = objectivesAt(timeline, 100, 120_000);
    expect(blue.dragon).toBe(1);
    expect(blue.baron).toBe(1);
    expect(objectivesAt(timeline, 200, 120_000).dragon).toBe(0);
  });

  it("only counts what had happened by the clock", () => {
    expect(objectivesAt(timeline, 100, 90_000).baron).toBe(0);
    expect(objectivesAt(timeline, 100, 90_000).dragon).toBe(1);
  });
});

describe("buildAnalysisSnapshot", () => {
  it("aggregates the team and reads the viewer at the same moment", () => {
    const snapshot = buildAnalysisSnapshot(
      timeline,
      "me",
      ["me", "mate"],
      100,
      60_000,
    );

    expect(snapshot.viewer?.level).toBe(6);
    expect(snapshot.team?.health).toBe(900 + 800);
    // Averages, not sums, for the rate-like rows.
    expect(snapshot.team?.armor).toBe(53);
    expect(snapshot.team?.level).toBe(6);
    expect(snapshot.items).toEqual([3031]);
    expect(snapshot.objectives?.tower).toBe(1);
  });

  it("reports no team when the timeline has no frame yet", () => {
    const snapshot = buildAnalysisSnapshot(timeline, "me", ["me"], 100, -1);
    expect(snapshot.team).toBeNull();
    expect(snapshot.viewer).toBeUndefined();
  });
});

describe("formatTimelineClock", () => {
  it("formats game time as mm:ss", () => {
    expect(formatTimelineClock(0)).toBe("0:00");
    expect(formatTimelineClock(65_000)).toBe("1:05");
    expect(formatTimelineClock(1_320_000)).toBe("22:00");
    expect(formatTimelineClock(-5)).toBe("0:00");
  });
});
