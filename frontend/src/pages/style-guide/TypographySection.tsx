import { GuideSection } from "./GuideSection";

const FAMILIES = [
  {
    name: "League Spartan",
    role: "Brand wordmark (auth, dashboard, landing)",
    stack: '"League Spartan", ui-sans-serif, system-ui, sans-serif',
    sampleClass:
      "font-['League_Spartan',sans-serif] text-3xl font-bold uppercase tracking-[0.02em]",
    sample: "Vantage Point",
    source: "Self-hosted woff2 in fonts.css (OFL)",
  },
  {
    name: "Beaufort for LOL",
    role: "Display / match UI (landing, dashboard, scoreboards)",
    stack: '"Beaufort for LOL", ui-serif, Georgia, serif',
    sampleClass: "font-['Beaufort_for_LOL',serif] text-2xl font-medium",
    sample: "The match tells a clearer story",
    source: "Self-hosted OTF in assets/fonts/beaufort",
  },
  {
    name: "Inter",
    role: "Primary UI / forms / body",
    stack: '"Inter", ui-sans-serif, system-ui, sans-serif',
    sampleClass: "font-['Inter',sans-serif] text-xl font-semibold",
    sample: "Sign in to sync your Riot ID",
    source: "Google Fonts (OFL)",
  },
  {
    name: "Geist",
    role: "Featured-game card badges",
    stack: '"Geist", ui-sans-serif, system-ui, sans-serif',
    sampleClass: "font-['Geist',sans-serif] text-sm font-medium",
    sample: "League of Legends",
    source: "Google Fonts (OFL)",
  },
  {
    name: "Sarina / Sora",
    role: "Loaded globally; legacy / sparse use",
    stack: '"Sarina" / "Sora", ui-sans-serif, system-ui, sans-serif',
    sampleClass: "font-sarina text-2xl",
    sample: "Sarina still loads via Google Fonts",
    source: "Google Fonts (OFL). Use League Spartan for wordmarks",
  },
];

const SCALE = [
  {
    name: "display",
    size: "clamp(28px, 4vw, 48px)",
    weight: "700 League Spartan / 700 Beaufort",
    lineHeight: "1.15-1.4",
    letterSpacing: "0.02em (Spartan uppercase)",
    className:
      "font-['League_Spartan',sans-serif] text-[clamp(28px,4vw,40px)] font-bold uppercase leading-tight tracking-[0.02em]",
  },
  {
    name: "h1",
    size: "about 24-32px Beaufort / text-2xl",
    weight: "500-700",
    lineHeight: "1.4-1.5",
    letterSpacing: "normal / tight on landing",
    className: "font-['Beaufort_for_LOL',serif] text-2xl font-medium leading-[1.4]",
  },
  {
    name: "h2",
    size: "var(--text-xl) about 1.25rem",
    weight: "500",
    lineHeight: "1.5",
    letterSpacing: "normal",
    className: "font-['Inter',sans-serif] text-xl font-medium leading-[1.5]",
  },
  {
    name: "h3",
    size: "var(--text-lg) about 1.125rem",
    weight: "500",
    lineHeight: "1.5",
    letterSpacing: "normal",
    className: "font-['Inter',sans-serif] text-lg font-medium leading-[1.5]",
  },
  {
    name: "h4",
    size: "var(--text-base) = 1rem",
    weight: "500-600",
    lineHeight: "1.5",
    letterSpacing: "normal",
    className: "font-['Inter',sans-serif] text-base font-medium leading-[1.5]",
  },
  {
    name: "body",
    size: "16px (--font-size)",
    weight: "400 Inter / 400-500 Beaufort tables",
    lineHeight: "1.4-1.5",
    letterSpacing: "normal",
    className: "font-['Inter',sans-serif] text-base font-normal leading-[1.5]",
  },
  {
    name: "caption",
    size: "11-14px",
    weight: "400-500",
    lineHeight: "1.4",
    letterSpacing: "0.025em (wide labels)",
    className:
      "font-['Inter',sans-serif] text-xs font-medium uppercase tracking-wide text-[#525252]",
  },
];

export function TypographySection() {
  return (
    <GuideSection
      id="typography"
      eyebrow="02. Typography"
      title="Typography system"
      description="Font families, fallbacks, type scale, and licensing. League Spartan and Beaufort are self-hosted. Inter, Geist, Sarina, and Sora load from Google Fonts."
      delayMs={80}
    >
      <div className="mb-10 grid gap-6 md:grid-cols-2">
        {FAMILIES.map((f) => (
          <article
            key={f.name}
            className="rounded-lg border border-border bg-card p-5 device-dark:border-[#2c2c2c] device-dark:bg-[#1e1e1e]"
          >
            <p className="mb-1 font-['Inter',sans-serif] text-xs font-semibold uppercase tracking-wide text-muted-foreground device-dark:text-[#929292]">
              {f.role}
            </p>
            <h3 className="mb-3 font-['Inter',sans-serif] text-lg font-semibold text-[#1e1e1e] device-dark:text-white">
              {f.name}
            </h3>
            <p className={`${f.sampleClass} mb-4 text-[#1e1e1e] device-dark:text-white`}>
              {f.sample}
            </p>
            <p className="font-mono text-[11px] leading-relaxed text-[#525252] device-dark:text-[#929292]">
              {f.stack}
            </p>
            <p className="mt-2 font-['Inter',sans-serif] text-xs text-[#525252] device-dark:text-[#929292]">
              {f.source}
            </p>
          </article>
        ))}
      </div>

      <h3 className="mb-4 font-['Inter',sans-serif] text-sm font-semibold uppercase tracking-wide text-[#1e1e1e] device-dark:text-white">
        Typographic scale
      </h3>
      <div className="mb-8 space-y-4">
        {SCALE.map((item) => (
          <div
            key={item.name}
            className="grid gap-3 rounded-lg border border-border p-4 md:grid-cols-[120px_1fr] device-dark:border-[#2c2c2c]"
          >
            <div className="font-['Inter',sans-serif] text-xs font-semibold uppercase tracking-wide text-muted-foreground device-dark:text-[#929292]">
              {item.name}
            </div>
            <div>
              <p className={`${item.className} text-[#1e1e1e] device-dark:text-white`}>
                The match timeline, clarified.
              </p>
              <dl className="mt-2 grid gap-1 font-['Inter',sans-serif] text-xs text-[#525252] sm:grid-cols-2 lg:grid-cols-4 device-dark:text-[#929292]">
                <div>
                  <dt className="font-medium text-[#1e1e1e] device-dark:text-white">
                    Size
                  </dt>
                  <dd className="font-mono">{item.size}</dd>
                </div>
                <div>
                  <dt className="font-medium text-[#1e1e1e] device-dark:text-white">
                    Weight
                  </dt>
                  <dd>{item.weight}</dd>
                </div>
                <div>
                  <dt className="font-medium text-[#1e1e1e] device-dark:text-white">
                    Line height
                  </dt>
                  <dd>{item.lineHeight}</dd>
                </div>
                <div>
                  <dt className="font-medium text-[#1e1e1e] device-dark:text-white">
                    Letter spacing
                  </dt>
                  <dd>{item.letterSpacing}</dd>
                </div>
              </dl>
            </div>
          </div>
        ))}
      </div>

      <aside className="rounded-lg border border-border bg-muted/40 p-4 font-['Inter',sans-serif] text-sm text-[#525252] device-dark:border-[#2c2c2c] device-dark:bg-[#2a2a2a] device-dark:text-[#b7b7b7]">
        <p className="font-semibold text-[#1e1e1e] device-dark:text-white">
          Source &amp; licensing
        </p>
        <p className="mt-1">
          Beaufort and League Spartan ship via{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs device-dark:bg-[#3a3939]">
            frontend/src/styles/fonts.css
          </code>{" "}
          and <code className="text-xs">assets/fonts/</code>. Inter, Geist, Sarina,
          and Sora come from Google Fonts (OFL). Use League Spartan for the
          product wordmark and Beaufort for League-style display.
        </p>
      </aside>
    </GuideSection>
  );
}
