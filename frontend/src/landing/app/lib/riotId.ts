export function parseRiotId(riotId: string): { gameName: string; tagLine: string } {
  const trimmed = riotId.trim();
  const idx = trimmed.lastIndexOf("#");
  if (idx <= 0 || idx === trimmed.length - 1) {
    throw new Error("Riot ID must include a tag, e.g. Player#EUW");
  }
  const gameName = trimmed.slice(0, idx).trim();
  const tagLine = trimmed.slice(idx + 1).trim();
  if (!gameName || !tagLine) {
    throw new Error("Riot ID must include both name and tag");
  }
  return { gameName, tagLine };
}
