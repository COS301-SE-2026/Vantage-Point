/** Map Analysis page assets exported from Figma "MapAnalysisView" (32:961). */

/**
 * Summoner's_Rift_Minimap 1 (46:463) — the whole Rift, 687×687, drawn flat.
 *
 * The tile this replaces (map_mini, 32:422) was a crop of the painted terrain, so a
 * position projected across its full width landed on whatever happened to be under
 * that fraction of the crop. This one covers the same extent the timeline's
 * `map_bounds` describe, which is what the replay overlay needs to place a champion
 * where they actually stood.
 */
export { default as mapMinimap } from "./summoners-rift-minimap.png";
/*
 * `map-mini-tile.png`, `map-mini-export.png` (the uncropped Figma export, shadow
 * bleed included) and `map-mini.png` (the full-resolution source) stay on disk, but
 * are deliberately not re-exported: an unused re-export here still emits the asset
 * into the bundle.
 */

/** Replay transport glyphs, first drawn into Figma "Table Cell" 32:822. */
/** Play (32:950) — 19.1×24.1 leaf in a 30×30 box. */
export { default as iconPlay } from "./icon-play.svg";
/** Pause — Play's counterpart for the running state, same 19.1×24.1 box. */
export { default as iconPause } from "./icon-pause.svg";
/** Rewind (32:956) — 26.6×19.1 leaf in a 30×30 box. */
export { default as iconRewind } from "./icon-rewind.svg";

/**
 * Figma never drew this page's content on the dark background, so these are the
 * same three leaves stroked white — matching the replay map's transport glyphs
 * (26:1655), which stay white in both themes. The #1e1e1e originals are all but
 * invisible on the dark transport cell.
 */
export { default as iconPlayWhite } from "./icon-play-white.svg";
export { default as iconPauseWhite } from "./icon-pause-white.svg";
export { default as iconRewindWhite } from "./icon-rewind-white.svg";

/** Fallback item art when Data Dragon has no icon for a slot. */
export { default as bootsItemIcon } from "./boots-item.png";

/*
 * The AI recommendation cards on this page (32:458) reuse the Material
 * arrow_drop_down first exported for the replay panel — see
 * `assets/images/match-replay/icon-arrow-drop-down.svg`.
 */
