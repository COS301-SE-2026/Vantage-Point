import { NO_VALUE, type MapAnalysisRow } from "../components/MapAnalysisTable";
import type { ParticipantDetail, TeamDetail } from "../types/match";

/**
 * Builds the five rows of Figma "Table Body" (32:512).
 *
 * The design's label set is reproduced exactly. Several of those labels —
 * Health, Armor, Movement Speed, Level and the skill slots — describe per-frame
 * champion state that only the Riot match *timeline* carries;
 * `MatchDetailResponse` has no field for them, so they render as NO_VALUE rather
 * than as invented numbers. Damage, the item slots and the objectives are real.
 */
function sumDamage(team: TeamDetail | undefined): string {
  if (!team) return NO_VALUE;
  const total = team.participants.reduce(
    (running, p) => running + p.damage_to_champions,
    0,
  );
  return total.toLocaleString();
}

function itemAt(viewer: ParticipantDetail | undefined, index: number): number {
  return viewer?.items[index] ?? 0;
}

export function buildMapAnalysisRows(
  viewer: ParticipantDetail | undefined,
  team: TeamDetail | undefined,
): readonly MapAnalysisRow[] {
  const objectives = team?.objectives;
  const objectiveValue = (count: number | undefined): string =>
    count === undefined ? NO_VALUE : String(count);

  // The Herald reads as taken/not-taken in the design rather than as a count.
  let riftHeraldValue: string;
  if (objectives === undefined) {
    riftHeraldValue = NO_VALUE;
  } else {
    riftHeraldValue = objectives.rift_herald > 0 ? "Killed" : "0";
  }

  return [
    {
      id: "health",
      teamLabel: "Health",
      teamValue: NO_VALUE,
      playerLabel: "Health",
      playerValue: NO_VALUE,
      skillLabel: "SkillSlot_1",
      skillValue: NO_VALUE,
      itemLabel: "Item_1",
      itemId: itemAt(viewer, 0),
      objectiveLabel: "Towers",
      objectiveValue: objectiveValue(objectives?.tower),
    },
    {
      id: "damage",
      teamLabel: "Damage",
      teamValue: sumDamage(team),
      playerLabel: "Damage",
      playerValue:
        viewer === undefined
          ? NO_VALUE
          : viewer.damage_to_champions.toLocaleString(),
      skillLabel: "SkillSlot_2",
      skillValue: NO_VALUE,
      itemLabel: "Item_2",
      itemId: itemAt(viewer, 1),
      objectiveLabel: "Dragons",
      objectiveValue: objectiveValue(objectives?.dragon),
    },
    {
      id: "armor",
      teamLabel: "Armor",
      teamValue: NO_VALUE,
      playerLabel: "Armor",
      playerValue: NO_VALUE,
      skillLabel: "SkillSlot_3",
      skillValue: NO_VALUE,
      itemLabel: "Item_3",
      itemId: itemAt(viewer, 2),
      objectiveLabel: "Baron",
      objectiveValue: objectiveValue(objectives?.baron),
    },
    {
      id: "movement-speed",
      teamLabel: "Movement Speed",
      teamValue: NO_VALUE,
      playerLabel: "Movement Speed",
      playerValue: NO_VALUE,
      skillLabel: "SkillSlot_4",
      skillValue: NO_VALUE,
      itemLabel: "Item_4",
      itemId: itemAt(viewer, 3),
      objectiveLabel: "Inhibitor",
      objectiveValue: objectiveValue(objectives?.inhibitor),
    },
    {
      id: "level",
      teamLabel: "Level",
      teamValue: NO_VALUE,
      playerLabel: "Level",
      playerValue: NO_VALUE,
      // The Skills column of this row is replaced by the replay transport.
      skillLabel: "",
      skillValue: "",
      itemLabel: "Item_5",
      itemId: itemAt(viewer, 4),
      objectiveLabel: "Rift Herald",
      objectiveValue: riftHeraldValue,
    },
  ];
}
