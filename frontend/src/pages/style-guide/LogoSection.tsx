import {
  Clapperboard,
  History,
  LogOut,
  PanelLeft,
  Pause,
  Play,
  X,
} from "lucide-react";
import imgLogoMark from "../../assets/images/logos/logo-mark.webp";
import imgLogoMarkWhite from "../../assets/images/logos/logo-mark-white.webp";
import { Code, GuideSection, SubHeading } from "./GuideSection";

const FORBIDDEN = [
  "Do not stretch, skew, or rotate the mark",
  "Do not recolour it. The white cut is the only treatment the product ships",
  "Do not add drop shadows, glows, or outlines",
  "Do not set the wordmark in Beaufort. It is League Spartan, always",
  "Do not place the mark on artwork without darkening the plate behind it",
  "Do not crop the mark or pair it with a competing mark inside its clear space",
];

/**
 * Functional glyphs only, drawn from what the shell and the replay transport
 * actually render. Vantage Point does not use decorative pictograms: a lucide
 * glyph sitting above a card title is not iconography, it is filler, and the
 * feature grid dropped them for that reason.
 */
const FUNCTIONAL_ICONS = [
  { Icon: PanelLeft, label: "Sidebar toggle" },
  { Icon: History, label: "Matches" },
  { Icon: Clapperboard, label: "Replay" },
  { Icon: Play, label: "Play" },
  { Icon: Pause, label: "Pause" },
  { Icon: LogOut, label: "Log out" },
];

export function LogoSection() {
  return (
    <GuideSection
      id="logo"
      eyebrow="03. Identity"
      title="Logo & iconography"
      description="The mark, the lockup it sits in, and the rule that keeps icons functional. Every product surface is dark, so the white cut of the mark is the one the app ships."
      delayMs={120}
    >
      <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <figure className="flex flex-col items-center gap-3 rounded-xl border border-vp-line bg-vp-surface p-6">
          <img
            src={imgLogoMarkWhite}
            alt="Vantage Point mark, white"
            className="size-24 object-contain"
          />
          <figcaption className="text-center">
            <p className="text-[15px] font-bold text-vp-ink">Primary mark</p>
            <p className="mt-1 font-mono text-[11px] text-vp-faint">
              logo-mark-white.webp
            </p>
          </figcaption>
        </figure>

        <figure className="flex flex-col items-center justify-center gap-4 rounded-xl border border-vp-line bg-vp-surface p-6">
          <div className="flex items-center gap-2.5">
            <img
              src={imgLogoMarkWhite}
              alt=""
              aria-hidden
              className="h-8 w-8 object-contain"
            />
            <span className="font-spartan text-[14px] font-bold uppercase tracking-[0.06em] text-vp-ink">
              Vantage&nbsp;Point
            </span>
          </div>
          <figcaption className="text-center">
            <p className="text-[15px] font-bold text-vp-ink">The lockup</p>
            <p className="mt-1 text-[13px] leading-relaxed text-vp-dim">
              Mark at 32px, 10px gap, wordmark at 14px in League Spartan. The
              sidebar, the auth header, and the landing nav all use this exact
              build.
            </p>
          </figcaption>
        </figure>

        <figure className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-vp-line-strong bg-vp-surface/60 p-6">
          <img
            src={imgLogoMark}
            alt="Full colour mark on a light plate"
            className="size-24 rounded-lg bg-white object-contain p-2"
          />
          <figcaption className="text-center">
            <p className="text-[15px] font-bold text-vp-ink">Light plate</p>
            <p className="mt-1 text-[13px] leading-relaxed text-vp-dim">
              <Code>logo-mark.webp</Code> is the full colour cut for anything
              printed or set on white. No product screen uses it;{" "}
              <Code>logo.webp</Code> survives only in the admin shell.
            </p>
          </figcaption>
        </figure>
      </div>

      <div className="mb-10 grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-vp-line bg-vp-surface p-5">
          <h4 className="mb-3 text-[15px] font-bold text-vp-ink">
            Clear space & sizing
          </h4>
          <ul className="list-disc space-y-2 pl-5 text-[13px] leading-relaxed text-vp-dim">
            <li>
              Keep a margin of at least{" "}
              <strong className="font-bold text-vp-ink">
                a quarter of the mark height
              </strong>{" "}
              clear on all sides.
            </li>
            <li>
              Chrome lockup: 28px in the collapsed rail, 32px everywhere else.
              The wordmark never grows with it.
            </li>
            <li>
              Hero and loading screens size the mark with a clamp so it tracks
              the viewport instead of stepping at a breakpoint.
            </li>
            <li>
              Over champion art, the mark needs a plate:{" "}
              <Code>bg-vp-canvas/80</Code> or a gradient down to the canvas.
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-vp-line bg-vp-surface p-5">
          <h4 className="mb-3 text-[15px] font-bold text-vp-ink">
            Forbidden treatments
          </h4>
          <ul className="space-y-2 text-[13px] leading-relaxed text-vp-dim">
            {FORBIDDEN.map((rule) => (
              <li key={rule} className="flex gap-2.5">
                <X
                  className="mt-0.5 size-4 shrink-0 text-vp-loss"
                  strokeWidth={1.7}
                  aria-hidden
                />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <SubHeading>Icons are functional, never decorative</SubHeading>
      <p className="mb-5 max-w-3xl text-[15px] leading-relaxed text-vp-dim">
        An icon earns its place by being the control: a nav destination, a
        toggle, a transport button. It does not sit above a card title as
        decoration. Where a panel needs visual weight, it gets it from type,
        spacing, or purpose-drawn artwork, not from a stock glyph set.
      </p>

      <div className="mb-6 grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="rounded-xl border border-vp-line bg-vp-surface p-5">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.16em] text-vp-dim">
            lucide-react, stroke 1.7
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-5">
            {FUNCTIONAL_ICONS.map(({ Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <Icon
                  className="size-[18px] text-vp-dim"
                  strokeWidth={1.7}
                  aria-hidden
                />
                <span className="text-[11px] text-vp-faint">{label}</span>
              </div>
            ))}
          </div>
          <p className="mt-5 text-[13px] leading-relaxed text-vp-dim">
            Chrome draws at 18px on a 20px box. Stroke 1.7 is the default: it
            keeps the glyph as quiet as the hairlines around it. Heavier strokes
            are reserved for the few places an icon has to read at 14px.
          </p>
        </div>

        <div className="rounded-xl border border-vp-line bg-vp-surface p-5">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-vp-dim">
            ThemedIcon
          </p>
          <p className="text-[13px] leading-relaxed text-vp-dim">
            Some glyphs ship from Figma as SVG with the stroke baked in, so an{" "}
            <Code>img</Code> cannot recolour them. <Code>ThemedIcon</Code> keeps
            the light and dark exports side by side, but since every surface is
            now dark it renders only the dark one. It no longer swaps on the
            device theme, and it no longer draws two elements per glyph.
          </p>
        </div>
      </div>
    </GuideSection>
  );
}
