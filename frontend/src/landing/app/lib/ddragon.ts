const DDRAGON_VERSION = "14.24.1";
const DDRAGON_BASE = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}`;

/** Riot Data Dragon file keys differ from in-game display names. */
const CHAMPION_DDRAGON_KEY_OVERRIDES: Record<string, string> = {
  "Cho'Gath": "Chogath",
  "Dr. Mundo": "DrMundo",
  "Jarvan IV": "JarvanIV",
  "Kai'Sa": "KaiSa",
  "Kog'Maw": "KogMaw",
  "K'Sante": "KSante",
  "Lee Sin": "LeeSin",
  "Master Yi": "MasterYi",
  "Miss Fortune": "MissFortune",
  "Nunu & Willump": "Nunu",
  "Rek'Sai": "RekSai",
  "Renata Glasc": "Renata",
  "Tahm Kench": "TahmKench",
  "Twisted Fate": "TwistedFate",
  "Vel'Koz": "Velkoz",
  "Wukong": "MonkeyKing",
  "Xin Zhao": "XinZhao",
};

/** Maps champion display name to Data Dragon asset key (e.g. "Lee Sin" → "LeeSin"). */
export function championDdragonKey(championName: string): string {
  const trimmed = championName.trim();
  const override = CHAMPION_DDRAGON_KEY_OVERRIDES[trimmed];
  if (override) {
    return override;
  }
  return trimmed.replace(/[^a-zA-Z]/g, "");
}

/** Champion square icon by display name (e.g. "Jinx", "Lee Sin"). */
export function championIconUrl(championName: string): string {
  return `${DDRAGON_BASE}/img/champion/${championDdragonKey(championName)}.png`;
}

/** Champion splash art (default skin) for card thumbnails. */
export function championSplashUrl(championName: string, skinNum = 0): string {
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championDdragonKey(championName)}_${skinNum}.jpg`;
}

/** Item icon by numeric item id; 0 yields empty slot placeholder. */
export function itemIconUrl(itemId: number): string | null {
  if (itemId === 0) return null;
  return `${DDRAGON_BASE}/img/item/${itemId}.png`;
}

const SUMMONER_SPELL_KEYS: Record<number, string> = {
  1: "SummonerBoost",
  4: "SummonerFlash",
  6: "SummonerHaste",
  7: "SummonerHeal",
  11: "SummonerSmite",
  12: "SummonerTeleport",
  14: "SummonerDot",
  21: "SummonerExhaust",
};

/** Summoner spell icon by Riot spell id. */
export function summonerSpellIconUrl(spellId: number): string | null {
  const key = SUMMONER_SPELL_KEYS[spellId];
  if (!key) return null;
  return `${DDRAGON_BASE}/img/spell/${key}.png`;
}
