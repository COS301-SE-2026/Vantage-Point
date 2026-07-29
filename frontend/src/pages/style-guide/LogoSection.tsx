import {
  Check,
  ChevronRight,
  Loader2,
  Search,
  Settings,
  Trophy,
  X,
} from "lucide-react";
import imgLogoMark from "../../assets/images/logos/logo-mark.webp";
import imgLogoMarkWhite from "../../assets/images/logos/logo-mark-white.webp";
import imgLogo from "../../assets/images/logos/logo.webp";
import { GuideSection } from "./GuideSection";

const FORBIDDEN = [
  "Do not stretch or distort proportions",
  "Do not recolour outside approved light / white mark treatments",
  "Do not add drop shadows, glows, or outlines to the mark",
  "Do not place the mark on busy imagery without adequate contrast",
  "Do not rotate, skew, or crop the mark into an incomplete shape",
  "Do not pair with competing brand marks in the same clear space",
];

const ICON_SIZES = [
  { label: "sm", px: 16, className: "size-4" },
  { label: "md", px: 20, className: "size-5" },
  { label: "lg", px: 24, className: "size-6" },
];

export function LogoSection() {
  return (
    <GuideSection
      id="logo"
      eyebrow="03. Identity"
      title="Logo & iconography"
      description="Logo marks, light and dark treatments, clear space, Lucide icons, and ThemedIcon for light/dark SVG pairs from Figma."
      delayMs={120}
    >
      <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <figure className="flex flex-col items-center gap-3 rounded-lg border border-border bg-white p-6 device-dark:border-[#2c2c2c]">
          <img
            src={imgLogoMark}
            alt="Vantage Point mark, full colour"
            className="size-24 object-contain"
          />
          <figcaption className="font-['Inter',sans-serif] text-xs font-semibold text-[#1e1e1e]">
            Mark (logo-mark.webp)
          </figcaption>
        </figure>
        <figure className="flex flex-col items-center gap-3 rounded-lg border border-border bg-[#181818] p-6 device-dark:border-[#2c2c2c]">
          <img
            src={imgLogoMarkWhite}
            alt="Vantage Point mark, white"
            className="size-24 object-contain"
          />
          <figcaption className="font-['Inter',sans-serif] text-xs font-semibold text-[#f5f5f5]">
            Mark white (device-dark)
          </figcaption>
        </figure>
        <figure className="flex flex-col items-center gap-3 rounded-lg border border-border bg-white p-6 device-dark:border-[#2c2c2c]">
          <div className="flex flex-col items-center gap-2">
            <img
              src={imgLogoMark}
              alt=""
              aria-hidden
              className="size-14 object-contain"
            />
            <p className="font-['League_Spartan',sans-serif] text-sm font-bold uppercase tracking-[0.06em] text-[#1e1e1e]">
              Vantage Point
            </p>
          </div>
          <figcaption className="font-['Inter',sans-serif] text-xs font-semibold text-[#1e1e1e]">
            Mark + League Spartan wordmark
          </figcaption>
        </figure>
        <figure className="flex flex-col items-center gap-3 rounded-lg border border-border bg-white p-6 device-dark:border-[#2c2c2c]">
          <img
            src={imgLogo}
            alt="Legacy logo.webp asset"
            className="size-24 object-contain"
          />
          <figcaption className="font-['Inter',sans-serif] text-xs font-semibold text-[#1e1e1e]">
            Legacy logo.webp
          </figcaption>
        </figure>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-border p-5 device-dark:border-[#2c2c2c]">
          <h3 className="mb-2 font-['Inter',sans-serif] text-sm font-semibold text-[#1e1e1e] device-dark:text-white">
            Minimum size &amp; clear space
          </h3>
          <ul className="list-disc space-y-2 pl-5 font-['Inter',sans-serif] text-sm text-[#525252] device-dark:text-[#b7b7b7]">
            <li>
              Auth / marketing mark: use responsive clamp sizing with the League
              Spartan wordmark beside or below.
            </li>
            <li>
              Dashboard header: mark + uppercase League Spartan title (
              <code className="text-xs">DashboardShell</code>).
            </li>
            <li>
              Clear space: keep empty margin of at least{" "}
              <strong className="font-semibold text-[#1e1e1e] device-dark:text-white">
                1/4 of the mark height
              </strong>{" "}
              on all sides.
            </li>
            <li>
              Assets:{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs device-dark:bg-[#3a3939]">
                logos/logo-mark.webp
              </code>
              ,{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs device-dark:bg-[#3a3939]">
                logos/logo-mark-white.webp
              </code>
            </li>
          </ul>
        </div>

        <div className="rounded-lg border border-border p-5 device-dark:border-[#2c2c2c]">
          <h3 className="mb-2 font-['Inter',sans-serif] text-sm font-semibold text-[#1e1e1e] device-dark:text-white">
            Forbidden treatments
          </h3>
          <ul className="space-y-2 font-['Inter',sans-serif] text-sm text-[#525252] device-dark:text-[#b7b7b7]">
            {FORBIDDEN.map((rule) => (
              <li key={rule} className="flex gap-2">
                <X
                  className="mt-0.5 size-4 shrink-0 text-destructive"
                  strokeWidth={2}
                  aria-hidden
                />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <h3 className="mb-3 font-['Inter',sans-serif] text-sm font-semibold uppercase tracking-wide text-[#1e1e1e] device-dark:text-white">
        Icon library: Lucide + ThemedIcon
      </h3>
      <p className="mb-4 max-w-2xl font-['Inter',sans-serif] text-sm text-[#525252] device-dark:text-[#b7b7b7]">
        Product chrome uses{" "}
        <strong className="font-semibold text-[#1e1e1e] device-dark:text-white">
          lucide-react
        </strong>{" "}
        (stroke weight 2). Figma-exported light/dark SVG pairs use{" "}
        <code className="text-xs">ThemedIcon</code>, which swaps via{" "}
        <code className="text-xs">device-dark:</code> (not{" "}
        <code className="text-xs">&lt;picture&gt;</code>) so inlined data URIs
        stay intact.
      </p>
      <div className="mb-6 flex flex-wrap gap-6 rounded-lg border border-border bg-card p-5 device-dark:border-[#2c2c2c] device-dark:bg-[#1e1e1e]">
        {(
          [
            { Icon: Search, label: "Search" },
            { Icon: Settings, label: "Settings" },
            { Icon: Trophy, label: "Trophy" },
            { Icon: Check, label: "Check" },
            { Icon: ChevronRight, label: "ChevronRight" },
            { Icon: Loader2, label: "Loader2" },
          ] as const
        ).map(({ Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2">
            <Icon
              className="size-6 text-[#1e1e1e] device-dark:text-white"
              strokeWidth={2}
            />
            <span className="font-['Inter',sans-serif] text-[11px] text-[#525252] device-dark:text-[#929292]">
              {label}
            </span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-end gap-8">
        {ICON_SIZES.map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-2">
            <Search
              className={`${s.className} text-[#1e1e1e] device-dark:text-white`}
              strokeWidth={2}
            />
            <span className="font-['Inter',sans-serif] text-xs text-[#525252] device-dark:text-[#929292]">
              {s.label} / {s.px}px
            </span>
          </div>
        ))}
      </div>
    </GuideSection>
  );
}
