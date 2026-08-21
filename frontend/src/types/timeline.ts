/**
 * Match-V5 timeline, re-keyed to PUUID by the backend so it joins straight onto the
 * scoreboard in `types/match.ts`.
 * @see GET /api/v1/matches/{matchId}/timeline
 */

/** A point in Riot's map coordinate space, not pixels. See `lib/timeline.ts`. */
export interface TimelinePosition {
  readonly x: number;
  readonly y: number;
}

/** Extent of the playable map, used to project a position onto the minimap image. */
export interface MapBounds {
  readonly min_x: number;
  readonly min_y: number;
  readonly max_x: number;
  readonly max_y: number;
}

/** One player's state at one frame. Riot samples these once a minute. */
export interface TimelineParticipantFrame {
  readonly puuid: string;
  readonly position: TimelinePosition;
  readonly level: number;
  readonly damage_to_champions: number;
  readonly xp: number;
  readonly cs: number;
  readonly current_gold: number;
  readonly total_gold: number;
  readonly health: number;
  readonly health_max: number;
  readonly armor: number;
  readonly magic_resist: number;
  readonly attack_damage: number;
  readonly ability_power: number;
  readonly movement_speed: number;
}

export interface TimelineFrame {
  readonly timestamp_ms: number;
  readonly participants: readonly TimelineParticipantFrame[];
}

export type TimelineEventType =
  | "CHAMPION_KILL"
  | "BUILDING_KILL"
  | "ELITE_MONSTER_KILL"
  | "WARD_PLACED"
  | "SKILL_LEVEL_UP"
  | "LEVEL_UP"
  | "ITEM_PURCHASED"
  | "ITEM_SOLD"
  | "ITEM_DESTROYED"
  | "ITEM_UNDO";

/** Fields not carried by a given event type are null. */
export interface TimelineEvent {
  readonly timestamp_ms: number;
  readonly type: TimelineEventType | string;
  readonly position: TimelinePosition | null;
  /** Killer, ward placer or item buyer. */
  readonly actor_puuid: string | null;
  readonly victim_puuid: string | null;
  readonly assist_puuids: readonly string[];
  readonly team_id: number | null;
  readonly item_id: number | null;
  /** 1-4 for Q, W, E, R. */
  readonly skill_slot: number | null;
  readonly level: number | null;
  readonly monster_type: string | null;
  readonly building_type: string | null;
  readonly lane_type: string | null;
  readonly ward_type: string | null;
}

export interface TimelineParticipantSummary {
  readonly puuid: string;
  /** Ground covered over the whole game, in Riot map units. */
  readonly distance_travelled: number;
}

export interface MatchTimeline {
  readonly match_id: string;
  readonly frame_interval_ms: number;
  readonly game_duration_ms: number;
  readonly map_id: number;
  readonly map_bounds: MapBounds;
  readonly participants: readonly TimelineParticipantSummary[];
  readonly frames: readonly TimelineFrame[];
  readonly events: readonly TimelineEvent[];
}
