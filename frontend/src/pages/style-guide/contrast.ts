/** Colour parsing and WCAG 2.2 contrast helpers for the live style guide. */

export type Rgb = { r: number; g: number; b: number };

export type ContrastLevel = "AAA" | "AA" | "AA Large" | "Fail";

function clampChannel(n: number): number {
  return Math.min(255, Math.max(0, Math.round(n)));
}

export function parseCssColor(value: string): Rgb | null {
  const v = value.trim().toLowerCase();
  if (!v || v === "transparent") return null;

  const hex = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) {
      h = h
        .split("")
        .map((c) => c + c)
        .join("");
    }
    if (h.length === 8) h = h.slice(0, 6);
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }

  const rgb = v.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/,
  );
  if (rgb) {
    return {
      r: clampChannel(Number(rgb[1])),
      g: clampChannel(Number(rgb[2])),
      b: clampChannel(Number(rgb[3])),
    };
  }

  const rgbSpace = v.match(
    /^rgba?\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)$/,
  );
  if (rgbSpace) {
    return {
      r: clampChannel(Number(rgbSpace[1])),
      g: clampChannel(Number(rgbSpace[2])),
      b: clampChannel(Number(rgbSpace[3])),
    };
  }

  /**
   * Anything else (oklch, colour keywords, lab) is resolved by painting it.
   * Reading `ctx.fillStyle` back is not enough: browsers now round-trip modern
   * colour syntax unchanged, so the string that comes out is the string that
   * went in. Sampling the pixel gives the sRGB the user actually sees.
   */
  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (ctx) {
      // Assigning an invalid colour is a no-op, so the canvas would keep
      // whatever it held and report that as the answer. Priming from two
      // opposite sentinels catches it: a value the canvas accepted lands on
      // the same pixel from both, one it rejected does not.
      const sample = (prime: string): [number, number, number] => {
        ctx.fillStyle = prime;
        ctx.fillStyle = value;
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillRect(0, 0, 1, 1);
        const d = ctx.getImageData(0, 0, 1, 1).data;
        return [d[0], d[1], d[2]];
      };
      const [r, g, b] = sample("#000000");
      const [r2, g2, b2] = sample("#ffffff");
      if (r === r2 && g === g2 && b === b2) return { r, g, b };
    }
  }

  return null;
}

export function rgbToHex({ r, g, b }: Rgb): string {
  return (
    "#" +
    [r, g, b].map((c) => clampChannel(c).toString(16).padStart(2, "0")).join("")
  );
}

export function rgbToCssRgb({ r, g, b }: Rgb): string {
  return `rgb(${clampChannel(r)}, ${clampChannel(g)}, ${clampChannel(b)})`;
}

export function rgbToHsl({ r, g, b }: Rgb): string {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
        break;
      case gn:
        h = ((bn - rn) / d + 2) / 6;
        break;
      default:
        h = ((rn - gn) / d + 4) / 6;
    }
  }

  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

function srgbToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function relativeLuminance({ r, g, b }: Rgb): number {
  return (
    0.2126 * srgbToLinear(r) +
    0.7152 * srgbToLinear(g) +
    0.0722 * srgbToLinear(b)
  );
}

export function contrastRatio(fg: Rgb, bg: Rgb): number {
  const L1 = relativeLuminance(fg);
  const L2 = relativeLuminance(bg);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function classifyContrast(ratio: number): ContrastLevel {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA Large";
  return "Fail";
}

export function formatRatio(ratio: number): string {
  return `${ratio.toFixed(2)}:1`;
}

export function readCssVar(name: string, el?: HTMLElement): string {
  const target = el ?? document.documentElement;
  return getComputedStyle(target).getPropertyValue(name).trim();
}

export function colorFormatsFromCss(value: string): {
  hex: string;
  rgb: string;
  hsl: string;
  rgbObj: Rgb;
} | null {
  const rgbObj = parseCssColor(value);
  if (!rgbObj) return null;
  return {
    hex: rgbToHex(rgbObj),
    rgb: rgbToCssRgb(rgbObj),
    hsl: rgbToHsl(rgbObj),
    rgbObj,
  };
}
