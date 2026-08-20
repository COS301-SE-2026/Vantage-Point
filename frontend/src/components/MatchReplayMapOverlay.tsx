import { useMemo } from "react";
import { championIconUrl } from "../lib/ddragon";
import {
  eventsUpTo,
  participantStateAt,
  pathUpTo,
  projectPosition,
} from "../lib/timeline";
import type { ParticipantDetail } from "../types/match";
import type { MatchTimeline } from "../types/timeline";

export interface ReplayOverlayToggles {
  readonly kills: boolean;
  readonly deaths: boolean;
  readonly path: boolean;
}

interface MatchReplayMapOverlayProps {
  readonly timeline: MatchTimeline;
  readonly players: readonly ParticipantDetail[];
  /** Team per player, from the scoreboard — decides the colour of paths and markers. */
  readonly teamIdByPuuid: ReadonlyMap<string, number>;
  readonly selectedPuuids: ReadonlySet<string>;
  readonly elapsedMs: number;
  readonly toggles: ReplayOverlayToggles;
}

/** Blue side reads #07f across the app; red side is the defeat red. */
function teamColour(teamId: number | undefined): string {
  return teamId === 200 ? "#e03b3b" : "#0077ff";
}

/**
 * Everything drawn on top of the minimap: walked routes, kill and death markers, and a
 * champion portrait at each tracked player's current position.
 *
 * Coordinates arrive as percentages of the map's own box, so this layer scales with the
 * image and needs no knowledge of its pixel size.
 */
export default function MatchReplayMapOverlay({
  timeline,
  players,
  teamIdByPuuid,
  selectedPuuids,
  elapsedMs,
  toggles,
}: Readonly<MatchReplayMapOverlayProps>) {
  const bounds = timeline.map_bounds;

  // With nobody picked in the player list, follow everyone rather than blanking the map.
  const tracked = useMemo(
    () =>
      selectedPuuids.size > 0
        ? players.filter((p) => selectedPuuids.has(p.puuid))
        : players,
    [players, selectedPuuids],
  );

  const trackedPuuids = useMemo(
    () => new Set(tracked.map((player) => player.puuid)),
    [tracked],
  );

  const paths = useMemo(() => {
    if (!toggles.path) return [];
    return tracked.map((player) => ({
      puuid: player.puuid,
      colour: teamColour(teamIdByPuuid.get(player.puuid)),
      points: pathUpTo(timeline, player.puuid, elapsedMs)
        .map((position) => projectPosition(position, bounds))
        .map((point) => `${point.leftPct},${point.topPct}`)
        .join(" "),
    }));
  }, [toggles.path, tracked, teamIdByPuuid, timeline, elapsedMs, bounds]);

  const killMarkers = useMemo(() => {
    if (!toggles.kills && !toggles.deaths) return [];

    return eventsUpTo(timeline, elapsedMs, ["CHAMPION_KILL"]).flatMap(
      (event) => {
        const position = event.position;
        if (!position) return [];

        const isKill =
          toggles.kills &&
          event.actor_puuid !== null &&
          trackedPuuids.has(event.actor_puuid);
        const isDeath =
          toggles.deaths &&
          event.victim_puuid !== null &&
          trackedPuuids.has(event.victim_puuid);
        if (!isKill && !isDeath) return [];

        return [
          {
            key: `${event.timestamp_ms}-${event.victim_puuid ?? "?"}`,
            minute: Math.floor(event.timestamp_ms / 60000),
            point: projectPosition(position, bounds),
            isDeath,
          },
        ];
      },
    );
  }, [
    toggles.kills,
    toggles.deaths,
    timeline,
    elapsedMs,
    trackedPuuids,
    bounds,
  ]);

  const markers = useMemo(
    () =>
      tracked.flatMap((player) => {
        const state = participantStateAt(timeline, player.puuid, elapsedMs);
        if (!state) return [];
        return [
          {
            puuid: player.puuid,
            championName: player.champion_name,
            point: projectPosition(state.position, bounds),
            colour: teamColour(teamIdByPuuid.get(player.puuid)),
            level: state.level,
          },
        ];
      }),
    [tracked, timeline, elapsedMs, bounds, teamIdByPuuid],
  );

  return (
    <div
      className="pointer-events-none absolute inset-0"
      data-name="replay-overlay"
      aria-hidden
    >
      {/* preserveAspectRatio="none" lets the 0-100 viewBox track the map's box exactly. */}
      <svg
        className="absolute inset-0 size-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {paths.map((path) => (
          <polyline
            key={path.puuid}
            points={path.points}
            fill="none"
            stroke={path.colour}
            strokeWidth={2}
            strokeOpacity={0.7}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      {killMarkers.map((marker) => (
        <span
          key={marker.key}
          title={`${marker.minute}′`}
          className={`absolute size-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white/80 ${
            marker.isDeath ? "bg-vp-faint" : "bg-[#e11d2e]"
          }`}
          style={{
            left: `${marker.point.leftPct}%`,
            top: `${marker.point.topPct}%`,
          }}
        />
      ))}

      {markers.map((marker) => (
        <span
          key={marker.puuid}
          className="absolute flex size-[26px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-black/40"
          style={{
            left: `${marker.point.leftPct}%`,
            top: `${marker.point.topPct}%`,
            borderColor: marker.colour,
          }}
        >
          <img
            src={championIconUrl(marker.championName)}
            alt=""
            className="size-full rounded-full object-cover"
          />
          <span className="absolute -bottom-1 -right-1 rounded-full bg-black/80 px-[3px] text-[9px] leading-[12px] tabular-nums text-vp-ink">
            {marker.level}
          </span>
        </span>
      ))}
    </div>
  );
}
