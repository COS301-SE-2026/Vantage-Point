import { Code, GuideSection, SubHeading } from "./GuideSection";

const CARDS = [
  {
    title: "Conformance target",
    body: (
      <>
        <strong className="font-bold text-vp-ink">WCAG 2.2 Level AA</strong> at
        minimum, and AAA for running copy where the surface allows it. Ink on
        canvas and ink on surface both clear AAA, which is what makes the dark
        theme defensible as the only theme.
      </>
    ),
  },
  {
    title: "Keyboard",
    body: (
      <>
        Every control is reachable with Tab and Shift+Tab. Radix handles arrow
        keys and Escape inside Dialog, Select, and the account menu. The rail
        rows are buttons rather than anchors so the router stays in charge and
        each one can carry <Code>aria-current=&quot;page&quot;</Code>.
      </>
    ),
  },
  {
    title: "Screen readers",
    body: (
      <>
        Language is set on <Code>&lt;html lang=&quot;en&quot;&gt;</Code>. The
        rail is a labelled <Code>nav</Code>, the sidebar toggle carries{" "}
        <Code>aria-expanded</Code> and <Code>aria-controls</Code>, error notes
        use <Code>role=&quot;alert&quot;</Code>, and the champion art behind the
        auth form is <Code>aria-hidden</Code> because the form is what the
        screen is about.
      </>
    ),
  },
  {
    title: "One theme, on purpose",
    body: (
      <>
        The product no longer follows <Code>prefers-color-scheme</Code>. It is
        dark on every device, so nothing depends on an OS setting the user may
        not control. The <Code>device-dark:</Code> variant still exists in{" "}
        <Code>theme.css</Code> but only the route guards still use it, and it is
        on its way out.
      </>
    ),
  },
];

export function AccessibilitySection() {
  return (
    <GuideSection
      id="accessibility"
      eyebrow="07. Access"
      title="Accessibility standards"
      description="What the dark theme has to guarantee, how focus is drawn, and which colours are deliberately below the line."
      delayMs={280}
    >
      <div className="mb-10 grid gap-5 md:grid-cols-2">
        {CARDS.map((card) => (
          <article
            key={card.title}
            className="rounded-xl border border-vp-line bg-vp-surface p-5"
          >
            <h4 className="mb-2 text-[15px] font-bold text-vp-ink">
              {card.title}
            </h4>
            <p className="text-[13px] leading-relaxed text-vp-dim">
              {card.body}
            </p>
          </article>
        ))}
      </div>

      <SubHeading>Focus</SubHeading>
      <div className="mb-10 grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-vp-line bg-vp-surface p-5">
          <p className="mb-4 text-[13px] leading-relaxed text-vp-dim">
            Two treatments, because two systems are in play. Product controls
            warm to gold: the border moves to <Code>vp-gold/60</Code> and a soft{" "}
            <Code>ring-vp-gold/15</Code> comes in behind it. Vendored primitives
            keep shadcn's <Code>focus-visible:ring-[3px]</Code> against{" "}
            <Code>--ring</Code>. Both are visible against every surface in the
            palette.
          </p>
          <div className="flex flex-wrap gap-3">
            <input
              aria-label="Focus example, product field"
              placeholder="Tab into me"
              className="min-w-0 flex-1 rounded-lg border border-vp-line bg-vp-raised px-4 py-2.5 text-[15px] text-vp-ink placeholder:text-vp-faint caret-vp-gold focus:border-vp-gold/60 focus:outline-none focus:ring-2 focus:ring-vp-gold/15"
            />
            <button
              type="button"
              className="shrink-0 cursor-pointer rounded-lg border border-vp-line-strong px-3.5 py-2 text-[13px] text-vp-ink outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              Primitive focus
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-vp-line bg-vp-surface p-5">
          <h4 className="mb-2 text-[15px] font-bold text-vp-ink">
            Deliberately below AA
          </h4>
          <p className="mb-3 text-[13px] leading-relaxed text-vp-dim">
            <Code>vp-faint</Code> does not reach 4.5:1 on any surface in the
            palette. That is the point: it marks text that is not content.
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-[13px] leading-relaxed text-vp-dim">
            <li>Input placeholders, which must not read as a filled value</li>
            <li>
              Tile captions, which are always paired with the figure above
            </li>
            <li>Inactive icons, which have a visible label beside them</li>
          </ul>
          <p className="mt-3 text-[13px] leading-relaxed text-vp-dim">
            Never use it for a sentence the user has to read. If copy matters,
            it is <Code>vp-dim</Code> or <Code>vp-ink</Code>.
          </p>
        </div>
      </div>

      <SubHeading>Motion</SubHeading>
      <div className="mb-10 rounded-xl border border-vp-line bg-vp-surface p-5">
        <p className="text-[13px] leading-relaxed text-vp-dim">
          <Code>prefers-reduced-motion: reduce</Code> switches off every brand
          animation in <Code>theme.css</Code>: breathe, dot fill, progress,
          scroll, marquee, meteors, and this page's own fade-ins. Smooth scroll
          on in-page anchors is opt-in the other way, wrapped in a{" "}
          <Code>no-preference</Code> query rather than disabled after the fact.
          The rail resize and its label cross-fade are framer transitions and
          are not covered by that CSS: they are short and small, but they are
          the gap.
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-vp-line-strong bg-vp-surface/60 p-5">
        <h4 className="mb-2 text-[15px] font-bold text-vp-ink">
          Automated audit
        </h4>
        <p className="mb-3 text-[13px] leading-relaxed text-vp-dim">
          Run Lighthouse, axe DevTools, or WAVE against this page and the
          product routes before each demo, and record the result here.
        </p>
        <ul className="space-y-1 text-[13px] text-vp-dim">
          <li>
            Lighthouse Accessibility:{" "}
            <em className="text-vp-faint">pending audit</em>
          </li>
          <li>
            axe DevTools critical / serious:{" "}
            <em className="text-vp-faint">pending audit</em>
          </li>
        </ul>
      </div>
    </GuideSection>
  );
}
