import { Code, GuideSection, SubHeading } from "./GuideSection";

const FAMILIES = [
  {
    name: "Beaufort for LOL",
    role: "The product face",
    stack: '"Beaufort for LOL", ui-serif, Georgia, serif',
    utility: "font-beaufort",
    sampleClass: "text-[26px] font-bold leading-tight",
    sample: "Every metre of the map you gave away",
    source: "Self-hosted OTF, weights 400 / 500 / 700",
    note: "Set once on a page root and inherited by everything under it: headings, body, buttons, stats, small caps. Landing, auth, and the dashboard all do this.",
  },
  {
    name: "League Spartan",
    role: "Wordmark only",
    stack: '"League Spartan", ui-sans-serif, system-ui, sans-serif',
    utility: "font-spartan",
    sampleClass:
      "font-spartan text-[22px] font-bold uppercase tracking-[0.06em]",
    sample: "Vantage Point",
    source: "Self-hosted variable woff2, 400 to 700",
    note: "Reserved for the logo lockup. It opts back out of the inherited Beaufort in the sidebar, the auth header, the landing nav, and the loading screen. Nothing else uses it.",
  },
  {
    name: "Inter",
    role: "Legacy, not for new work",
    stack: '"Inter", ui-sans-serif, system-ui, sans-serif',
    utility: "font-['Inter',sans-serif]",
    sampleClass: "font-['Inter',sans-serif] text-[17px] font-semibold",
    sample: "Sign in to sync your Riot ID",
    source: "Google Fonts (OFL)",
    note: "Survives in the admin shell, the profile header editor, and the route guards, which predate the Beaufort pass. Move these to the inherited face when they are next touched rather than adding more.",
  },
];

/**
 * Fonts still fetched by `fonts.css` that nothing renders. Listed rather than
 * quietly dropped: the imports are four blocking requests on every page load,
 * and the guide is where that gets noticed.
 */
const UNUSED = ["Geist", "Sarina", "Sora"];

const SCALE = [
  {
    name: "Wordmark",
    spec: "14px / 700 / uppercase / 0.06em",
    usage: "Sidebar and auth lockup",
    className: "font-spartan text-[14px] font-bold uppercase tracking-[0.06em]",
    sample: "Vantage Point",
  },
  {
    name: "Auth title",
    spec: "26px / 700 / leading-tight",
    usage: "The one heading on a login or register panel",
    className: "text-[26px] font-bold leading-tight",
    sample: "Welcome back",
  },
  {
    name: "Page title",
    spec: "22px / 700 / leading-tight",
    usage: "PageHeading, at the top of every dashboard tab",
    className: "text-[22px] font-bold leading-tight",
    sample: "Match history",
  },
  {
    name: "Stat value",
    spec: "22px / 700 / tabular-nums",
    usage: "StatTile figures, so columns of numbers line up",
    className: "text-[22px] font-bold leading-none tabular-nums",
    sample: "12.4",
  },
  {
    name: "Header title",
    spec: "15px / 500 / 0.01em",
    usage: "The shell header, which names the section you are in",
    className: "text-[15px] font-medium tracking-[0.01em]",
    sample: "Map analysis",
  },
  {
    name: "Body",
    spec: "15px / 400",
    usage: "Running copy. The floor for the serif at reading size",
    className: "text-[15px] leading-relaxed",
    sample: "The replay reads the timeline back one minute at a time.",
  },
  {
    name: "Meta",
    spec: "13px / 400",
    usage: "Table cells, hints, secondary lines under a title",
    className: "text-[13px] leading-relaxed",
    sample: "Ranked Solo, 32 minutes, two days ago",
  },
  {
    name: "Eyebrow",
    spec: "11px / 500 / uppercase / 0.22em",
    usage: "Gold label above a title on auth and marketing surfaces",
    className:
      "text-[11px] font-medium uppercase tracking-[0.22em] text-vp-gold",
    sample: "Spatial intelligence",
  },
  {
    name: "Panel caption",
    spec: "11px / 500 / uppercase / 0.16em",
    usage: "PanelHeader. Small caps instead of a heavier weight",
    className: "text-[11px] font-medium uppercase tracking-[0.16em]",
    sample: "Objective control",
  },
  {
    name: "Tile label",
    spec: "10px / 500 / uppercase / 0.16em",
    usage: "StatTile caption. The smallest type in the system",
    className: "text-[10px] font-medium uppercase tracking-[0.16em]",
    sample: "Vision score",
  },
];

export function TypographySection() {
  return (
    <GuideSection
      id="typography"
      eyebrow="02. Typography"
      title="Typography system"
      description="One face carries the product. Beaufort for LOL is set on each page root and inherited all the way down, and League Spartan is held back for the wordmark. Size, weight, and letter spacing do the work that a second family would otherwise do."
      delayMs={80}
    >
      <div className="mb-10 grid gap-5 lg:grid-cols-3">
        {FAMILIES.map((f) => (
          <article
            key={f.name}
            className="flex flex-col rounded-xl border border-vp-line bg-vp-surface p-5"
          >
            <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.16em] text-vp-gold">
              {f.role}
            </p>
            <h4 className="mb-4 text-[17px] font-bold text-vp-ink">{f.name}</h4>
            <p className={`${f.sampleClass} mb-4 text-vp-ink`}>{f.sample}</p>
            <p className="mb-4 text-[13px] leading-relaxed text-vp-dim">
              {f.note}
            </p>
            <dl className="mt-auto space-y-1 border-t border-vp-line pt-3 font-mono text-[11px]">
              <div className="flex gap-2">
                <dt className="w-12 shrink-0 text-vp-faint">Class</dt>
                <dd className="min-w-0 break-all text-vp-gold">{f.utility}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-12 shrink-0 text-vp-faint">Stack</dt>
                <dd className="min-w-0 break-all text-vp-ink">{f.stack}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-12 shrink-0 text-vp-faint">Source</dt>
                <dd className="min-w-0 text-vp-ink">{f.source}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <SubHeading>Type scale</SubHeading>
      <div className="mb-10 overflow-hidden rounded-xl border border-vp-line">
        {SCALE.map((item) => (
          <div
            key={item.name}
            className="grid gap-2 border-b border-vp-line px-5 py-4 last:border-0 md:grid-cols-[140px_1fr_240px] md:items-center md:gap-5"
          >
            <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-vp-dim">
              {item.name}
            </div>
            <p className={`${item.className} min-w-0 truncate text-vp-ink`}>
              {item.sample}
            </p>
            <div className="min-w-0">
              <p className="font-mono text-[11px] text-vp-gold">{item.spec}</p>
              <p className="mt-0.5 text-[13px] text-vp-faint">{item.usage}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-vp-line bg-vp-surface p-5">
          <h4 className="mb-2 text-[15px] font-bold text-vp-ink">
            Reading floor
          </h4>
          <p className="text-[13px] leading-relaxed text-vp-dim">
            Beaufort is a display serif and it gives up more than a sans does at
            small sizes. Keep running copy at 13px or above. Below that, use it
            only for uppercase labels with wide tracking, where the letterforms
            are carrying a caption rather than a sentence.
          </p>
        </div>

        <div className="rounded-xl border border-vp-line bg-vp-surface p-5">
          <h4 className="mb-2 text-[15px] font-bold text-vp-ink">
            Loaded but unused
          </h4>
          <p className="mb-3 text-[13px] leading-relaxed text-vp-dim">
            <Code>styles/fonts.css</Code> still fetches three families that no
            component renders. They are blocking requests on every page load and
            can be dropped when someone is next in that file.
          </p>
          <div className="flex flex-wrap gap-2">
            {UNUSED.map((name) => (
              <span
                key={name}
                className="rounded-md border border-vp-line-strong px-2.5 py-1 font-mono text-[11px] text-vp-faint line-through"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </GuideSection>
  );
}
