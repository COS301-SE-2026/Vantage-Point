/**
 * Compress landing PNG imports: WebP output, cap width for huge screenshots.
 * Run from repo root: node frontend/scripts/compress-landing-assets.mjs
 */
import { readdir, stat, unlink } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const IMPORTS_ROOT = join(__dirname, "../src/landing/imports");
const MAX_WIDTH = 2048;
const WEBP_QUALITY = 88;

async function walk(dir, out = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else if (e.name.toLowerCase().endsWith(".png")) out.push(p);
  }
  return out;
}

async function convertOne(pngPath) {
  const webpPath = pngPath.replace(/\.png$/i, ".webp");
  const before = (await stat(pngPath)).size;
  const meta = await sharp(pngPath).metadata();
  let img = sharp(pngPath);
  if (meta.width && meta.width > MAX_WIDTH) {
    img = img.resize(MAX_WIDTH, null, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }
  await img
    .webp({
      quality: WEBP_QUALITY,
      alphaQuality: 100,
      effort: 6,
    })
    .toFile(webpPath);
  await unlink(pngPath);
  const after = (await stat(webpPath)).size;
  return { pngPath, webpPath, before, after };
}

async function main() {
  const pngs = await walk(IMPORTS_ROOT);
  let saved = 0;
  for (const p of pngs) {
    const { before, after } = await convertOne(p);
    saved += Math.max(0, before - after);
    console.log(
      `${p.replace(IMPORTS_ROOT, "")}: ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB`,
    );
  }
  console.log(`Done. ${pngs.length} files. ~${(saved / 1024 / 1024).toFixed(2)} MB smaller.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
