import { GuideSection } from "./GuideSection";

const CHANGES = [
  {
    change: "Live deployed style guide",
    rationale:
      "Demo 2 needs a page next to the main app with styling, responsive layout, and animation, not a static Markdown file.",
  },
  {
    change: "Merged frontend-implematation identity",
    rationale:
      "Brought in League Spartan wordmark, Beaufort for LOL display, logo-mark / logo-mark-white, device-dark surfaces, replay/metrics routes, AuthScreen, and ThemedIcon so the guide matches shipping UI.",
  },
  {
    change: "Token-first colour presentation with WCAG tables",
    rationale:
      "HEX / RGB / HSL plus AA/AAA contrast for real FG/BG pairings, including device-dark #181818 canvas pairs.",
  },
  {
    change: "Named typographic scale",
    rationale:
      "Named type scale: display, h1-h4, body, caption with League Spartan / Beaufort / Inter roles and licensing.",
  },
  {
    change: "Logo treatments + Lucide / ThemedIcon rules",
    rationale:
      "Documented mark assets, clear space, forbidden treatments, Lucide stroke sizes, and CSS theme-swap icons.",
  },
  {
    change: "Component state matrix",
    rationale:
      "Buttons and inputs show variants and states as live primitives; auth CTA documented via AuthScreen.",
  },
  {
    change: "Accessibility & motion reduction",
    rationale:
      "WCAG 2.2 AA target; prefers-reduced-motion covers vantage pulse/breathe/dot/progress and sg-fade-in.",
  },
  {
    change: "Voice & tone + path corrections",
    rationale:
      "UI copy guidance; Brand-Style.md points at /style-guide and current source paths after the frontend merge.",
  },
];

export function ChangelogSection() {
  return (
    <GuideSection
      id="changelog"
      eyebrow="09. History"
      title="Changelog from Demo 1"
      description="What changed between the Demo 1 static brand guide and this Demo 2 live design system, including the frontend-implematation merge."
      delayMs={360}
    >
      <ol className="space-y-4">
        {CHANGES.map((item, index) => (
          <li
            key={item.change}
            className="grid gap-2 rounded-lg border border-border p-5 md:grid-cols-[2rem_1fr] device-dark:border-[#2c2c2c]"
          >
            <span className="font-['Inter',sans-serif] text-sm font-semibold text-muted-foreground device-dark:text-[#929292]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="font-['Inter',sans-serif] text-sm font-semibold text-[#1e1e1e] device-dark:text-white">
                {item.change}
              </h3>
              <p className="mt-1 font-['Inter',sans-serif] text-sm text-[#525252] device-dark:text-[#b7b7b7]">
                {item.rationale}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </GuideSection>
  );
}
