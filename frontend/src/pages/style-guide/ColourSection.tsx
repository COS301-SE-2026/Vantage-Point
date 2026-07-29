import { useEffect, useState } from "react";
import { Badge } from "../../components/ui/badge";
import { GuideSection } from "./GuideSection";
import {
  classifyContrast,
  colorFormatsFromCss,
  contrastRatio,
  formatRatio,
  parseCssColor,
  readCssVar,
  type ContrastLevel,
  type Rgb,
} from "./contrast";

type SwatchDef = {
  name: string;
  /** CSS variable name without --, or literal hex */
  source: string;
  usage: string;
  kind: "token" | "hex";
};

const SEMANTIC_SWATCHES: SwatchDef[] = [
  {
    name: "Background",
    source: "background",
    usage: "Page and card surfaces",
    kind: "token",
  },
  {
    name: "Foreground",
    source: "foreground",
    usage: "Primary text",
    kind: "token",
  },
  {
    name: "Primary",
    source: "primary",
    usage: "Primary actions, emphasis",
    kind: "token",
  },
  {
    name: "Primary foreground",
    source: "primary-foreground",
    usage: "Text on primary",
    kind: "token",
  },
  {
    name: "Secondary",
    source: "secondary",
    usage: "Secondary surfaces",
    kind: "token",
  },
  {
    name: "Muted",
    source: "muted",
    usage: "Subtle UI backgrounds",
    kind: "token",
  },
  {
    name: "Muted foreground",
    source: "muted-foreground",
    usage: "Secondary / helper text",
    kind: "token",
  },
  {
    name: "Accent",
    source: "accent",
    usage: "Hover / highlight surfaces",
    kind: "token",
  },
  {
    name: "Destructive",
    source: "destructive",
    usage: "Errors, destructive actions",
    kind: "token",
  },
  {
    name: "Border",
    source: "border",
    usage: "Dividers and outlines",
    kind: "token",
  },
  {
    name: "Input background",
    source: "input-background",
    usage: "Form fields (shadcn Input)",
    kind: "token",
  },
  {
    name: "Ring",
    source: "ring",
    usage: "Focus rings on interactive controls",
    kind: "token",
  },
];

const APP_SWATCHES: SwatchDef[] = [
  {
    name: "Body text",
    source: "#1e1e1e",
    usage: "Labels, match rows, profile copy (light)",
    kind: "hex",
  },
  {
    name: "Strong emphasis",
    source: "#0b0b0b",
    usage: "Auth links (e.g. Sign up)",
    kind: "hex",
  },
  {
    name: "Secondary text",
    source: "#525252",
    usage: "Section labels, metadata (light)",
    kind: "hex",
  },
  {
    name: "Muted dark text",
    source: "#929292",
    usage: "Secondary text in device-dark",
    kind: "hex",
  },
  {
    name: "Placeholder",
    source: "#b3b3b3",
    usage: "Auth input placeholders",
    kind: "hex",
  },
  {
    name: "Primary button",
    source: "#2c2c2c",
    usage: "Sign in / register CTAs",
    kind: "hex",
  },
  {
    name: "Button label",
    source: "#f5f5f5",
    usage: "Text on dark CTAs",
    kind: "hex",
  },
  {
    name: "Device-dark canvas",
    source: "#181818",
    usage: "Auth / match pages under prefers-color-scheme: dark",
    kind: "hex",
  },
  {
    name: "Device-dark surface",
    source: "#2a2a2a",
    usage: "Cards, scoreboards in dark theme",
    kind: "hex",
  },
  {
    name: "Victory / success",
    source: "#1e7e34",
    usage: "Win outcome (light); dark uses #18c840 accents",
    kind: "hex",
  },
  {
    name: "Defeat / error",
    source: "#c44a4a",
    usage: "Loss outcome (light); dark uses #e03b3b accents",
    kind: "hex",
  },
  {
    name: "Blue side (LoL)",
    source: "#4a7fd4",
    usage: "Match detail team 100 (informational)",
    kind: "hex",
  },
  {
    name: "Warning accent",
    source: "#b45309",
    usage: "Warning / caution affordances",
    kind: "hex",
  },
];

type ContrastPair = {
  label: string;
  fg: string;
  bg: string;
  fgKind: "token" | "hex";
  bgKind: "token" | "hex";
  context: string;
};

const CONTRAST_PAIRS: ContrastPair[] = [
  {
    label: "Body on white",
    fg: "#1e1e1e",
    bg: "#ffffff",
    fgKind: "hex",
    bgKind: "hex",
    context: "Body text",
  },
  {
    label: "Muted on white",
    fg: "muted-foreground",
    bg: "background",
    fgKind: "token",
    bgKind: "token",
    context: "Secondary text",
  },
  {
    label: "Primary on primary-fg",
    fg: "primary-foreground",
    bg: "primary",
    fgKind: "token",
    bgKind: "token",
    context: "Primary button",
  },
  {
    label: "Auth CTA label",
    fg: "#f5f5f5",
    bg: "#2c2c2c",
    fgKind: "hex",
    bgKind: "hex",
    context: "Auth primary action",
  },
  {
    label: "Destructive on white",
    fg: "destructive",
    bg: "background",
    fgKind: "token",
    bgKind: "token",
    context: "Error text",
  },
  {
    label: "Victory on white",
    fg: "#1e7e34",
    bg: "#ffffff",
    fgKind: "hex",
    bgKind: "hex",
    context: "Success / win",
  },
  {
    label: "Defeat on white",
    fg: "#c44a4a",
    bg: "#ffffff",
    fgKind: "hex",
    bgKind: "hex",
    context: "Error / loss",
  },
  {
    label: "Placeholder on white",
    fg: "#b3b3b3",
    bg: "#ffffff",
    fgKind: "hex",
    bgKind: "hex",
    context: "Placeholder (large / non-body)",
  },
  {
    label: "White on device-dark",
    fg: "#ffffff",
    bg: "#181818",
    fgKind: "hex",
    bgKind: "hex",
    context: "Body text in dark theme",
  },
  {
    label: "Muted on device-dark",
    fg: "#929292",
    bg: "#181818",
    fgKind: "hex",
    bgKind: "hex",
    context: "Secondary text in dark theme",
  },
];

function resolveColor(source: string, kind: "token" | "hex"): string {
  if (kind === "hex") return source;
  return readCssVar(`--${source}`);
}

function toRgb(source: string, kind: "token" | "hex"): Rgb | null {
  return parseCssColor(resolveColor(source, kind));
}

function levelBadgeVariant(
  level: ContrastLevel,
): "default" | "secondary" | "destructive" | "outline" {
  if (level === "AAA" || level === "AA") return "default";
  if (level === "AA Large") return "secondary";
  return "destructive";
}

type ResolvedSwatch = SwatchDef & {
  hex: string;
  rgb: string;
  hsl: string;
};

function SwatchCard({ swatch }: { swatch: ResolvedSwatch }) {
  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card device-dark:border-[#2c2c2c] device-dark:bg-[#1e1e1e]">
      <div
        className="h-24 border-b border-border device-dark:border-[#2c2c2c]"
        style={{ backgroundColor: swatch.hex }}
        aria-hidden
      />
      <div className="space-y-1.5 p-3 font-['Inter',sans-serif] text-xs">
        <h3 className="text-sm font-semibold text-[#1e1e1e] device-dark:text-white">
          {swatch.name}
        </h3>
        <p className="text-[#525252] device-dark:text-[#b7b7b7]">
          {swatch.usage}
        </p>
        <dl className="mt-2 space-y-0.5 font-mono text-[11px] text-[#1e1e1e] device-dark:text-white">
          <div className="flex gap-2">
            <dt className="w-8 shrink-0 text-muted-foreground device-dark:text-[#929292]">
              HEX
            </dt>
            <dd>{swatch.hex}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-8 shrink-0 text-muted-foreground device-dark:text-[#929292]">
              RGB
            </dt>
            <dd>{swatch.rgb}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-8 shrink-0 text-muted-foreground device-dark:text-[#929292]">
              HSL
            </dt>
            <dd>{swatch.hsl}</dd>
          </div>
          {swatch.kind === "token" && (
            <div className="flex gap-2">
              <dt className="w-8 shrink-0 text-muted-foreground device-dark:text-[#929292]">
                Var
              </dt>
              <dd>--{swatch.source}</dd>
            </div>
          )}
        </dl>
      </div>
    </article>
  );
}

export function ColourSection() {
  const [swatches, setSwatches] = useState<ResolvedSwatch[]>([]);
  const [pairs, setPairs] = useState<
    {
      label: string;
      context: string;
      ratio: number;
      level: ContrastLevel;
      fgHex: string;
      bgHex: string;
    }[]
  >([]);

  useEffect(() => {
    const all = [...SEMANTIC_SWATCHES, ...APP_SWATCHES];
    const resolved: ResolvedSwatch[] = all.map((s) => {
      const raw = resolveColor(s.source, s.kind);
      const formats = colorFormatsFromCss(raw);
      return {
        ...s,
        hex: formats?.hex ?? raw,
        rgb: formats?.rgb ?? raw,
        hsl: formats?.hsl ?? "n/a",
      };
    });
    setSwatches(resolved);

    setPairs(
      CONTRAST_PAIRS.map((p) => {
        const fg = toRgb(p.fg, p.fgKind);
        const bg = toRgb(p.bg, p.bgKind);
        if (!fg || !bg) {
          return {
            label: p.label,
            context: p.context,
            ratio: 0,
            level: "Fail" as ContrastLevel,
            fgHex: p.fg,
            bgHex: p.bg,
          };
        }
        const ratio = contrastRatio(fg, bg);
        return {
          label: p.label,
          context: p.context,
          ratio,
          level: classifyContrast(ratio),
          fgHex: colorFormatsFromCss(resolveColor(p.fg, p.fgKind))?.hex ?? "",
          bgHex: colorFormatsFromCss(resolveColor(p.bg, p.bgKind))?.hex ?? "",
        };
      }),
    );
  }, []);

  const semantic = swatches.filter((s) => s.kind === "token");
  const app = swatches.filter((s) => s.kind === "hex");

  return (
    <GuideSection
      id="colour"
      eyebrow="01. Colour"
      title="Colour palette"
      description="Primary, secondary, and accent colours from theme.css tokens, plus the hex values used on auth and match screens. Aim for WCAG AA at least; AAA for body text when you can."
      delayMs={40}
    >
      <p className="mb-6 max-w-3xl font-['Inter',sans-serif] text-sm text-[#525252] device-dark:text-[#b7b7b7]">
        Vantage Point uses semantic design tokens (shadcn / Tailwind),
        screen-specific hex values, and a{" "}
        <code className="text-xs">device-dark:</code> variant (
        <code className="text-xs">prefers-color-scheme: dark</code>) for auth,
        landing, and match surfaces. Kept separate from shadcn{" "}
        <code className="text-xs">.dark</code> so hardcoded Figma light panels
        can opt in. Values below are read from computed styles where possible.
      </p>

      <h3 className="mb-4 font-['Inter',sans-serif] text-sm font-semibold uppercase tracking-wide text-[#1e1e1e] device-dark:text-white">
        Semantic tokens
      </h3>
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {semantic.map((s) => (
          <SwatchCard key={s.name} swatch={s} />
        ))}
      </div>

      <h3 className="mb-4 font-['Inter',sans-serif] text-sm font-semibold uppercase tracking-wide text-[#1e1e1e] device-dark:text-white">
        Application UI colours
      </h3>
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {app.map((s) => (
          <SwatchCard key={s.name} swatch={s} />
        ))}
      </div>

      <h3 className="mb-3 font-['Inter',sans-serif] text-sm font-semibold uppercase tracking-wide text-[#1e1e1e] device-dark:text-white">
        WCAG 2.2 contrast
      </h3>
      <p className="mb-4 max-w-2xl font-['Inter',sans-serif] text-sm text-[#525252] device-dark:text-[#b7b7b7]">
        Contrast ratios for foreground / background pairings used in the UI.
        Target: WCAG 2.2 AA minimum; AAA preferred for body copy.
      </p>
      <div className="overflow-x-auto rounded-lg border border-border device-dark:border-[#2c2c2c]">
        <table className="w-full min-w-[640px] border-collapse font-['Inter',sans-serif] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/60 text-left device-dark:border-[#2c2c2c] device-dark:bg-[#2a2a2a] device-dark:text-white">
              <th className="px-4 py-3 font-semibold">Pairing</th>
              <th className="px-4 py-3 font-semibold">Context</th>
              <th className="px-4 py-3 font-semibold">Sample</th>
              <th className="px-4 py-3 font-semibold">Ratio</th>
              <th className="px-4 py-3 font-semibold">Level</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((p) => (
              <tr
                key={p.label}
                className="border-b border-border last:border-0 device-dark:border-[#2c2c2c]"
              >
                <td className="px-4 py-3 text-[#1e1e1e] device-dark:text-white">
                  {p.label}
                </td>
                <td className="px-4 py-3 text-[#525252] device-dark:text-[#b7b7b7]">
                  {p.context}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-block rounded px-2 py-1 text-xs font-medium"
                    style={{ color: p.fgHex, backgroundColor: p.bgHex }}
                  >
                    Aa
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs device-dark:text-[#b7b7b7]">
                  {formatRatio(p.ratio)}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={levelBadgeVariant(p.level)}>{p.level}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GuideSection>
  );
}
