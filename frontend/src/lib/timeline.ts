/**
 * Queries over a match timeline: where everyone was at a moment, what had happened by
 * then, and where any of it lands on the minimap image.
 *
 * Riot samples a frame per minute, so anything asked for between two frames is
 * interpolated for position (which makes playback look continuous) and taken from the
 * preceding frame for stats (a champion does not gain half a level).
 */

import type {
  MapBounds,
  MatchTimeline,
  TimelineEvent,
  TimelineParticipantFrame,
  TimelinePosition,
} from "../types/timeline";

/** Where a point sits on the map image, as percentages from its top-left corner. */
export interface MapPoint {
  readonly leftPct: number;
  readonly topPct: number;
}

/**
 * Riot's Y axis grows upward and the screen's grows downward, so the vertical axis is
 * flipped here. Percentages rather than pixels means the caller can scale or zoom the
 * map without recomputing anything.
 */
export function projectPosition(
  position: TimelinePosition,
  bounds: MapBounds,
): MapPoint {
  const spanX = Math.max(1, bounds.max_x - bounds.min_x);
  const spanY = Math.max(1, bounds.max_y - bounds.min_y);
  const leftPct = ((position.x - bounds.min_x) / spanX) * 100;
  const topPct = ((bounds.max_y - position.y) / spanY) * 100;
  return {
    leftPct: Math.min(100, Math.max(0, leftPct)),
    topPct: Math.min(100, Math.max(0, topPct)),
  };
}

/** Index of the last frame at or before `elapsedMs`; -1 when the timeline is empty. */
export function frameIndexAt(
  timeline: MatchTimeline,
  elapsedMs: number,
): number {
  let index = -1;
  for (let i = 0; i < timeline.frames.length; i += 1) {
    if (timeline.frames[i].timestamp_ms <= elapsedMs) {
      index = i;
    } else {
      break;
    }
  }
  return index;
}

function participantIn(
  frameIndex: number,
  timeline: MatchTimeline,
  puuid: string,
): TimelineParticipantFrame | undefined {
  const frame = timeline.frames[frameIndex];
  return frame?.participants.find((p) => p.puuid === puuid);
}

/**
 * A player's state at `elapsedMs`. Stats come from the preceding frame; the position is
 * interpolated towards the next one so champions glide rather than teleport each minute.
 */
export function participantStateAt(
  timeline: MatchTimeline,
  puuid: string,
  elapsedMs: number,
): TimelineParticipantFrame | undefined {
  const index = frameIndexAt(timeline, elapsedMs);
  if (index < 0) return undefined;

  const current = participantIn(index, timeline, puuid);
  if (!current) return undefined;

  const next = participantIn(index + 1, timeline, puuid);
  const from = timeline.frames[index].timestamp_ms;
  const to = timeline.frames[index + 1]?.timestamp_ms;
  if (!next || to === undefined || to <= from) {
    return current;
  }

  const ratio = Math.min(1, Math.max(0, (elapsedMs - from) / (to - from)));
  return {
    ...current,
    position: {
      x: Math.round(
        current.position.x + (next.position.x - current.position.x) * ratio,
      ),
      y: Math.round(
        current.position.y + (next.position.y - current.position.y) * ratio,
      ),
    },
  };
}

/** The route a player has walked so far, as sampled points up to `elapsedMs`. */
export function pathUpTo(
  timeline: MatchTimeline,
  puuid: string,
  elapsedMs: number,
): TimelinePosition[] {
  const points: TimelinePosition[] = [];
  for (const frame of timeline.frames) {
    if (frame.timestamp_ms > elapsedMs) break;
    const participant = frame.participants.find((p) => p.puuid === puuid);
    if (participant) points.push(participant.position);
  }

  // Finish on the interpolated position so the trail meets the champion marker.
  const head = participantStateAt(timeline, puuid, elapsedMs);
  if (head) points.push(head.position);
  return points;
}

export function eventsUpTo(
  timeline: MatchTimeline,
  elapsedMs: number,
  types: readonly string[],
): TimelineEvent[] {
  const wanted = new Set(types);
  return timeline.events.filter(
    (event) => event.timestamp_ms <= elapsedMs && wanted.has(event.type),
  );
}

/**
 * Skill points spent per slot by `elapsedMs`, as [Q, W, E, R].
 * Riot numbers the slots 1-4 in that order.
 */
export function skillPointsAt(
  timeline: MatchTimeline,
  puuid: string,
  elapsedMs: number,
): [number, number, number, number] {
  const spent: [number, number, number, number] = [0, 0, 0, 0];
  for (const event of timeline.events) {
    if (event.timestamp_ms > elapsedMs) continue;
    if (event.type !== "SKILL_LEVEL_UP") continue;
    if (event.actor_puuid !== puuid) continue;
    const slot = event.skill_slot;
    if (slot && slot >= 1 && slot <= 4) {
      spent[slot - 1] += 1;
    }
  }
  return spent;
}

/**
 * Items held at `elapsedMs`, in purchase order.
 *
 * Riot carries the undone item on `beforeId`/`afterId` rather than `itemId`, which the
 * backend does not store, so an undo drops the most recent purchase instead.
 */
export function itemsAt(
  timeline: MatchTimeline,
  puuid: string,
  elapsedMs: number,
): number[] {
  const held: number[] = [];

  for (const event of timeline.events) {
    if (event.timestamp_ms > elapsedMs) continue;
    if (event.actor_puuid !== puuid) continue;

    if (event.type === "ITEM_PURCHASED" && event.item_id) {
      held.push(event.item_id);
      continue;
    }
    if (event.type === "ITEM_UNDO") {
      held.pop();
      continue;
    }
    if (
      (event.type === "ITEM_SOLD" || event.type === "ITEM_DESTROYED") &&
      event.item_id
    ) {
      const index = held.lastIndexOf(event.item_id);
      if (index >= 0) held.splice(index, 1);
    }
  }

  return held;
}

/** Kill count for and against a player by `elapsedMs`. */
export function killsAndDeathsAt(
  timeline: MatchTimeline,
  puuid: string,
  elapsedMs: number,
): { kills: number; deaths: number } {
  let kills = 0;
  let deaths = 0;
  for (const event of timeline.events) {
    if (event.timestamp_ms > elapsedMs) continue;
    if (event.type !== "CHAMPION_KILL") continue;
    if (event.actor_puuid === puuid) kills += 1;
    if (event.victim_puuid === puuid) deaths += 1;
  }
  return { kills, deaths };
}

/** Objectives a team had taken by `elapsedMs`, counted from the timeline's events. */
export interface ObjectiveTally {
  readonly tower: number;
  readonly inhibitor: number;
  readonly dragon: number;
  readonly baron: number;
  readonly riftHerald: number;
}

/**
 * Riot reports a `BUILDING_KILL` against the team that *lost* the building, and an
 * `ELITE_MONSTER_KILL` for the team that took it, so buildings count when the team id
 * is the other side's, monsters when it is this one's.
 */
export function objectivesAt(
  timeline: MatchTimeline,
  teamId: number,
  elapsedMs: number,
): ObjectiveTally {
  let tower = 0;
  let inhibitor = 0;
  let dragon = 0;
  let baron = 0;
  let riftHerald = 0;

  for (const event of timeline.events) {
    if (event.timestamp_ms > elapsedMs) continue;

    if (event.type === "BUILDING_KILL" && event.team_id !== teamId) {
      if (event.building_type === "INHIBITOR_BUILDING") inhibitor += 1;
      else tower += 1;
      continue;
    }

    if (event.type === "ELITE_MONSTER_KILL" && event.team_id === teamId) {
      const monster = event.monster_type ?? "";
      if (monster === "BARON_NASHOR") baron += 1;
      else if (monster === "RIFTHERALD") riftHerald += 1;
      else dragon += 1;
    }
  }

  return { tower, inhibitor, dragon, baron, riftHerald };
}

/** Everything the map-analysis table shows for one moment of one match. */
export interface AnalysisSnapshot {
  readonly elapsedMs: number;
  readonly viewer?: TimelineParticipantFrame;
  /** Team totals and averages at the same moment. */
  readonly team: {
    readonly health: number;
    readonly damage: number;
    readonly armor: number;
    readonly movementSpeed: number;
    readonly level: number;
  } | null;
  readonly skillPoints: readonly [number, number, number, number];
  /** Items held right now, oldest first. */
  readonly items: readonly number[];
  readonly objectives: ObjectiveTally | null;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length,
  );
}

export function buildAnalysisSnapshot(
  timeline: MatchTimeline,
  viewerPuuid: string | undefined,
  teamPuuids: readonly string[],
  teamId: number | undefined,
  elapsedMs: number,
): AnalysisSnapshot {
  const index = frameIndexAt(timeline, elapsedMs);
  const frame = index >= 0 ? timeline.frames[index] : undefined;
  const mates = frame
    ? frame.participants.filter((p) => teamPuuids.includes(p.puuid))
    : [];

  return {
    elapsedMs,
    viewer: viewerPuuid
      ? participantStateAt(timeline, viewerPuuid, elapsedMs)
      : undefined,
    team:
      mates.length > 0
        ? {
            health: mates.reduce((sum, p) => sum + p.health, 0),
            damage: mates.reduce((sum, p) => sum + p.damage_to_champions, 0),
            armor: average(mates.map((p) => p.armor)),
            movementSpeed: average(mates.map((p) => p.movement_speed)),
            level: average(mates.map((p) => p.level)),
          }
        : null,
    skillPoints: viewerPuuid
      ? skillPointsAt(timeline, viewerPuuid, elapsedMs)
      : [0, 0, 0, 0],
    items: viewerPuuid ? itemsAt(timeline, viewerPuuid, elapsedMs) : [],
    objectives:
      teamId === undefined ? null : objectivesAt(timeline, teamId, elapsedMs),
  };
}

/** `mm:ss` for a millisecond offset into the game. */
export function formatTimelineClock(elapsedMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
