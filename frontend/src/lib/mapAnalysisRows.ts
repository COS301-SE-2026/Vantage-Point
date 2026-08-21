import { NO_VALUE, type MapAnalysisRow } from "../components/MapAnalysisTable";
import type { ChampionAbilities, ItemNames } from "./ddragonData";
import type { ParticipantDetail, TeamDetail } from "../types/match";
import type { AnalysisSnapshot } from "./timeline";

/**
 * Builds the five rows of Figma "Table Body" (32:512).
 *
 * Health, Armor, Movement Speed, Level and the skill slots describe per-frame champion
 * state that only the Riot match *timeline* carries. When a snapshot is passed they read
 * the frame at the replay clock; without one (an old match Riot has no timeline for, or
 * one that has not loaded yet) they fall back to NO_VALUE rather than to invented numbers.
 *
 * Damage, the item slots and the objectives work either way: a snapshot makes them track
 * the clock, and the scoreboard supplies the end-of-game figures otherwise.
 *
 * The Skills and Items columns name what they show. Riot's data carries neither name:
 * an ability is a slot number and an item is an id, so both come from Data Dragon via
 * `names`, and fall back to the slot letter and to the bare id when it is unreachable.
 */
export interface MapAnalysisNames {
  /** The viewer champion's four spells and passive; null until Data Dragon answers. */
  readonly abilities: ChampionAbilities | null;
  readonly items: ItemNames;
}

const EMPTY_NAMES: MapAnalysisNames = { abilities: null, items: new Map() };

/** Riot orders the spell slots Q, W, E, R; the fifth row shows the passive. */
const SLOT_LETTERS = ["Q", "W", "E", "R"] as const;

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

/** An empty slot says so; a known id is named, and an unknown one keeps its id. */
function itemLabel(itemId: number, items: ItemNames): string {
  if (!itemId) return "Empty";
  return items.get(itemId) ?? `Item ${String(itemId)}`;
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

/** "Q · Switcheroo!" where the champion is known, and plain "Q" where it is not. */
function skillLabel(
  abilities: ChampionAbilities | null,
  slotIndex: number,
): string {
  const letter = SLOT_LETTERS[slotIndex];
  const name = abilities?.spells[slotIndex];
  return name ? `${letter} · ${name}` : letter;
}

/** Points spent in a slot by the replay clock. */
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
  names: MapAnalysisNames = EMPTY_NAMES,
): readonly MapAnalysisRow[] {
  const liveObjectives = snapshot?.objectives ?? null;
  const objectives = team?.objectives;
  const { abilities, items } = names;

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

  // A passive is never levelled by hand, so the slot reports whether the champion
  // is on the field rather than a point count that would always read zero.
  let passiveValue = NO_VALUE;
  if (snapshot) {
    passiveValue = viewerFrame ? "Active" : "0";
  }

  const itemIds = [0, 1, 2, 3, 4].map((index) =>
    itemAt(viewer, snapshot, index),
  );

  return [
    {
      id: "health",
      teamLabel: "Health",
      teamValue: teamStats ? teamStats.health.toLocaleString() : NO_VALUE,
      playerLabel: "Health",
      playerValue: healthValue(viewerFrame?.health, viewerFrame?.health_max),
      skillLabel: skillLabel(abilities, 0),
      skillValue: skillValue(snapshot, 0),
      itemLabel: itemLabel(itemIds[0], items),
      itemId: itemIds[0],
      objectiveLabel: "Towers",
      objectiveValue: objectiveValue(liveObjectives?.tower, objectives?.tower),
    },
    {
      id: "damage",
      teamLabel: "Damage",
      teamValue: teamDamage,
      playerLabel: "Damage",
      playerValue: playerDamage,
      skillLabel: skillLabel(abilities, 1),
      skillValue: skillValue(snapshot, 1),
      itemLabel: itemLabel(itemIds[1], items),
      itemId: itemIds[1],
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
      skillLabel: skillLabel(abilities, 2),
      skillValue: skillValue(snapshot, 2),
      itemLabel: itemLabel(itemIds[2], items),
      itemId: itemIds[2],
      objectiveLabel: "Baron",
      objectiveValue: objectiveValue(liveObjectives?.baron, objectives?.baron),
    },
    {
      id: "movement-speed",
      teamLabel: "Movement Speed",
      teamValue: numeric(teamStats?.movementSpeed),
      playerLabel: "Movement Speed",
      playerValue: numeric(viewerFrame?.movement_speed),
      skillLabel: skillLabel(abilities, 3),
      skillValue: skillValue(snapshot, 3),
      itemLabel: itemLabel(itemIds[3], items),
      itemId: itemIds[3],
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
      skillLabel: abilities ? `Passive · ${abilities.passive}` : "Passive",
      skillValue: passiveValue,
      itemLabel: itemLabel(itemIds[4], items),
      itemId: itemIds[4],
      objectiveLabel: "Rift Herald",
      objectiveValue: riftHeraldValue,
    },
  ];
}
