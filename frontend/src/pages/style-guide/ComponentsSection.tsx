import { useState } from "react";
import { Clapperboard, Eye, EyeOff, History } from "lucide-react";
import {
  Button as VpButton,
  EmptyState,
  ErrorNote,
  PageHeading,
  Panel,
  PanelHeader,
  StatTile,
} from "../../components/dashboard/primitives";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Code, GuideSection, SubHeading } from "./GuideSection";

/** The auth field, lifted verbatim from `components/auth/AuthScreen.tsx`. */
const AUTH_FIELD =
  "w-full min-w-0 rounded-lg border border-vp-line bg-vp-raised px-4 py-3 text-[15px] text-vp-ink transition-colors placeholder:text-vp-faint caret-vp-gold focus:border-vp-gold/60 focus:outline-none focus:ring-2 focus:ring-vp-gold/15";

function AuthFieldDemo() {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <span className="block text-[13px] text-vp-dim">Email</span>
        <input
          type="email"
          placeholder="you@example.com"
          className={AUTH_FIELD}
          aria-label="Email, example field"
        />
      </div>
      <div className="space-y-1.5">
        <span className="block text-[13px] text-vp-dim">Password</span>
        <div className="relative">
          <input
            type={visible ? "text" : "password"}
            defaultValue="not-a-real-password"
            className={`${AUTH_FIELD} pr-12`}
            aria-label="Password, example field"
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-md text-vp-faint transition-colors hover:text-vp-ink"
          >
            {visible ? (
              <EyeOff className="size-4" strokeWidth={1.7} />
            ) : (
              <Eye className="size-4" strokeWidth={1.7} />
            )}
          </button>
        </div>
      </div>
      <button
        type="button"
        className="w-full cursor-pointer rounded-lg bg-vp-gold px-4 py-3 text-[15px] font-semibold text-black transition-colors hover:bg-[#eec684]"
      >
        Sign in
      </button>
    </div>
  );
}

export function ComponentsSection() {
  return (
    <GuideSection
      id="components"
      eyebrow="05. Components"
      title="Component library"
      description="The dashboard is built from a handful of primitives in components/dashboard/primitives.tsx. Every demo below imports the real component, so what you see is what a tab renders."
      delayMs={200}
    >
      <SubHeading>Surfaces</SubHeading>
      <p className="mb-5 max-w-3xl text-[15px] leading-relaxed text-vp-dim">
        Each tab used to spell out its own hex values and paddings, which is how
        the old screens drifted apart. These carry the palette instead, so a tab
        file reads as structure rather than styling.
      </p>

      <div className="mb-10 rounded-xl border border-vp-line bg-vp-canvas p-5">
        <PageHeading
          title="Match history"
          meta="Ranked Solo, last 20 games"
          actions={<VpButton variant="ghost">Refresh</VpButton>}
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Win rate" value="58%" sub="Last 20" tone="gold" />
          <StatTile label="Wins" value="24" tone="win" />
          <StatTile label="Losses" value="17" tone="loss" />
          <StatTile label="KDA" value="3.42" sub="8.1 / 4.6 / 7.7" />
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <Panel>
            <PanelHeader
              title="Objective control"
              hint="Share of neutral objectives taken"
            />
            <p className="text-[13px] leading-relaxed text-vp-dim">
              A panel is one step up from the canvas: lighter fill, hairline
              edge, no shadow. <Code>PanelHeader</Code> uses small caps so the
              caption carries the hierarchy without a heavier weight.
            </p>
          </Panel>
          <div className="flex flex-col gap-3">
            <EmptyState
              title="No ranked matches yet"
              body="Play a game, then refresh to see your timeline."
              action={<VpButton variant="primary">Refresh history</VpButton>}
            />
            <ErrorNote>
              We could not reach Riot. Check your connection and try again.
            </ErrorNote>
          </div>
        </div>
      </div>

      <SubHeading>Buttons</SubHeading>
      <div className="mb-10 grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-vp-line bg-vp-surface p-5">
          <h4 className="mb-1 text-[15px] font-bold text-vp-ink">
            The dashboard button
          </h4>
          <p className="mb-4 text-[13px] leading-relaxed text-vp-dim">
            One button in three weights. Primary is gold with a black label and
            is used once per view at most. Ghost is the default. Quiet is for
            controls that should not compete with the data beside them.
          </p>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <VpButton variant="primary">Primary</VpButton>
            <VpButton variant="ghost">Ghost</VpButton>
            <VpButton variant="quiet">Quiet</VpButton>
            <VpButton variant="ghost" disabled>
              Disabled
            </VpButton>
          </div>
          <p className="text-[13px] text-vp-faint">
            Ghost warms its border and label to gold on hover rather than
            filling, so a row of them stays quiet until you reach for one.
          </p>
        </div>

        <div className="rounded-xl border border-vp-line bg-vp-surface p-5">
          <h4 className="mb-1 text-[15px] font-bold text-vp-ink">
            The rail row
          </h4>
          <p className="mb-4 text-[13px] leading-relaxed text-vp-dim">
            The active marker is a two-pixel gold rule against the rail edge,
            not a filled pill: it survives the collapse to icons without
            becoming a blob.
          </p>
          <div className="max-w-[232px] space-y-1 rounded-lg border border-vp-line bg-vp-surface p-3">
            {[
              { label: "Matches", Icon: History, active: true },
              { label: "Match Replay", Icon: Clapperboard, active: false },
            ].map((row) => (
              <div
                key={row.label}
                className={`relative flex h-10 items-center gap-3 rounded-lg px-3 text-[14px] ${
                  row.active ? "bg-vp-raised text-vp-ink" : "text-vp-dim"
                }`}
              >
                <span
                  aria-hidden
                  className={`absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-vp-gold ${
                    row.active ? "opacity-100" : "opacity-0"
                  }`}
                />
                <span
                  className={`grid size-5 shrink-0 place-items-center ${row.active ? "text-vp-gold" : ""}`}
                >
                  <row.Icon
                    className="size-[18px]"
                    strokeWidth={1.7}
                    aria-hidden
                  />
                </span>
                {row.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <SubHeading>Auth form</SubHeading>
      <div className="mb-10 grid gap-5 lg:grid-cols-[380px_1fr]">
        <div className="rounded-2xl border border-vp-line bg-vp-surface p-6">
          <p className="text-[11px] uppercase tracking-[0.22em] text-vp-gold">
            Welcome back
          </p>
          <h4 className="mb-6 mt-2.5 text-[26px] font-bold leading-tight text-vp-ink">
            Sign in
          </h4>
          <AuthFieldDemo />
        </div>
        <div className="rounded-xl border border-vp-line bg-vp-surface p-5">
          <h4 className="mb-2 text-[15px] font-bold text-vp-ink">
            How the field is built
          </h4>
          <ul className="list-disc space-y-2 pl-5 text-[13px] leading-relaxed text-vp-dim">
            <li>
              Raised fill, hairline border, gold caret. Focus warms the border
              to <Code>vp-gold/60</Code> and adds a soft{" "}
              <Code>ring-vp-gold/15</Code> rather than a hard outline.
            </li>
            <li>
              Placeholders use <Code>vp-faint</Code>, which is deliberately
              below AA: it must not read as a filled value.
            </li>
            <li>
              Chrome paints autofilled inputs with its own opaque background, so
              the real field adds an inset shadow to re-state the surface and a{" "}
              <Code>-webkit-text-fill-color</Code> to re-state the ink.
            </li>
            <li>
              The auth card is the one surface at <Code>rounded-2xl</Code>, and
              on mobile it sits over champion art on{" "}
              <Code>bg-vp-surface/85</Code> with a backdrop blur.
            </li>
          </ul>
        </div>
      </div>

      <SubHeading>Vendored primitives</SubHeading>
      <p className="mb-5 max-w-3xl text-[15px] leading-relaxed text-vp-dim">
        shadcn components in <Code>components/ui/</Code> are still used for the
        things that need real behaviour: Dialog, Select, Avatar, dropdown menus,
        and Sonner toasts. They resolve the semantic tokens rather than the vp
        palette, so they only look right inside a <Code>dark</Code> subtree, and
        every screen that renders one provides that. Prefer the dashboard
        primitives above for anything you are laying out yourself.
      </p>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-xl border border-vp-line bg-vp-surface p-5">
          <h4 className="mb-4 text-[15px] font-bold text-vp-ink">Button</h4>
          <div className="flex flex-wrap gap-2">
            {(
              [
                "default",
                "secondary",
                "outline",
                "ghost",
                "destructive",
              ] as const
            ).map((variant) => (
              <Button key={variant} variant={variant} size="sm">
                {variant}
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-vp-line bg-vp-surface p-5">
          <h4 className="mb-4 text-[15px] font-bold text-vp-ink">Badge</h4>
          <div className="flex flex-wrap gap-2">
            <Badge>default</Badge>
            <Badge variant="secondary">secondary</Badge>
            <Badge variant="outline">outline</Badge>
            <Badge variant="destructive">destructive</Badge>
          </div>
        </div>

        <div className="rounded-xl border border-vp-line bg-vp-surface p-5">
          <h4 className="mb-4 text-[15px] font-bold text-vp-ink">Dialog</h4>
          <Dialog>
            <DialogTrigger asChild>
              <VpButton variant="ghost">Open modal</VpButton>
            </DialogTrigger>
            <DialogContent className="border-vp-line bg-vp-surface font-beaufort text-vp-ink">
              <DialogHeader>
                <DialogTitle>Link Riot ID</DialogTitle>
                <DialogDescription className="text-vp-dim">
                  Confirm your Riot game name and tagline to sync match history.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <VpButton variant="quiet">Cancel</VpButton>
                <VpButton variant="primary">Continue</VpButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <p className="mt-3 text-[13px] leading-relaxed text-vp-dim">
            Dialogs restate the surface and the face, the same way{" "}
            <Code>DashboardPage</Code> does.
          </p>
        </div>
      </div>
    </GuideSection>
  );
}
