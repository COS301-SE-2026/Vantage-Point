import {
  DASHBOARD_RAIL_WIDTH,
  DASHBOARD_SIDEBAR_WIDTH,
} from "../../lib/dashboardLayout";
import { Code, GuideSection, SubHeading } from "./GuideSection";

const SURFACES = [
  {
    name: "Landing",
    body: "Full bleed, always dark, Beaufort set on the page root. The navbar is fixed rather than sticky so it floats over the hero, and shrinks to a pill once the page scrolls past 100px.",
  },
  {
    name: "Auth",
    body: "One column below lg. Above it the form takes 46% with a 440px floor, champion art takes the rest, and a hairline runs down the seam. On mobile the art goes behind the card and the canvas is dropped to 80% over it.",
  },
  {
    name: "Dashboard",
    body: "Sidebar beside a scrolling main column. Every tab renders inside PageContainer, so they all share one max width and one gutter, and none of them positions itself.",
  },
];

export function LayoutSection() {
  return (
    <GuideSection
      id="layout"
      eyebrow="06. Layout"
      title="Layout & spacing"
      description="The dashboard used to be an absolutely positioned copy of a 1512px Figma frame: every view computed its own left and width and pinned itself under a fixed header. It could not reflow, so wide screens got dead space and narrow ones got a scrollbar. It is an ordinary flex layout now."
      delayMs={240}
    >
      <div className="mb-10 grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-vp-line bg-vp-surface p-5">
          <h4 className="mb-3 text-[15px] font-bold text-vp-ink">
            The dashboard shell
          </h4>
          <ul className="list-disc space-y-2 pl-5 text-[13px] leading-relaxed text-vp-dim">
            <li>
              Sidebar: sticky, full height, <Code>bg-vp-surface</Code> with a
              right hairline. It animates between{" "}
              <strong className="font-bold text-vp-ink">
                {DASHBOARD_SIDEBAR_WIDTH}px
              </strong>{" "}
              open and{" "}
              <strong className="font-bold text-vp-ink">
                {DASHBOARD_RAIL_WIDTH}px
              </strong>{" "}
              collapsed. The header toggle is the only thing that opens it: it
              does not expand on hover.
            </li>
            <li>
              Header: sticky, 64px tall, <Code>bg-vp-canvas/85</Code> with a
              backdrop blur, so content dims as it passes underneath.
            </li>
            <li>
              Content: <Code>PageContainer</Code> caps at{" "}
              <Code>--vp-dash-max</Code> and gutters at 20px, opening to 28px
              above <Code>sm</Code>.
            </li>
            <li>
              Destinations: Matches and Match Replay. Log out sits in the same
              landmark, at the foot of the rail, because that is where you look
              for it.
            </li>
          </ul>

          <div
            className="relative mt-5 flex h-48 overflow-hidden rounded-lg border border-vp-line bg-vp-canvas"
            aria-hidden
          >
            <div className="flex w-[58px] shrink-0 flex-col gap-1.5 border-r border-vp-line bg-vp-surface p-2">
              <div className="h-4 rounded bg-vp-raised" />
              <div className="mt-2 h-3 rounded bg-vp-gold/60" />
              <div className="h-3 rounded bg-vp-raised" />
              <div className="mt-auto h-3 rounded bg-vp-raised" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex h-8 shrink-0 items-center gap-2 border-b border-vp-line bg-vp-canvas px-2">
                <div className="size-3 rounded-sm bg-vp-raised" />
                <div className="h-2 w-16 rounded bg-vp-raised" />
                <div className="ml-auto size-4 rounded-full bg-vp-raised" />
              </div>
              <div className="flex-1 space-y-1.5 p-2">
                <div className="grid grid-cols-3 gap-1.5">
                  <div className="h-7 rounded bg-vp-raised" />
                  <div className="h-7 rounded bg-vp-raised" />
                  <div className="h-7 rounded bg-vp-raised" />
                </div>
                <div className="h-[68px] rounded border border-vp-line bg-vp-surface" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {SURFACES.map((s) => (
            <div
              key={s.name}
              className="rounded-xl border border-vp-line bg-vp-surface p-5"
            >
              <h4 className="mb-2 text-[15px] font-bold text-vp-ink">
                {s.name}
              </h4>
              <p className="text-[13px] leading-relaxed text-vp-dim">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      <SubHeading>Rules the shell keeps</SubHeading>
      <div className="mb-10 grid gap-5 md:grid-cols-3">
        {[
          {
            title: "Nothing positions itself",
            body: "A tab renders content and lets the shell decide where it sits. No view computes a left offset from the sidebar state.",
          },
          {
            title: "One column, one cap",
            body: "Every tab shares PageContainer's max width, so wide screens get a centred column rather than a stretched table.",
          },
          {
            title: "Stack, then split",
            body: "Panels stack on mobile and split at the breakpoint where the narrower half still holds its content, not at a fixed one.",
          },
        ].map((rule) => (
          <div
            key={rule.title}
            className="rounded-xl border border-vp-line bg-vp-surface p-5"
          >
            <h4 className="mb-2 text-[15px] font-bold text-vp-ink">
              {rule.title}
            </h4>
            <p className="text-[13px] leading-relaxed text-vp-dim">
              {rule.body}
            </p>
          </div>
        ))}
      </div>

      <SubHeading>Adaptive grid</SubHeading>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {["1", "2", "3", "4"].map((n) => (
          <div
            key={n}
            className="rounded-lg border border-vp-line bg-vp-raised px-4 py-8 text-center text-[13px] text-vp-dim"
          >
            Column {n}
          </div>
        ))}
      </div>
      <p className="mt-3 text-[13px] text-vp-faint">
        One column on mobile, two from sm, four from lg. The same shape the stat
        tile row uses.
      </p>
    </GuideSection>
  );
}
