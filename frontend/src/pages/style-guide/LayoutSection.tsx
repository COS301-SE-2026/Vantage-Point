import { GuideSection } from "./GuideSection";

export function LayoutSection() {
  return (
    <GuideSection
      id="layout"
      eyebrow="06. Layout"
      title="Layout & spacing"
      description="Grid behaviour, breakpoints, and spacing across landing, auth, and the dashboard (matches, replay, metrics, profile)."
      delayMs={240}
    >
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border p-5 device-dark:border-[#2c2c2c]">
          <h3 className="mb-3 font-['Inter',sans-serif] text-sm font-semibold text-[#1e1e1e] device-dark:text-white">
            Dashboard frame
          </h3>
          <ul className="list-disc space-y-2 pl-5 font-['Inter',sans-serif] text-sm text-[#525252] device-dark:text-[#b7b7b7]">
            <li>
              Max artboard{" "}
              <code className="text-xs">--vp-layout-max: 1512px</code>; content
              cap <code className="text-xs">--vp-content-max: 1180px</code>
            </li>
            <li>
              Header band{" "}
              <code className="text-xs">--vp-dashboard-header</code> (default
              72px; raised when showing the large account avatar)
            </li>
            <li>
              Sidebar panel (JS): left 34px, width 180px, content gap 34px → open
              offset <code className="text-xs">248px</code>
            </li>
            <li>
              Nav destinations: Matches, Replay, Metrics, Profile (
              <code className="text-xs">DashboardShell</code>)
            </li>
          </ul>
          <div
            className="relative mt-5 h-44 overflow-hidden rounded-md border border-[#d9d9d9] bg-[#fafafa] device-dark:border-[#2c2c2c] device-dark:bg-[#121212]"
            aria-hidden
          >
            <div className="absolute inset-x-0 top-0 h-8 bg-[#2c2c2c]/90" />
            <div className="absolute top-10 left-3 h-[calc(100%-3rem)] w-12 rounded-md bg-[rgba(117,117,117,0.18)] device-dark:bg-[#2a2a2a]" />
            <div className="absolute top-10 right-3 bottom-3 left-[4.25rem] rounded-md border border-dashed border-[#b3b3b3] bg-white device-dark:border-[#3a3939] device-dark:bg-[#181818]" />
          </div>
        </div>

        <div className="rounded-lg border border-border p-5 device-dark:border-[#2c2c2c]">
          <h3 className="mb-3 font-['Inter',sans-serif] text-sm font-semibold text-[#1e1e1e] device-dark:text-white">
            Responsive behaviour
          </h3>
          <ul className="list-disc space-y-2 pl-5 font-['Inter',sans-serif] text-sm text-[#525252] device-dark:text-[#b7b7b7]">
            <li>
              <strong className="font-semibold text-[#1e1e1e] device-dark:text-white">
                Landing /
              </strong>{" "}
              full-bleed wallpaper; Beaufort display; device-dark wallpaper swap.
            </li>
            <li>
              <strong className="font-semibold text-[#1e1e1e] device-dark:text-white">
                Auth:
              </strong>{" "}
              shared <code className="text-xs">AuthScreen</code>; canvas{" "}
              <code className="text-xs">device-dark:bg-[#181818]</code>.
            </li>
            <li>
              <strong className="font-semibold text-[#1e1e1e] device-dark:text-white">
                Matches / replay / metrics:
              </strong>{" "}
              fluid columns with{" "}
              <code className="text-xs">getDashboardColumnAlignClass</code>{" "}
              centering when the sidebar collapses.
            </li>
            <li>Spacing utilities follow the Tailwind 4px base scale.</li>
          </ul>
        </div>
      </div>

      <h3 className="mb-3 font-['Inter',sans-serif] text-sm font-semibold uppercase tracking-wide text-[#1e1e1e] device-dark:text-white">
        Adaptive grid demo
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {["1", "2", "3", "4"].map((n) => (
          <div
            key={n}
            className="rounded-md border border-border bg-muted/50 px-4 py-8 text-center font-['Inter',sans-serif] text-sm text-[#525252] device-dark:border-[#2c2c2c] device-dark:bg-[#2a2a2a] device-dark:text-[#b7b7b7]"
          >
            Column {n}
          </div>
        ))}
      </div>
      <p className="mt-3 font-['Inter',sans-serif] text-xs text-muted-foreground device-dark:text-[#929292]">
        1 column on mobile → 2 from sm → 4 from lg.
      </p>
    </GuideSection>
  );
}
