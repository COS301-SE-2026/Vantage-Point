import { useEffect, useRef, useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Code, GuideSection, SubHeading } from "./GuideSection";
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

type SurfaceSwatch = {
  name: string;
  /** Tailwind utility the app actually writes. */
  utility: string;
  /** Token name in theme.css. */
  token: string;
  /** Declared value, verbatim. These are literals, not computed. */
  value: string;
  usage: string;
};

/**
 * The dashboard palette.
 *
 * Three greys carry the depth, two hairlines carry the structure, and gold is
 * the only accent. Win and loss are the sole semantic colours. Anything that
 * needs more emphasis earns it with type or spacing, not another hue.
 *
 * These live in `@theme inline`, so Tailwind compiles the value straight into
 * the utility and never emits a runtime custom property. That is why they are
 * listed verbatim here rather than read from computed styles like the shadcn
 * tokens below.
 */
const SURFACE_SWATCHES: SurfaceSwatch[] = [
  {
    name: "Canvas",
    utility: "bg-vp-canvas",
    token: "--color-vp-canvas",
    value: "#0b0c0f",
    usage: "The ground the shell sits on: page background, header band",
  },
  {
    name: "Surface",
    utility: "bg-vp-surface",
    token: "--color-vp-surface",
    value: "#131519",
    usage: "One step up: panels, the sidebar rail, the auth card",
  },
  {
    name: "Raised",
    utility: "bg-vp-raised",
    token: "--color-vp-raised",
    value: "#1b1e25",
    usage: "Two steps up: stat tiles, inputs, the active rail row",
  },
  {
    name: "Line",
    utility: "border-vp-line",
    token: "--color-vp-line",
    value: "rgba(255, 255, 255, 0.09)",
    usage: "The hairline between one surface and the next",
  },
  {
    name: "Line strong",
    utility: "border-vp-line-strong",
    token: "--color-vp-line-strong",
    value: "rgba(255, 255, 255, 0.18)",
    usage: "Edges that are the control: ghost buttons, dashed empty states",
  },
  {
    name: "Ink",
    utility: "text-vp-ink",
    token: "--color-vp-ink",
    value: "#eceef2",
    usage: "Primary text, headings, table figures",
  },
  {
    name: "Dim",
    utility: "text-vp-dim",
    token: "--color-vp-dim",
    value: "#9ba0a9",
    usage: "Secondary text, panel captions, inactive rail labels",
  },
  {
    name: "Faint",
    utility: "text-vp-faint",
    token: "--color-vp-faint",
    value: "#6b7079",
    usage: "Tertiary text and placeholders. Not for running copy",
  },
  {
    name: "Gold",
    utility: "text-vp-gold",
    token: "--color-vp-gold",
    value: "#e0b46c",
    usage: "The only accent: active markers, primary buttons, eyebrows, focus",
  },
  {
    name: "Gold dim",
    utility: "text-vp-gold-dim",
    token: "--color-vp-gold-dim",
    value: "#a97f3e",
    usage: "The gold's shadow end. Reserved for gradients and pressed states",
  },
  {
    name: "Win",
    utility: "text-vp-win",
    token: "--color-vp-win",
    value: "#46c97e",
    usage: "Victory outcomes, positive deltas",
  },
  {
    name: "Loss",
    utility: "text-vp-loss",
    token: "--color-vp-loss",
    value: "#e2565c",
    usage: "Defeats, errors, negative deltas",
  },
];

/**
 * The shadcn token set. Still live, because the vendored primitives in
 * `components/ui/` are written against it, and every surface that renders them
 * does so inside a `dark` subtree. These are read from the computed styles of
 * this page, which is itself `dark`, so the swatches show the values the
 * primitives actually resolve.
 */
const SEMANTIC_TOKENS: { name: string; source: string; usage: string }[] = [
  {
    name: "Background",
    source: "background",
    usage: "Popover and card ground",
  },
  { name: "Foreground", source: "foreground", usage: "Primitive text colour" },
  {
    name: "Primary",
    source: "primary",
    usage: "Default Button and Badge fill",
  },
  {
    name: "Primary foreground",
    source: "primary-foreground",
    usage: "Label on primary",
  },
  { name: "Secondary", source: "secondary", usage: "Secondary variant fill" },
  { name: "Muted", source: "muted", usage: "Subtle primitive backgrounds" },
  {
    name: "Muted foreground",
    source: "muted-foreground",
    usage: "Helper text inside primitives",
  },
  { name: "Accent", source: "accent", usage: "Hover fill on ghost controls" },
  {
    name: "Destructive",
    source: "destructive",
    usage: "Destructive variant, invalid fields",
  },
  { name: "Border", source: "border", usage: "Primitive outlines" },
  { name: "Input", source: "input", usage: "Field borders" },
  { name: "Ring", source: "ring", usage: "focus-visible ring on primitives" },
];

type ContrastPair = {
  label: string;
  fg: string;
  bg: string;
  context: string;
};

/**
 * Every pairing the dark product actually puts on screen. Faint is included
 * precisely because it does not reach AA for body text: it is a placeholder
 * and metadata colour, and the table is where that limit is recorded.
 */
const CONTRAST_PAIRS: ContrastPair[] = [
  {
    label: "Ink on canvas",
    fg: "#eceef2",
    bg: "#0b0c0f",
    context: "Body copy, headings",
  },
  {
    label: "Ink on surface",
    fg: "#eceef2",
    bg: "#131519",
    context: "Panel copy, table figures",
  },
  {
    label: "Ink on raised",
    fg: "#eceef2",
    bg: "#1b1e25",
    context: "Input text, stat values",
  },
  {
    label: "Dim on surface",
    fg: "#9ba0a9",
    bg: "#131519",
    context: "Secondary copy, panel captions",
  },
  {
    label: "Faint on surface",
    fg: "#6b7079",
    bg: "#131519",
    context: "Placeholders and metadata only",
  },
  {
    label: "Gold on canvas",
    fg: "#e0b46c",
    bg: "#0b0c0f",
    context: "Eyebrows, active markers",
  },
  {
    label: "Gold on surface",
    fg: "#e0b46c",
    bg: "#131519",
    context: "Accent copy inside panels",
  },
  {
    label: "Black on gold",
    fg: "#000000",
    bg: "#e0b46c",
    context: "Primary button label",
  },
  {
    label: "Win on surface",
    fg: "#46c97e",
    bg: "#131519",
    context: "Victory rows",
  },
  {
    label: "Loss on surface",
    fg: "#e2565c",
    bg: "#131519",
    context: "Defeat rows, error notes",
  },
];

type ResolvedToken = {
  name: string;
  source: string;
  usage: string;
  hex: string;
  rgb: string;
  hsl: string;
};

function SurfaceCard({ swatch }: Readonly<{ swatch: SurfaceSwatch }>) {
  return (
    <article className="overflow-hidden rounded-xl border border-vp-line bg-vp-surface">
      <div
        className="h-20 border-b border-vp-line"
        style={{ backgroundColor: swatch.value }}
        aria-hidden
      />
      <div className="space-y-1.5 p-4">
        <h4 className="text-[15px] font-bold text-vp-ink">{swatch.name}</h4>
        <p className="text-[13px] leading-relaxed text-vp-dim">
          {swatch.usage}
        </p>
        <dl className="mt-2.5 space-y-1 font-mono text-[11px]">
          <div className="flex gap-2">
            <dt className="w-14 shrink-0 text-vp-faint">Class</dt>
            <dd className="text-vp-gold">{swatch.utility}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-14 shrink-0 text-vp-faint">Token</dt>
            <dd className="min-w-0 break-all text-vp-ink">{swatch.token}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-14 shrink-0 text-vp-faint">Value</dt>
            <dd className="min-w-0 break-all text-vp-ink">{swatch.value}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

function TokenCard({ token }: Readonly<{ token: ResolvedToken }>) {
  return (
    <article className="overflow-hidden rounded-xl border border-vp-line bg-vp-surface">
      <div
        className="h-16 border-b border-vp-line"
        style={{ backgroundColor: token.hex }}
        aria-hidden
      />
      <div className="space-y-1 p-4">
        <h4 className="text-[15px] font-bold text-vp-ink">{token.name}</h4>
        <p className="text-[13px] leading-relaxed text-vp-dim">{token.usage}</p>
        <dl className="mt-2.5 space-y-1 font-mono text-[11px]">
          <div className="flex gap-2">
            <dt className="w-10 shrink-0 text-vp-faint">Var</dt>
            <dd className="min-w-0 break-all text-vp-gold">--{token.source}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-10 shrink-0 text-vp-faint">HEX</dt>
            <dd className="text-vp-ink">{token.hex}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-10 shrink-0 text-vp-faint">RGB</dt>
            <dd className="text-vp-ink">{token.rgb}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-10 shrink-0 text-vp-faint">HSL</dt>
            <dd className="text-vp-ink">{token.hsl}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

function levelBadgeVariant(
  level: ContrastLevel,
): "default" | "secondary" | "destructive" | "outline" {
  if (level === "AAA" || level === "AA") return "default";
  if (level === "AA Large") return "secondary";
  return "destructive";
}

export function ColourSection() {
  /**
   * Token values are read from this node rather than `<html>`: the `dark`
   * class lives on the page wrapper, so reading the document element would
   * report the light `:root` values while the page renders the dark ones.
   */
  const scopeRef = useRef<HTMLDivElement>(null);
  const [tokens, setTokens] = useState<ResolvedToken[]>([]);
  const [pairs, setPairs] = useState<
    {
      label: string;
      context: string;
      ratio: number;
      level: ContrastLevel;
      fg: string;
      bg: string;
    }[]
  >([]);

  useEffect(() => {
    const scope = scopeRef.current ?? undefined;

    setTokens(
      SEMANTIC_TOKENS.map((t) => {
        const raw = readCssVar(`--${t.source}`, scope);
        const formats = colorFormatsFromCss(raw);
        return {
          ...t,
          hex: formats?.hex ?? raw,
          rgb: formats?.rgb ?? raw,
          hsl: formats?.hsl ?? "n/a",
        };
      }),
    );

    setPairs(
      CONTRAST_PAIRS.map((p) => {
        const fg: Rgb | null = parseCssColor(p.fg);
        const bg: Rgb | null = parseCssColor(p.bg);
        const ratio = fg && bg ? contrastRatio(fg, bg) : 0;
        return {
          label: p.label,
          context: p.context,
          ratio,
          level: classifyContrast(ratio),
          fg: p.fg,
          bg: p.bg,
        };
      }),
    );
  }, []);

  return (
    <GuideSection
      id="colour"
      eyebrow="01. Colour"
      title="Colour palette"
      description="Vantage Point is one dark theme, not a light theme with a dark mode. Three greys carry the depth, two hairlines carry the structure, and gold is the only accent. Win and loss are the only other colours in the system."
      delayMs={40}
    >
      <div ref={scopeRef}>
        <p className="mb-6 max-w-3xl text-[15px] leading-relaxed text-vp-dim">
          The palette lives in <Code>styles/theme.css</Code> as{" "}
          <Code>--color-vp-*</Code> tokens and reaches components as ordinary
          Tailwind utilities. Because they are declared in{" "}
          <Code>@theme inline</Code>, Tailwind compiles the value into the class
          and emits no runtime variable: read the token from the stylesheet, not
          from <Code>getComputedStyle</Code>.
        </p>

        <SubHeading>Surface palette</SubHeading>
        <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SURFACE_SWATCHES.map((s) => (
            <SurfaceCard key={s.name} swatch={s} />
          ))}
        </div>

        <SubHeading>Depth in practice</SubHeading>
        <div className="mb-12 rounded-xl border border-vp-line bg-vp-canvas p-5">
          <p className="mb-4 text-[13px] text-vp-faint">
            Canvas, then surface, then raised. Each step is a panel on the one
            below it, separated by a hairline rather than a shadow.
          </p>
          <div className="rounded-xl border border-vp-line bg-vp-surface p-5">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-vp-dim">
              Panel
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Win rate", value: "58%", tone: "text-vp-gold" },
                { label: "Wins", value: "24", tone: "text-vp-win" },
                { label: "Losses", value: "17", tone: "text-vp-loss" },
              ].map((tile) => (
                <div
                  key={tile.label}
                  className="rounded-lg border border-vp-line bg-vp-raised px-4 py-3"
                >
                  <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-vp-faint">
                    {tile.label}
                  </p>
                  <p
                    className={`mt-1.5 text-[22px] font-bold leading-none tabular-nums ${tile.tone}`}
                  >
                    {tile.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <SubHeading>shadcn tokens (live)</SubHeading>
        <p className="mb-4 max-w-3xl text-[15px] leading-relaxed text-vp-dim">
          The vendored primitives in <Code>components/ui/</Code> are written
          against this set, and every screen that renders one wraps it in{" "}
          <Code>dark</Code>. Values below are read from this page, which is also{" "}
          <Code>dark</Code>, so they match what the primitives resolve at
          runtime. Product surfaces should reach for the vp palette first: these
          are here because the primitives depend on them.
        </p>
        <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tokens.map((t) => (
            <TokenCard key={t.name} token={t} />
          ))}
        </div>

        <SubHeading>WCAG 2.2 contrast</SubHeading>
        <p className="mb-4 max-w-2xl text-[15px] leading-relaxed text-vp-dim">
          Every pairing the product puts on screen, measured against the surface
          it sits on. Target is AA, with AAA preferred for running copy. Faint
          is listed because it does not reach AA for body text: it is a
          placeholder and metadata colour, and that limit belongs on the record.
        </p>
        <div className="overflow-x-auto rounded-xl border border-vp-line">
          <table className="w-full min-w-[640px] border-collapse text-[14px]">
            <thead>
              <tr className="border-b border-vp-line bg-vp-surface text-left">
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-vp-dim">
                  Pairing
                </th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-vp-dim">
                  Context
                </th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-vp-dim">
                  Sample
                </th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-vp-dim">
                  Ratio
                </th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-vp-dim">
                  Level
                </th>
              </tr>
            </thead>
            <tbody>
              {pairs.map((p) => (
                <tr
                  key={p.label}
                  className="border-b border-vp-line last:border-0"
                >
                  <td className="px-4 py-3 text-vp-ink">{p.label}</td>
                  <td className="px-4 py-3 text-vp-dim">{p.context}</td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-block rounded px-2 py-1 text-[13px]"
                      style={{ color: p.fg, backgroundColor: p.bg }}
                    >
                      Aa
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-vp-dim">
                    {formatRatio(p.ratio)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={levelBadgeVariant(p.level)}>
                      {p.level}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </GuideSection>
  );
}
