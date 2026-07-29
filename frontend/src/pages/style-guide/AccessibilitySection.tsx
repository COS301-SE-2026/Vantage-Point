import { GuideSection } from "./GuideSection";

export function AccessibilitySection() {
  return (
    <GuideSection
      id="accessibility"
      eyebrow="07. Access"
      title="Accessibility standards"
      description="Conformance target, keyboard behaviour, focus styling, screen-reader considerations, motion reduction, and contrast guarantees."
      delayMs={280}
    >
      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-border p-5 device-dark:border-[#2c2c2c]">
          <h3 className="mb-2 font-['Inter',sans-serif] text-sm font-semibold text-[#1e1e1e] device-dark:text-white">
            Conformance target
          </h3>
          <p className="font-['Inter',sans-serif] text-sm text-[#525252] device-dark:text-[#b7b7b7]">
            <strong className="font-semibold text-[#1e1e1e] device-dark:text-white">
              WCAG 2.2 Level AA
            </strong>{" "}
            at minimum. Use AAA for body text where you can (see Colour section
            ratios).
          </p>
        </article>
        <article className="rounded-lg border border-border p-5 device-dark:border-[#2c2c2c]">
          <h3 className="mb-2 font-['Inter',sans-serif] text-sm font-semibold text-[#1e1e1e] device-dark:text-white">
            Keyboard navigation
          </h3>
          <p className="font-['Inter',sans-serif] text-sm text-[#525252] device-dark:text-[#b7b7b7]">
            All interactive controls are reachable via Tab / Shift+Tab. Radix
            primitives (Dialog, Select, Dropdown) support arrow keys and Escape.
            Match list and nav expose appropriate ARIA roles.
          </p>
        </article>
        <article className="rounded-lg border border-border p-5 device-dark:border-[#2c2c2c]">
          <h3 className="mb-2 font-['Inter',sans-serif] text-sm font-semibold text-[#1e1e1e] device-dark:text-white">
            Focus indicator
          </h3>
          <p className="mb-3 font-['Inter',sans-serif] text-sm text-[#525252] device-dark:text-[#b7b7b7]">
            shadcn controls use{" "}
            <code className="text-xs">
              focus-visible:ring-[3px] ring-ring/50
            </code>{" "}
            with <code className="text-xs">--ring</code>. Auth inputs darken the
            border to <code className="text-xs">#2c2c2c</code>.
          </p>
          <button
            type="button"
            className="rounded-md border border-border bg-[#f5f5f5] px-4 py-2 font-['Inter',sans-serif] text-sm text-[#1e1e1e] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] device-dark:border-[#3a3939] device-dark:bg-[#2a2a2a] device-dark:text-white"
          >
            Tab to see focus ring
          </button>
        </article>
        <article className="rounded-lg border border-border p-5 device-dark:border-[#2c2c2c]">
          <h3 className="mb-2 font-['Inter',sans-serif] text-sm font-semibold text-[#1e1e1e] device-dark:text-white">
            Screen readers
          </h3>
          <p className="font-['Inter',sans-serif] text-sm text-[#525252] device-dark:text-[#b7b7b7]">
            Language set via{" "}
            <code className="text-xs">&lt;html lang=&quot;en&quot;&gt;</code>.
            Landmark labels on sidebar toggle and profile sections;{" "}
            <code className="text-xs">aria-current=&quot;page&quot;</code> on
            nav; form errors use{" "}
            <code className="text-xs">role=&quot;alert&quot;</code>; decorative
            images use empty alt.
          </p>
        </article>
      </div>

      <div className="mb-8 rounded-lg border border-border p-5 device-dark:border-[#2c2c2c]">
        <h3 className="mb-2 font-['Inter',sans-serif] text-sm font-semibold text-[#1e1e1e] device-dark:text-white">
          Motion reduction
        </h3>
        <p className="font-['Inter',sans-serif] text-sm text-[#525252] device-dark:text-[#b7b7b7]">
          Brand animations respect{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs device-dark:bg-[#3a3939]">
            prefers-reduced-motion: reduce
          </code>{" "}
          in <code className="text-xs">theme.css</code>: pulse, breathe,
          dot-fill, progress, scroll, and style-guide fade-ins disable under
          that preference. Device theme (`device-dark:`) follows{" "}
          <code className="text-xs">prefers-color-scheme</code> independently of
          shadcn <code className="text-xs">.dark</code>.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-muted/40 p-5 device-dark:border-[#2c2c2c] device-dark:bg-[#2a2a2a]">
        <h3 className="mb-2 font-['Inter',sans-serif] text-sm font-semibold text-[#1e1e1e] device-dark:text-white">
          Automated audit
        </h3>
        <p className="font-['Inter',sans-serif] text-sm text-[#525252] device-dark:text-[#b7b7b7]">
          Run Lighthouse, axe DevTools, or WAVE against{" "}
          <code className="text-xs">/style-guide</code> and primary product
          routes before Demo 2. Record scores here when available:
        </p>
        <ul className="mt-3 space-y-1 font-['Inter',sans-serif] text-sm text-[#525252] device-dark:text-[#b7b7b7]">
          <li>
            Lighthouse Accessibility:{" "}
            <em className="text-muted-foreground device-dark:text-[#929292]">
              pending audit
            </em>
          </li>
          <li>
            axe DevTools critical / serious:{" "}
            <em className="text-muted-foreground device-dark:text-[#929292]">
              pending audit
            </em>
          </li>
        </ul>
      </div>
    </GuideSection>
  );
}
