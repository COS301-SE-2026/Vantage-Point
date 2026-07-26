/** Map Analysis page assets exported from Figma "MapAnalysisView" (32:961). */

/**
 * map_mini (32:422) — the 180×180 minimap tile at 2×.
 * Figma exports this node at its render bounds, which include the 4/4/4 drop
 * shadow bleeding 8px right and bottom; `map-mini-tile.png` is that export
 * cropped back to the tile so CSS can draw the shadow itself.
 */
export { default as mapMini } from "./map-mini-tile.png";
/*
 * `map-mini-export.png` (the uncropped Figma export, shadow bleed included) and
 * `map-mini.png` (the full-resolution source) stay on disk for re-cropping, but
 * are deliberately not re-exported: an unused re-export here still emits the
 * asset into the bundle.
 */

/** Transport controls in the last ParticipantRow — Figma "Table Cell" 32:822. */
/** Play (32:950) — 19.1×24.1 leaf in a 30×30 box. */
export { default as iconPlay } from "./icon-play.svg";
/** Pause — Play's counterpart for the running state, same 19.1×24.1 box. */
export { default as iconPause } from "./icon-pause.svg";
/** Rewind (32:956) — 26.6×19.1 leaf in a 30×30 box. */
export { default as iconRewind } from "./icon-rewind.svg";

/** Fallback item art when Data Dragon has no icon for a slot. */
export { default as bootsItemIcon } from "./boots-item.png";

/*
 * The AI recommendation cards on this page (32:458) reuse the Material
 * arrow_drop_down first exported for the replay panel — see
 * `assets/images/match-replay/icon-arrow-drop-down.svg`.
 */
