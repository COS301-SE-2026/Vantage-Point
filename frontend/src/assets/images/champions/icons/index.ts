/**
 * Champion square icons exported from Figma (Profile Page, node 14:592).
 * Data Dragon serves the same 128×128 squares, so these act as the offline /
 * rate-limited fallback while keeping the page pixel-identical to the design.
 */
import ahri from "./ahri.png";
import garen from "./garen.png";
import jinx from "./jinx.png";
import leeSin from "./lee-sin.png";
import thresh from "./thresh.png";

const CHAMPION_ICONS: Record<string, string> = {
  Ahri: ahri,
  Garen: garen,
  Jinx: jinx,
  "Lee Sin": leeSin,
  Thresh: thresh,
};

/** Locally exported champion square, or null when only Data Dragon has it. */
export function localChampionIcon(championName: string): string | null {
  return CHAMPION_ICONS[championName.trim()] ?? null;
}
