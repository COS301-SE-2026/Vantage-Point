import { useEffect, useState } from "react";
import {
  DASHBOARD_RAIL_WIDTH,
  DASHBOARD_SIDEBAR_WIDTH,
} from "../../lib/dashboardLayout";
import { Code, GuideSection, SubHeading } from "./GuideSection";
import { readCssVar } from "./contrast";

const SPACING = [
  { name: "1", px: "4px" },
  { name: "2", px: "8px" },
  { name: "3", px: "12px" },
  { name: "4", px: "16px" },
  { name: "5", px: "20px" },
  { name: "7", px: "28px" },
  { name: "12", px: "48px" },
  { name: "16", px: "64px" },
];

const BREAKPOINTS = [
  { name: "sm", value: "640px", usage: "Stat tiles go from stacked to a row" },
  { name: "md", value: "768px", usage: "Two-column panel pairs" },
  {
    name: "lg",
    value: "1024px",
    usage: "Auth splits into form and splash; replay splits map from coaching",
  },
  { name: "xl", value: "1280px", usage: "Widest dashboard grids" },
];

const RADII = [
  {
    name: "rounded-lg",
    value: "8px",
    usage: "Buttons, inputs, rail rows, tiles",
  },
  { name: "rounded-xl", value: "12px", usage: "Panels and empty states" },
  { name: "rounded-2xl", value: "16px", usage: "The auth card" },
  { name: "rounded-full", value: "9999px", usage: "Avatars, dots, pills" },
];

const MOTION = [
  {
    name: "animate-vantage-breathe",
    duration: "2.8s",
    easing: "ease-in-out",
    usage: "The mark on the loading screen and the landing hero",
    live: true,
  },
  {
    name: "animate-vantage-dot-fill",
    duration: "2.7s",
    easing: "ease-in-out",
    usage: "Loading dots. Fills from currentColor",
    live: true,
  },
  {
    name: "animate-vantage-progress",
    duration: "1.6s",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    usage: "Indeterminate progress bar on the loading screen",
    live: true,
  },
  {
    name: "animate-scroll",
    duration: "20s",
    easing: "linear",
    usage: "Landing hero band",
    live: true,
  },
  {
    name: "animate-marquee-x",
    duration: "40s (var)",
    easing: "linear",
    usage: "Aceternity moving cards",
    live: true,
  },
  {
    name: "animate-meteor-effect",
    duration: "5s (var)",
    easing: "linear",
    usage: "Aceternity meteors",
    live: true,
  },
  {
    name: "sg-fade-in",
    duration: "0.55s",
    easing: "ease-out",
    usage: "Section entrances on this page",
    live: true,
  },
  {
    name: "animate-vantage-pulse",
    duration: "4.5s",
    easing: "ease-in-out",
    usage: "Retired. Cycled the wordmark through blue, teal, and purple",
    live: false,
  },
];

/** Tokens declared in `:root`, so they are readable at runtime. */
const LIVE_TOKENS = [
  {
    name: "--vp-dash-max",
    purpose: "Max width of a dashboard tab column (PageContainer)",
  },
  {
    name: "--vp-content-max",
    purpose: "Narrower cap used by the metrics column",
  },
  { name: "--vp-chart-grid", purpose: "Radar web and tick lines" },
  {
    name: "--vp-chart-label",
    purpose: "Radar axis labels. Mirrors --color-vp-dim by hand",
  },
  {
    name: "--radius",
    purpose: "Base radius the shadcn primitives derive from",
  },
  { name: "--font-size", purpose: "Root type size" },
];

export function TokensSection() {
  const [live, setLive] = useState<
    { name: string; value: string; purpose: string }[]
  >([]);

  useEffect(() => {
    setLive(
      LIVE_TOKENS.map((t) => ({
        ...t,
        value: readCssVar(t.name) || "not set",
      })),
    );
  }, []);

  return (
    <GuideSection
      id="tokens"
      eyebrow="04. Tokens"
      title="Design tokens"
      description="Where the numbers live. Colour is in @theme inline, layout and chart values are in :root, and the sidebar widths are TypeScript because the rail animates between them. If this page disagrees with the code, the page is the defect."
      delayMs={160}
    >
      <div className="mb-10 grid items-start gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-vp-line bg-vp-surface p-5">
          <h4 className="mb-4 text-[15px] font-bold text-vp-ink">
            Runtime tokens
          </h4>
          <table className="w-full text-[13px]">
            <tbody>
              {live.map((t) => (
                <tr
                  key={t.name}
                  className="border-b border-vp-line last:border-0"
                >
                  <td className="py-2.5 pr-3 align-top font-mono text-[11px] text-vp-gold">
                    {t.name}
                  </td>
                  <td className="py-2.5 pr-3 align-top font-mono text-[11px] text-vp-ink">
                    {t.value}
                  </td>
                  <td className="py-2.5 align-top text-vp-dim">{t.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4 className="mb-2 mt-6 text-[15px] font-bold text-vp-ink">
            Shell measurements
          </h4>
          <p className="mb-3 text-[13px] leading-relaxed text-vp-dim">
            The rail animates between two widths, so they are TypeScript rather
            than CSS: <Code>lib/dashboardLayout.ts</Code>. This card imports
            them, so it cannot drift.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-vp-line bg-vp-raised px-4 py-3">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-vp-faint">
                Sidebar open
              </p>
              <p className="mt-1.5 text-[22px] font-bold leading-none tabular-nums text-vp-ink">
                {DASHBOARD_SIDEBAR_WIDTH}px
              </p>
            </div>
            <div className="rounded-lg border border-vp-line bg-vp-raised px-4 py-3">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-vp-faint">
                Rail collapsed
              </p>
              <p className="mt-1.5 text-[22px] font-bold leading-none tabular-nums text-vp-ink">
                {DASHBOARD_RAIL_WIDTH}px
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-xl border border-vp-line bg-vp-surface p-5">
            <h4 className="mb-2 text-[15px] font-bold text-vp-ink">Radius</h4>
            <p className="mb-4 text-[13px] leading-relaxed text-vp-dim">
              Three steps and a pill. Controls sit at <Code>lg</Code>, the panel
              around them at <Code>xl</Code>, so an element never shares a
              corner radius with its own container.
            </p>
            <div className="mb-4 flex flex-wrap gap-4">
              {RADII.map((r) => (
                <div key={r.name} className="flex flex-col items-center gap-2">
                  <div
                    className={`size-14 border border-vp-line-strong bg-vp-raised ${r.name}`}
                  />
                  <span className="font-mono text-[10px] text-vp-faint">
                    {r.value}
                  </span>
                </div>
              ))}
            </div>
            <ul className="space-y-1 text-[13px] text-vp-dim">
              {RADII.map((r) => (
                <li key={r.name}>
                  <span className="font-mono text-[11px] text-vp-gold">
                    {r.name}
                  </span>{" "}
                  {r.usage}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-vp-line bg-vp-surface p-5">
            <h4 className="mb-2 text-[15px] font-bold text-vp-ink">
              Depth without shadow
            </h4>
            <p className="text-[13px] leading-relaxed text-vp-dim">
              The dark surface has no elevation system. A panel is separated
              from its ground by a lighter fill and a hairline, never by a drop
              shadow, which on a near-black canvas reads as smudge rather than
              lift. The only blur in the product is{" "}
              <Code>backdrop-blur-md</Code> under the sticky header and the auth
              card.
            </p>
          </div>

          <div className="rounded-xl border border-vp-line bg-vp-surface p-5">
            <h4 className="mb-2 text-[15px] font-bold text-vp-ink">
              Known drift
            </h4>
            <ul className="list-disc space-y-2 pl-5 text-[13px] leading-relaxed text-vp-dim">
              <li>
                <Code>.vp-scrollbar</Code> still paints the old Figma light
                spec: a <Code>#b7b7b7</Code> thumb on <Code>#f0f0f0</Code>,
                switching to an <Code>#181818</Code> track only when the device
                theme is dark. The surfaces that use it are always dark now, and
                the track never matches <Code>#0b0c0f</Code>.
              </li>
              <li>
                The radar series is hardcoded to <Code>#22c55e</Code> rather
                than <Code>--color-vp-win</Code>, so the one green on the
                profile panel is not the green the palette defines.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <SubHeading>Spacing</SubHeading>
      <p className="mb-4 max-w-3xl text-[15px] leading-relaxed text-vp-dim">
        Tailwind's 4px base. The shell settles on a few of them: 20px page
        gutters that open to 28px above <Code>sm</Code>, 20px panel padding,
        12px between panels, and 8px to 12px inside a control.
      </p>
      <div className="mb-10 space-y-2">
        {SPACING.map((s) => (
          <div key={s.name} className="flex items-center gap-4">
            <span className="w-20 shrink-0 font-mono text-[11px] text-vp-faint">
              {s.name} / {s.px}
            </span>
            <div
              className="h-3 rounded-sm bg-vp-gold-dim"
              style={{ width: s.px }}
              aria-hidden
            />
          </div>
        ))}
      </div>

      <SubHeading>Breakpoints</SubHeading>
      <div className="mb-10 overflow-x-auto rounded-xl border border-vp-line">
        <table className="w-full min-w-[480px] text-[14px]">
          <thead>
            <tr className="border-b border-vp-line bg-vp-surface text-left">
              <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-vp-dim">
                Token
              </th>
              <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-vp-dim">
                Min width
              </th>
              <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-vp-dim">
                What changes
              </th>
            </tr>
          </thead>
          <tbody>
            {BREAKPOINTS.map((b) => (
              <tr
                key={b.name}
                className="border-b border-vp-line last:border-0"
              >
                <td className="px-4 py-3 font-mono text-[12px] text-vp-gold">
                  {b.name}
                </td>
                <td className="px-4 py-3 font-mono text-[12px] text-vp-ink">
                  {b.value}
                </td>
                <td className="px-4 py-3 text-vp-dim">{b.usage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SubHeading>Motion</SubHeading>
      <div className="overflow-x-auto rounded-xl border border-vp-line">
        <table className="w-full min-w-[620px] text-[14px]">
          <thead>
            <tr className="border-b border-vp-line bg-vp-surface text-left">
              <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-vp-dim">
                Utility
              </th>
              <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-vp-dim">
                Duration
              </th>
              <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-vp-dim">
                Easing
              </th>
              <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-vp-dim">
                Where
              </th>
            </tr>
          </thead>
          <tbody>
            {MOTION.map((m) => (
              <tr
                key={m.name}
                className="border-b border-vp-line last:border-0"
              >
                <td
                  className={`px-4 py-3 font-mono text-[12px] ${m.live ? "text-vp-gold" : "text-vp-faint line-through"}`}
                >
                  {m.name}
                </td>
                <td className="px-4 py-3 font-mono text-[12px] text-vp-ink">
                  {m.duration}
                </td>
                <td className="px-4 py-3 text-vp-dim">{m.easing}</td>
                <td className="px-4 py-3 text-vp-dim">{m.usage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[13px] text-vp-faint">
        The shell adds two motion values of its own: the rail resizes over 0.22s
        with an ease-out curve, and its labels cross-fade in 0.15s.
      </p>
    </GuideSection>
  );
}
