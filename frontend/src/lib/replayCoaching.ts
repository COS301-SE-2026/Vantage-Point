import type { MatchDetail, ParticipantDetail } from "../types/match";

/**
 * Backs the Figma "AI Coaching comments" panel (55:346).
 *
 * There is no coaching endpoint yet, so the notes are derived locally from the
 * match payload. Each note is a plain statistical read of the scoreboard, not a
 * model prediction — swap this module for the API call once one exists.
 */
export interface ReplayCoachingNote {
  readonly id: string;
  readonly heading: string;
  readonly body: string;
}

/** Broad play pattern a scoreboard line reads as, independent of the assigned lane. */
type PlayPattern = "Support" | "Jungler" | "Carry";

function displayName(player: ParticipantDetail): string {
  return player.riot_id ?? player.champion_name;
}

function perMinute(total: number, gameDurationSeconds: number): number {
  const minutes = Math.max(1, gameDurationSeconds / 60);
  return total / minutes;
}

/** The pattern a player's assigned position is expected to produce. */
function expectedPattern(position: string): PlayPattern {
  const normalized = position.trim().toUpperCase();
  if (normalized === "UTILITY" || normalized === "SUPPORT") return "Support";
  if (normalized === "JUNGLE") return "Jungler";
  return "Carry";
}

/** The pattern the player's farm and vision numbers actually look like. */
function observedPattern(
  player: ParticipantDetail,
  gameDurationSeconds: number,
): PlayPattern {
  const csPerMin = perMinute(player.cs, gameDurationSeconds);
  const visionPerMin = perMinute(player.vision_score, gameDurationSeconds);

  if (csPerMin < 2.5 && visionPerMin >= 0.7) return "Support";
  if (csPerMin >= 5) return "Carry";
  return "Jungler";
}

function allParticipants(match: MatchDetail): readonly ParticipantDetail[] {
  return match.teams.flatMap((team) => [...team.participants]);
}

/**
 * "Champion choices" — names the opposing laner who won the matchup outright,
 * so the suggestion points at a champion the viewer actually played against.
 */
function championChoiceNote(
  match: MatchDetail,
  viewer: ParticipantDetail,
): ReplayCoachingNote | null {
  const opponent = allParticipants(match).find(
    (p) =>
      p.puuid !== viewer.puuid &&
      p.position === viewer.position &&
      p.win !== viewer.win,
  );
  if (!opponent) return null;

  const outfarmed = opponent.cs > viewer.cs;
  const outDamaged = opponent.damage_to_champions > viewer.damage_to_champions;
  if (!outfarmed || !outDamaged) return null;

  return {
    id: "champion-choices",
    heading: "Champion choices",
    body: `${displayName(viewer)}'s playstyle is better suited to play ${opponent.champion_name}`,
  };
}

/**
 * "Player Roles" — flags a player whose farm and vision profile reads as a
 * different role from the one they were assigned.
 */
function playerRoleNote(
  match: MatchDetail,
  viewer: ParticipantDetail,
): ReplayCoachingNote | null {
  const candidates = allParticipants(match).filter(
    (p) => p.puuid !== viewer.puuid,
  );

  const mismatch = candidates.find((player) => {
    const expected = expectedPattern(player.position);
    return observedPattern(player, match.game_duration) !== expected;
  });
  if (!mismatch) return null;

  const expected = expectedPattern(mismatch.position);
  const observed = observedPattern(mismatch, match.game_duration);

  return {
    id: "player-roles",
    heading: "Player Roles",
    body: `${displayName(mismatch)} was playing more like a ${observed} than a ${expected}`,
  };
}

/** Builds the coaching notes shown in the replay's right-hand panel. */
export function buildReplayCoachingNotes(
  match: MatchDetail,
  viewer: ParticipantDetail,
): readonly ReplayCoachingNote[] {
  return [
    championChoiceNote(match, viewer),
    playerRoleNote(match, viewer),
  ].filter((note): note is ReplayCoachingNote => note !== null);
}

/**
 * The three fixed cards of the Map Analysis "AI Coaching bar" (32:690). Same
 * caveat as above — these read the scoreboard, they are not model output.
 */
export function buildMapAnalysisTips(
  match: MatchDetail,
  viewer: ParticipantDetail | undefined,
): readonly ReplayCoachingNote[] {
  const headings = [
    "General Tip",
    "Skill recommendation",
    "Item recommendation",
  ] as const;

  if (!viewer) {
    return headings.map((heading, index) => ({
      id: `tip-${index}`,
      heading,
      body: "Not enough match data to read yet.",
    }));
  }

  const visionPerMin = perMinute(viewer.vision_score, match.game_duration);
  const teamDamage = match.teams
    .flatMap((team) => [...team.participants])
    .filter((p) => p.win === viewer.win)
    .reduce((running, p) => running + p.damage_to_champions, 0);
  const damageShare =
    teamDamage > 0
      ? Math.round((viewer.damage_to_champions / teamDamage) * 100)
      : 0;
  const filledSlots = viewer.items.filter((id) => id !== 0).length;

  return [
    {
      id: "general-tip",
      heading: headings[0],
      body:
        visionPerMin < 1
          ? `Vision score ${viewer.vision_score} (${visionPerMin.toFixed(1)}/min) — ward more on rotations.`
          : `Vision score ${viewer.vision_score} (${visionPerMin.toFixed(1)}/min) is holding up well.`,
    },
    {
      id: "skill-tip",
      heading: headings[1],
      body:
        damageShare < 20
          ? `You dealt ${damageShare}% of team damage — look for more trades.`
          : `You dealt ${damageShare}% of team damage.`,
    },
    {
      id: "item-tip",
      heading: headings[2],
      body:
        filledSlots < 6
          ? `${filledSlots}/6 item slots filled by the end — convert gold sooner.`
          : `Full build completed with ${viewer.gold_earned.toLocaleString()} gold.`,
    },
  ];
}
