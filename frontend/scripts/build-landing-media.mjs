/**
 * Derives the landing page's imagery from art the repo already ships, so the
 * new sections add source rather than a pile of unexplained binaries.
 *
 *   node frontend/scripts/build-landing-media.mjs
 *
 * Outputs (all WebP, all committed):
 *   landing/showcase-replay.webp       crop of the Match Replay Figma export
 *   landing/positioning-actual.webp    Summoner's Rift + the deaths you took
 *   landing/positioning-optimal.webp   the same rift + where the coach wanted you
 *   team/<member>.webp                 square avatars from .github/images
 */
import { mkdir, readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const IMAGES = join(__dirname, "../src/assets/images");
const REPO_IMAGES = join(__dirname, "../../.github/images");

const MAP = 900; // px, square — the rift renders 1:1

/** Points are rift-relative (0..1) so they survive a change of MAP size. */
const ENGAGEMENTS = [
  { actual: [0.55, 0.46], optimal: [0.46, 0.55], label: "River" },
  { actual: [0.78, 0.74], optimal: [0.7, 0.82], label: "Bot" },
  { actual: [0.36, 0.2], optimal: [0.28, 0.28], label: "Top" },
  { actual: [0.66, 0.28], optimal: [0.56, 0.36], label: "Raptors" },
  { actual: [0.24, 0.64], optimal: [0.3, 0.7], label: "Drake" },
];

/** The walked route the deaths happen along, blue base outward. */
const ROUTE = [
  [0.12, 0.88],
  [0.3, 0.84],
  [0.48, 0.8],
  [0.66, 0.78],
  [0.78, 0.74],
  [0.72, 0.62],
  [0.6, 0.54],
  [0.55, 0.46],
  [0.62, 0.36],
  [0.66, 0.28],
];

/**
 * The marker vocabulary is MatchReplayMapOverlay's, scaled from the ~500px map
 * the replay card draws to this 900px export, so the landing page shows the
 * same icons the product does rather than a second set invented here:
 *
 *   death   size-[10px] rounded-full bg-vp-faint ring-2 ring-white/80
 *   path    <polyline> stroke=teamColour(100) width 2 opacity 0.7
 *
 * Anything with no counterpart in the overlay (the correction vector, the
 * ghost) is drawn in the same weights so it reads as part of the same set.
 */
const SCALE = MAP / 500;
const DEATH_R = (10 / 2) * SCALE;
const RING_W = 2 * SCALE;
const PATH_W = 2 * SCALE;
const GHOST_R = (26 / 2) * SCALE;

const TEAM_BLUE = "#0077ff"; // teamColour(100)
const DEATH_FILL = "#6b7079"; // --color-vp-faint
const RING = "#ffffffcc"; // ring-white/80
const CORRECTION = "#22d3ee";
const GHOST = "#e0b46c";

const px = ([x, y]) => [x * MAP, y * MAP];

const routePoints = () =>
  ROUTE.map((p) => px(p).join(","))
    .join(" ");

/** size-[10px] rounded-full bg-vp-faint ring-2 ring-white/80 */
const deathMarker = ([x, y], opacity = 1) => `
  <circle cx="${x}" cy="${y}" r="${DEATH_R}" fill="${DEATH_FILL}" opacity="${opacity}"/>
  <circle cx="${x}" cy="${y}" r="${DEATH_R + RING_W / 2}" fill="none"
          stroke="${RING}" stroke-width="${RING_W}" opacity="${opacity}"/>`;

function svgShell(body) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${MAP}" height="${MAP}" viewBox="0 0 ${MAP} ${MAP}">${body}</svg>`,
  );
}

/** The "before": the route walked, and the deaths it ran into. */
function actualOverlay() {
  const path = `<polyline points="${routePoints()}" fill="none"
      stroke="${TEAM_BLUE}" stroke-width="${PATH_W}" stroke-opacity="0.7"
      stroke-linejoin="round" stroke-linecap="round"/>`;

  const deaths = ENGAGEMENTS.map((e) => deathMarker(px(e.actual))).join("");

  return svgShell(`${path}${deaths}`);
}

/** The "after": the positions the model would have held instead. */
function optimalOverlay() {
  const path = `<polyline points="${routePoints()}" fill="none"
      stroke="${TEAM_BLUE}" stroke-width="${PATH_W}" stroke-opacity="0.25"
      stroke-linejoin="round" stroke-linecap="round"/>`;

  const deaths = ENGAGEMENTS.map((e) => deathMarker(px(e.actual), 0.4)).join("");

  const vectors = ENGAGEMENTS.map((e) => {
    const [ax, ay] = px(e.actual);
    const [ox, oy] = px(e.optimal);
    return `<line x1="${ax}" y1="${ay}" x2="${ox}" y2="${oy}"
              stroke="${CORRECTION}" stroke-width="${PATH_W}"
              stroke-dasharray="${PATH_W * 2} ${PATH_W * 1.6}"
              stroke-linecap="round" opacity="0.9"/>`;
  }).join("");

  // The ghost has no counterpart in the overlay yet, so it borrows the tracked
  // player's geometry — a 26px disc over a dark fill — ringed in the gold the
  // rest of the page uses for the coach.
  const ghosts = ENGAGEMENTS.map((e) => {
    const [x, y] = px(e.optimal);
    return `
      <circle cx="${x}" cy="${y}" r="${GHOST_R}" fill="#000000" fill-opacity="0.4"/>
      <circle cx="${x}" cy="${y}" r="${GHOST_R}" fill="none"
              stroke="${GHOST}" stroke-width="${RING_W}"/>`;
  }).join("");

  return svgShell(`${path}${deaths}${vectors}${ghosts}`);
}

async function buildPositioningPair() {
  const base = sharp(join(IMAGES, "match-replay/map-default.webp")).resize(
    MAP,
    MAP,
    { fit: "cover" },
  );
  const raw = await base.toBuffer();

  for (const [name, overlay] of [
    ["positioning-actual", actualOverlay()],
    ["positioning-optimal", optimalOverlay()],
  ]) {
    const out = join(IMAGES, `landing/${name}.webp`);
    await sharp(raw)
      .composite([{ input: overlay, top: 0, left: 0 }])
      .webp({ quality: 86, effort: 6 })
      .toFile(out);
    console.log(
      `${name}.webp  ${((await stat(out)).size / 1024).toFixed(0)}KB`,
    );
  }
}

/**
 * The Figma export is a flow diagram: the app itself is the leftmost panel and
 * the rest is annotation, so only that panel is worth showing off.
 */
async function buildShowcase() {
  const src = join(IMAGES, "match-replay/figma/match-replay-export.png");
  const out = join(IMAGES, "landing/showcase-replay.webp");
  await sharp(src)
    .extract({ left: 8, top: 8, width: 1082, height: 641 })
    .webp({ quality: 90, effort: 6 })
    .toFile(out);
  console.log(
    `showcase-replay.webp  ${((await stat(out)).size / 1024).toFixed(0)}KB`,
  );
}

async function buildTeamAvatars() {
  const dir = join(IMAGES, "team");
  await mkdir(dir, { recursive: true });
  const files = (await readdir(REPO_IMAGES)).filter((f) =>
    /\.(jpe?g|png)$/i.test(f),
  );

  for (const file of files) {
    const slug = file.replace(/\.[^.]+$/, "").toLowerCase();
    if (slug === "logo") continue;
    const out = join(dir, `${slug}.webp`);
    await sharp(join(REPO_IMAGES, file))
      .resize(320, 320, { fit: "cover", position: "top" })
      .webp({ quality: 84, effort: 6 })
      .toFile(out);
    console.log(
      `team/${slug}.webp  ${((await stat(out)).size / 1024).toFixed(0)}KB`,
    );
  }
}

try {
  await buildShowcase();
  await buildPositioningPair();
  await buildTeamAvatars();
} catch (e) {
  console.error(e);
  process.exit(1);
}
