/**
 * Display names behind the numeric ids Riot's match data carries.
 *
 * The match and timeline endpoints name nothing: an item is `3006` and an ability is
 * slot `1`. Data Dragon publishes the names for both, as two static JSON files that
 * never change for a given patch, so they are fetched once per session and shared by
 * every screen that needs them.
 *
 * Nothing here is load-bearing. A Data Dragon outage, an offline test run or a patch
 * that has dropped an id all resolve to `undefined`, and the caller falls back to the
 * slot letter or leaves the label out. The numbers behind them are still on screen.
 */

import { championDdragonKey, DDRAGON_BASE } from "./ddragon";
import { useEffect, useState } from "react";

const LOCALE = "en_US";

interface ItemFileEntry {
  readonly name?: unknown;
}

interface ItemFile {
  readonly data?: Record<string, ItemFileEntry>;
}

interface SpellEntry {
  readonly name?: unknown;
}

interface ChampionFileEntry {
  readonly passive?: { readonly name?: unknown };
  readonly spells?: readonly SpellEntry[];
}

interface ChampionFile {
  readonly data?: Record<string, ChampionFileEntry>;
}

/** Q, W, E and R as Riot orders them, plus the passive. */
export interface ChampionAbilities {
  readonly passive: string;
  readonly spells: readonly [string, string, string, string];
}

export type ItemNames = ReadonlyMap<number, string>;

/**
 * Data Dragon answers image requests for anything, so a mocked or offline CDN can
 * return a PNG where JSON was asked for. Parsing is therefore allowed to fail.
 */
async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function asName(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

let itemNamesPromise: Promise<ItemNames> | null = null;

/** Every item id on the current patch mapped to its shop name. */
export function fetchItemNames(): Promise<ItemNames> {
  itemNamesPromise ??= (async () => {
    const file = await fetchJson<ItemFile>(
      `${DDRAGON_BASE}/data/${LOCALE}/item.json`,
    );
    const names = new Map<number, string>();
    for (const [id, entry] of Object.entries(file?.data ?? {})) {
      const name = asName(entry.name);
      const numericId = Number(id);
      if (name && Number.isFinite(numericId)) names.set(numericId, name);
    }
    return names;
  })();
  return itemNamesPromise;
}

const abilitiesByChampion = new Map<
  string,
  Promise<ChampionAbilities | null>
>();

/**
 * The four spell names and the passive for one champion, by the display name the
 * scoreboard carries ("Lee Sin", "Kai'Sa").
 */
export function fetchChampionAbilities(
  championName: string,
): Promise<ChampionAbilities | null> {
  const key = championDdragonKey(championName);
  if (!key) return Promise.resolve(null);

  const cached = abilitiesByChampion.get(key);
  if (cached) return cached;

  const pending = (async () => {
    const file = await fetchJson<ChampionFile>(
      `${DDRAGON_BASE}/data/${LOCALE}/champion/${key}.json`,
    );
    const entry = file?.data?.[key];
    if (!entry) return null;

    const spells = entry.spells ?? [];
    const named = (index: number) => asName(spells[index]?.name);
    // A file that parsed but names no spells is no better than no file at all;
    // the caller's slot letters already say as much.
    if (!named(0)) return null;

    return {
      passive: asName(entry.passive?.name) ?? "Passive",
      spells: [
        named(0) ?? "Q",
        named(1) ?? "W",
        named(2) ?? "E",
        named(3) ?? "R",
      ],
    } satisfies ChampionAbilities;
  })();

  abilitiesByChampion.set(key, pending);
  return pending;
}

/** Item names, empty until the CDN answers and empty forever if it does not. */
export function useItemNames(): ItemNames {
  const [names, setNames] = useState<ItemNames>(() => new Map());

  useEffect(() => {
    let cancelled = false;
    void fetchItemNames().then((loaded) => {
      if (!cancelled) setNames(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return names;
}

/** Ability names for one champion; null while loading and when unavailable. */
export function useChampionAbilities(
  championName: string | undefined,
): ChampionAbilities | null {
  const [abilities, setAbilities] = useState<ChampionAbilities | null>(null);

  useEffect(() => {
    if (!championName) {
      setAbilities(null);
      return undefined;
    }
    let cancelled = false;
    void fetchChampionAbilities(championName).then((loaded) => {
      if (!cancelled) setAbilities(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [championName]);

  return abilities;
}
