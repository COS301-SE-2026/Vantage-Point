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

const px = ([x, y]) => [x * MAP, y * MAP];

function svgShell(body) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${MAP}" height="${MAP}" viewBox="0 0 ${MAP} ${MAP}">${body}</svg>`,
  );
}

/** The "before": where the player actually died, as a risk heatmap. */
function actualOverlay() {
  const blobs = ENGAGEMENTS.map((e) => {
    const [x, y] = px(e.actual);
    return `<circle cx="${x}" cy="${y}" r="86" fill="url(#risk)"/>`;
  }).join("");

  const markers = ENGAGEMENTS.map((e) => {
    const [x, y] = px(e.actual);
    return `
      <circle cx="${x}" cy="${y}" r="13" fill="#0b0b0d" stroke="#ff4d4f" stroke-width="2.5"/>
      <path d="M${x - 5.5} ${y - 5.5} L${x + 5.5} ${y + 5.5} M${x + 5.5} ${y - 5.5} L${x - 5.5} ${y + 5.5}"
            stroke="#ff4d4f" stroke-width="2.6" stroke-linecap="round"/>`;
  }).join("");

  return svgShell(`
    <defs>
      <radialGradient id="risk">
        <stop offset="0%" stop-color="#ff2d2d" stop-opacity="0.55"/>
        <stop offset="55%" stop-color="#ff5a3c" stop-opacity="0.22"/>
        <stop offset="100%" stop-color="#ff5a3c" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${MAP}" height="${MAP}" fill="#12060a" opacity="0.34"/>
    ${blobs}${markers}
    <g font-family="sans-serif" font-size="19" font-weight="700" fill="#ffffff">
      <rect x="28" y="28" width="196" height="42" rx="10" fill="#0b0b0dcc" stroke="#ff4d4f66"/>
      <circle cx="48" cy="49" r="5" fill="#ff4d4f"/>
      <text x="63" y="56">Your deaths</text>
    </g>`);
}

/** The "after": the positions the model would have held instead. */
function optimalOverlay() {
  const vectors = ENGAGEMENTS.map((e) => {
    const [ax, ay] = px(e.actual);
    const [ox, oy] = px(e.optimal);
    return `<line x1="${ax}" y1="${ay}" x2="${ox}" y2="${oy}"
              stroke="#67e8f9" stroke-width="2.4" stroke-dasharray="7 6"
              opacity="0.85" marker-end="url(#tip)"/>`;
  }).join("");

  const ghosts = ENGAGEMENTS.map((e) => {
    const [x, y] = px(e.optimal);
    return `
      <circle cx="${x}" cy="${y}" r="34" fill="url(#safe)"/>
      <circle cx="${x}" cy="${y}" r="17" fill="none" stroke="#67e8f9" stroke-width="2" opacity="0.75"/>
      <circle cx="${x}" cy="${y}" r="7" fill="#e0b46c"/>`;
  }).join("");

  const faded = ENGAGEMENTS.map((e) => {
    const [x, y] = px(e.actual);
    return `<circle cx="${x}" cy="${y}" r="9" fill="none" stroke="#ff4d4f" stroke-width="2" opacity="0.5"/>`;
  }).join("");

  return svgShell(`
    <defs>
      <radialGradient id="safe">
        <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.45"/>
        <stop offset="100%" stop-color="#22d3ee" stop-opacity="0"/>
      </radialGradient>
      <marker id="tip" viewBox="0 0 10 10" refX="8" refY="5"
              markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" fill="#67e8f9"/>
      </marker>
    </defs>
    <rect width="${MAP}" height="${MAP}" fill="#04121a" opacity="0.34"/>
    ${faded}${vectors}${ghosts}
    <g font-family="sans-serif" font-size="19" font-weight="700" fill="#ffffff">
      <rect x="28" y="28" width="248" height="42" rx="10" fill="#0b0b0dcc" stroke="#67e8f966"/>
      <circle cx="48" cy="49" r="5" fill="#e0b46c"/>
      <text x="63" y="56">Coach&#8217;s position</text>
    </g>`);
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
