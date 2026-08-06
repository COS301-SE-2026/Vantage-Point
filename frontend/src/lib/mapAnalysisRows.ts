import { NO_VALUE, type MapAnalysisRow } from "../components/MapAnalysisTable";
import type { ParticipantDetail, TeamDetail } from "../types/match";
import type { AnalysisSnapshot } from "./timeline";

/**
 * Builds the five rows of Figma "Table Body" (32:512).
 *
 * Health, Armor, Movement Speed, Level and the skill slots describe per-frame champion
 * state that only the Riot match *timeline* carries. When a snapshot is passed they read
 * the frame at the replay clock; without one — an old match Riot has no timeline for, or
 * before it has loaded — they fall back to NO_VALUE rather than to invented numbers.
 *
 * Damage, the item slots and the objectives work either way: a snapshot makes them track
 * the clock, and the scoreboard supplies the end-of-game figures otherwise.
 */
function sumDamage(team: TeamDetail | undefined): string {
  if (!team) return NO_VALUE;
  const total = team.participants.reduce(
    (running, p) => running + p.damage_to_champions,
    0,
  );
  return total.toLocaleString();
}

function itemAt(
  viewer: ParticipantDetail | undefined,
  snapshot: AnalysisSnapshot | undefined,
  index: number,
): number {
  if (snapshot) {
    // The design shows the last five items, so newer purchases push older ones off.
    const held = snapshot.items.slice(-5);
    return held[index] ?? 0;
  }
  return viewer?.items[index] ?? 0;
}

function numeric(value: number | undefined): string {
  return value === undefined ? NO_VALUE : value.toLocaleString();
}

function healthValue(
  current: number | undefined,
  max: number | undefined,
): string {
  if (current === undefined) return NO_VALUE;
  if (!max) return current.toLocaleString();
  return `${current.toLocaleString()}/${max.toLocaleString()}`;
}

/** Q, W, E, R in Riot's slot order; the table labels them SkillSlot_1 to _4. */
function skillValue(
  snapshot: AnalysisSnapshot | undefined,
  slotIndex: number,
): string {
  if (!snapshot) return NO_VALUE;
  return String(snapshot.skillPoints[slotIndex] ?? 0);
}

export function buildMapAnalysisRows(
  viewer: ParticipantDetail | undefined,
  team: TeamDetail | undefined,
  snapshot?: AnalysisSnapshot,
): readonly MapAnalysisRow[] {
  const liveObjectives = snapshot?.objectives ?? null;
  const objectives = team?.objectives;

  const objectiveValue = (
    live: number | undefined,
    final: number | undefined,
  ): string => {
    const count = liveObjectives ? live : final;
    return count === undefined ? NO_VALUE : String(count);
  };

  // The Herald reads as taken/not-taken in the design rather than as a count.
  const heraldCount = liveObjectives
    ? liveObjectives.riftHerald
    : objectives?.rift_herald;
  let riftHeraldValue: string;
  if (heraldCount === undefined) {
    riftHeraldValue = NO_VALUE;
  } else {
    riftHeraldValue = heraldCount > 0 ? "Killed" : "0";
  }

  const teamStats = snapshot?.team ?? null;
  const viewerFrame = snapshot?.viewer;

  const teamDamage = teamStats
    ? teamStats.damage.toLocaleString()
    : sumDamage(team);

  let playerDamage = NO_VALUE;
  if (viewerFrame) {
    playerDamage = viewerFrame.damage_to_champions.toLocaleString();
  } else if (viewer) {
    playerDamage = viewer.damage_to_champions.toLocaleString();
  }

  return [
    {
      id: "health",
      teamLabel: "Health",
      teamValue: teamStats ? teamStats.health.toLocaleString() : NO_VALUE,
      playerLabel: "Health",
      playerValue: healthValue(viewerFrame?.health, viewerFrame?.health_max),
      skillLabel: "SkillSlot_1",
      skillValue: skillValue(snapshot, 0),
      itemLabel: "Item_1",
      itemId: itemAt(viewer, snapshot, 0),
      objectiveLabel: "Towers",
      objectiveValue: objectiveValue(liveObjectives?.tower, objectives?.tower),
    },
    {
      id: "damage",
      teamLabel: "Damage",
      teamValue: teamDamage,
      playerLabel: "Damage",
      playerValue: playerDamage,
      skillLabel: "SkillSlot_2",
      skillValue: skillValue(snapshot, 1),
      itemLabel: "Item_2",
      itemId: itemAt(viewer, snapshot, 1),
      objectiveLabel: "Dragons",
      objectiveValue: objectiveValue(
        liveObjectives?.dragon,
        objectives?.dragon,
      ),
    },
    {
      id: "armor",
      teamLabel: "Armor",
      teamValue: numeric(teamStats?.armor),
      playerLabel: "Armor",
      playerValue: numeric(viewerFrame?.armor),
      skillLabel: "SkillSlot_3",
      skillValue: skillValue(snapshot, 2),
      itemLabel: "Item_3",
      itemId: itemAt(viewer, snapshot, 2),
      objectiveLabel: "Baron",
      objectiveValue: objectiveValue(liveObjectives?.baron, objectives?.baron),
    },
    {
      id: "movement-speed",
      teamLabel: "Movement Speed",
      teamValue: numeric(teamStats?.movementSpeed),
      playerLabel: "Movement Speed",
      playerValue: numeric(viewerFrame?.movement_speed),
      skillLabel: "SkillSlot_4",
      skillValue: skillValue(snapshot, 3),
      itemLabel: "Item_4",
      itemId: itemAt(viewer, snapshot, 3),
      objectiveLabel: "Inhibitor",
      objectiveValue: objectiveValue(
        liveObjectives?.inhibitor,
        objectives?.inhibitor,
      ),
    },
    {
      id: "level",
      teamLabel: "Level",
      teamValue: numeric(teamStats?.level),
      playerLabel: "Level",
      playerValue: numeric(viewerFrame?.level),
      // The Skills column of this row is replaced by the replay transport.
      skillLabel: "",
      skillValue: "",
      itemLabel: "Item_5",
      itemId: itemAt(viewer, snapshot, 4),
      objectiveLabel: "Rift Herald",
      objectiveValue: riftHeraldValue,
    },
  ];
}
