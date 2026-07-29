import { useEffect, useState } from "react";
import { GuideSection } from "./GuideSection";
import { readCssVar } from "./contrast";

const SPACING = [
  { name: "1", rem: "0.25rem", px: "4px" },
  { name: "2", rem: "0.5rem", px: "8px" },
  { name: "3", rem: "0.75rem", px: "12px" },
  { name: "4", rem: "1rem", px: "16px" },
  { name: "6", rem: "1.5rem", px: "24px" },
  { name: "8", rem: "2rem", px: "32px" },
  { name: "12", rem: "3rem", px: "48px" },
  { name: "16", rem: "4rem", px: "64px" },
];

const BREAKPOINTS = [
  { name: "sm", value: "640px", usage: "Match list extra columns" },
  { name: "md", value: "768px", usage: "Two-column layout patterns" },
  { name: "lg", value: "1024px", usage: "Wider dashboard content" },
  { name: "xl", value: "1280px", usage: "Desktop-expanded surfaces" },
];

const MOTION = [
  {
    name: "animate-vantage-pulse",
    duration: "4.5s",
    easing: "ease-in-out",
    usage: "Brand wordmark colour cycle",
  },
  {
    name: "animate-vantage-breathe",
    duration: "2.8s",
    easing: "ease-in-out",
    usage: "Loading / hero logo scale",
  },
  {
    name: "animate-vantage-dot-fill",
    duration: "2.7s",
    easing: "ease-in-out",
    usage: "Loading progress dots (currentColor)",
  },
  {
    name: "animate-vantage-progress",
    duration: "1.6s",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    usage: "Indeterminate progress bar",
  },
  {
    name: "sg-fade-in",
    duration: "0.55s",
    easing: "ease-out",
    usage: "Style guide section entrance",
  },
];

export function TokensSection() {
  const [layoutTokens, setLayoutTokens] = useState<
    { name: string; value: string; purpose: string }[]
  >([]);
  const [radiusTokens, setRadiusTokens] = useState<
    { name: string; value: string }[]
  >([]);

  useEffect(() => {
    setLayoutTokens([
      {
        name: "--vp-layout-max",
        value: readCssVar("--vp-layout-max"),
        purpose: "Max dashboard artboard width",
      },
      {
        name: "--vp-content-max",
        value: readCssVar("--vp-content-max"),
        purpose: "Fluid content column cap",
      },
      {
        name: "--vp-dashboard-header",
        value: readCssVar("--vp-dashboard-header"),
        purpose: "Header band (raised for large avatars)",
      },
      {
        name: "--vp-sidebar-width",
        value: readCssVar("--vp-sidebar-width"),
        purpose: "CSS token (JS layout uses 180px panel)",
      },
      {
        name: "--vp-sidebar-left",
        value: readCssVar("--vp-sidebar-left"),
        purpose: "Sidebar left offset token",
      },
      {
        name: "--vp-content-gap",
        value: readCssVar("--vp-content-gap"),
        purpose: "Gap token (JS uses 34px)",
      },
      {
        name: "--vp-chart-grid",
        value: readCssVar("--vp-chart-grid"),
        purpose: "Radar / chart grid stroke",
      },
      {
        name: "--vp-chart-label",
        value: readCssVar("--vp-chart-label"),
        purpose: "Chart label colour (dims in dark)",
      },
      {
        name: "--font-size",
        value: readCssVar("--font-size"),
        purpose: "Root typography size",
      },
    ]);

    const base = readCssVar("--radius") || "0.625rem";
    setRadiusTokens([
      { name: "--radius (lg)", value: base },
      { name: "radius-sm", value: `calc(${base} - 4px)` },
      { name: "radius-md", value: `calc(${base} - 2px)` },
      { name: "radius-xl", value: `calc(${base} + 4px)` },
    ]);
  }, []);

  return (
    <GuideSection
      id="tokens"
      eyebrow="04. Tokens"
      title="Design tokens"
      description="Colour, spacing, radius, shadow, motion, breakpoints, and VP layout / chart tokens. Values mirror theme.css and dashboardLayout.ts. If the guide drifts from code, that is a defect."
      delayMs={160}
    >
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border p-5 device-dark:border-[#2c2c2c]">
          <h3 className="mb-3 font-['Inter',sans-serif] text-sm font-semibold text-[#1e1e1e] device-dark:text-white">
            Layout &amp; chart tokens (live)
          </h3>
          <table className="w-full font-['Inter',sans-serif] text-sm">
            <tbody>
              {layoutTokens.map((t) => (
                <tr key={t.name} className="border-b border-border last:border-0 device-dark:border-[#2c2c2c]">
                  <td className="py-2 pr-3 font-mono text-xs text-[#1e1e1e] device-dark:text-white">
                    {t.name}
                  </td>
                  <td className="py-2 pr-3 font-mono text-xs text-[#525252] device-dark:text-[#929292]">
                    {t.value || "-"}
                  </td>
                  <td className="py-2 text-xs text-[#525252] device-dark:text-[#929292]">
                    {t.purpose}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 font-['Inter',sans-serif] text-xs text-[#525252] device-dark:text-[#929292]">
            JS layout constants: sidebar left 34px, width 180px, content gap
            34px → content open offset 248px (
            <code className="text-[10px]">dashboardLayout.ts</code>).
          </p>
        </div>

        <div className="rounded-lg border border-border p-5 device-dark:border-[#2c2c2c]">
          <h3 className="mb-3 font-['Inter',sans-serif] text-sm font-semibold text-[#1e1e1e] device-dark:text-white">
            Radius &amp; scrollbar
          </h3>
          <div className="mb-4 flex flex-wrap gap-4">
            {radiusTokens.map((r, i) => (
              <div key={r.name} className="flex flex-col items-center gap-2">
                <div
                  className="size-14 border border-[#d9d9d9] bg-muted device-dark:border-[#2c2c2c] device-dark:bg-[#2a2a2a]"
                  style={{
                    borderRadius:
                      i === 0
                        ? "var(--radius)"
                        : i === 1
                          ? "calc(var(--radius) - 4px)"
                          : i === 2
                            ? "calc(var(--radius) - 2px)"
                            : "calc(var(--radius) + 4px)",
                  }}
                />
                <span className="font-mono text-[10px] text-[#525252] device-dark:text-[#929292]">
                  {r.name}
                </span>
              </div>
            ))}
          </div>
          <p className="mb-2 font-['Inter',sans-serif] text-sm text-[#525252] device-dark:text-[#b7b7b7]">
            Custom scrollbar utility{" "}
            <code className="text-xs">.vp-scrollbar</code>: thumb{" "}
            <code className="text-xs">#b7b7b7</code> on track{" "}
            <code className="text-xs">#f0f0f0</code> (light) /{" "}
            <code className="text-xs">#181818</code> (device-dark).
          </p>
          <h3 className="mb-2 mt-4 font-['Inter',sans-serif] text-sm font-semibold text-[#1e1e1e] device-dark:text-white">
            Shadow
          </h3>
          <div className="flex gap-4">
            <div className="flex size-16 items-center justify-center rounded-lg border border-border bg-white shadow-sm font-['Inter',sans-serif] text-[10px] device-dark:border-[#2c2c2c] device-dark:bg-[#1e1e1e] device-dark:text-white">
              sm
            </div>
            <div className="flex size-16 items-center justify-center rounded-lg border border-border bg-white shadow-md font-['Inter',sans-serif] text-[10px] device-dark:border-[#2c2c2c] device-dark:bg-[#1e1e1e] device-dark:text-white">
              md
            </div>
          </div>
        </div>
      </div>

      <h3 className="mb-3 font-['Inter',sans-serif] text-sm font-semibold uppercase tracking-wide text-[#1e1e1e] device-dark:text-white">
        Spacing scale (Tailwind)
      </h3>
      <div className="mb-8 space-y-2">
        {SPACING.map((s) => (
          <div key={s.name} className="flex items-center gap-4">
            <span className="w-16 shrink-0 font-mono text-xs text-[#525252] device-dark:text-[#929292]">
              {s.name} / {s.px}
            </span>
            <div
              className="h-3 rounded-sm bg-[#2c2c2c] device-dark:bg-[#b7b7b7]"
              style={{ width: s.px }}
              aria-hidden
            />
          </div>
        ))}
      </div>

      <h3 className="mb-3 font-['Inter',sans-serif] text-sm font-semibold uppercase tracking-wide text-[#1e1e1e] device-dark:text-white">
        Breakpoints
      </h3>
      <div className="mb-8 overflow-x-auto rounded-lg border border-border device-dark:border-[#2c2c2c]">
        <table className="w-full min-w-[480px] font-['Inter',sans-serif] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/60 text-left device-dark:border-[#2c2c2c] device-dark:bg-[#2a2a2a] device-dark:text-white">
              <th className="px-4 py-3 font-semibold">Token</th>
              <th className="px-4 py-3 font-semibold">Min width</th>
              <th className="px-4 py-3 font-semibold">Usage in product</th>
            </tr>
          </thead>
          <tbody>
            {BREAKPOINTS.map((b) => (
              <tr key={b.name} className="border-b border-border last:border-0 device-dark:border-[#2c2c2c]">
                <td className="px-4 py-3 font-mono text-xs device-dark:text-[#b7b7b7]">{b.name}</td>
                <td className="px-4 py-3 font-mono text-xs device-dark:text-[#b7b7b7]">{b.value}</td>
                <td className="px-4 py-3 text-[#525252] device-dark:text-[#929292]">
                  {b.usage}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-3 font-['Inter',sans-serif] text-sm font-semibold uppercase tracking-wide text-[#1e1e1e] device-dark:text-white">
        Motion
      </h3>
      <div className="overflow-x-auto rounded-lg border border-border device-dark:border-[#2c2c2c]">
        <table className="w-full min-w-[560px] font-['Inter',sans-serif] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/60 text-left device-dark:border-[#2c2c2c] device-dark:bg-[#2a2a2a] device-dark:text-white">
              <th className="px-4 py-3 font-semibold">Utility</th>
              <th className="px-4 py-3 font-semibold">Duration</th>
              <th className="px-4 py-3 font-semibold">Easing</th>
              <th className="px-4 py-3 font-semibold">Usage</th>
            </tr>
          </thead>
          <tbody>
            {MOTION.map((m) => (
              <tr key={m.name} className="border-b border-border last:border-0 device-dark:border-[#2c2c2c]">
                <td className="px-4 py-3 font-mono text-xs device-dark:text-[#b7b7b7]">{m.name}</td>
                <td className="px-4 py-3 font-mono text-xs device-dark:text-[#b7b7b7]">{m.duration}</td>
                <td className="px-4 py-3 text-[#525252] device-dark:text-[#929292]">
                  {m.easing}
                </td>
                <td className="px-4 py-3 text-[#525252] device-dark:text-[#929292]">
                  {m.usage}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GuideSection>
  );
}
