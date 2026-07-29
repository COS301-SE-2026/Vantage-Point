import { Link } from "react-router";
import imgLogoMark from "../assets/images/logos/logo-mark.webp";
import imgLogoMarkWhite from "../assets/images/logos/logo-mark-white.webp";
import { AccessibilitySection } from "./style-guide/AccessibilitySection";
import { ChangelogSection } from "./style-guide/ChangelogSection";
import { ColourSection } from "./style-guide/ColourSection";
import { ComponentsSection } from "./style-guide/ComponentsSection";
import { NAV_ITEMS } from "./style-guide/GuideSection";
import { LayoutSection } from "./style-guide/LayoutSection";
import { LogoSection } from "./style-guide/LogoSection";
import { TokensSection } from "./style-guide/TokensSection";
import { TypographySection } from "./style-guide/TypographySection";
import { VoiceSection } from "./style-guide/VoiceSection";

export default function StyleGuidePage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#f7f7f8_42%,#ffffff_100%)] text-[#1e1e1e] device-dark:bg-[linear-gradient(180deg,#181818_0%,#121212_50%,#181818_100%)] device-dark:text-[#f5f5f5]">
      <a
        href="#colour"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <header className="relative overflow-hidden border-b border-border device-dark:border-[#2c2c2c]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(74,127,212,0.12), transparent 42%), radial-gradient(circle at 80% 0%, rgba(30,126,52,0.08), transparent 35%), linear-gradient(135deg, transparent 40%, rgba(0,0,0,0.02) 100%)",
          }}
        />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pb-14 pt-10 text-center md:px-8 md:pb-16 md:pt-14">
          <Link
            to="/"
            className="mb-8 font-['Inter',sans-serif] text-xs font-medium text-[#525252] underline-offset-4 hover:text-[#1e1e1e] hover:underline device-dark:text-[#929292] device-dark:hover:text-white"
          >
            ← Back to app
          </Link>
          <img
            src={imgLogoMark}
            alt="Vantage Point"
            className="mb-5 size-[clamp(72px,14vw,120px)] animate-vantage-breathe object-contain device-dark:hidden"
          />
          <img
            src={imgLogoMarkWhite}
            alt=""
            aria-hidden
            className="mb-5 hidden size-[clamp(72px,14vw,120px)] animate-vantage-breathe object-contain device-dark:block"
          />
          <h1 className="font-['League_Spartan',sans-serif] animate-vantage-pulse text-[clamp(28px,5vw,48px)] font-bold uppercase leading-tight tracking-[0.02em] device-dark:animate-none device-dark:text-white">
            Vantage Point
          </h1>
          <p className="mt-4 max-w-xl font-['Inter',sans-serif] text-base leading-relaxed text-[#525252] md:text-lg device-dark:text-[#b7b7b7]">
            Live brand style guide and design system for Vantage Point.
          </p>
          <p className="mt-3 font-['Inter',sans-serif] text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground device-dark:text-[#929292]">
            Demo 2 / Live guide
          </p>
        </div>
      </header>

      <nav
        aria-label="Style guide sections"
        className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur-md device-dark:border-[#2c2c2c] device-dark:bg-[#181818]/90"
      >
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 md:px-8">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="shrink-0 rounded-md px-3 py-2 font-['Inter',sans-serif] text-xs font-medium text-[#525252] transition-colors hover:bg-muted hover:text-[#1e1e1e] focus-visible:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] device-dark:text-[#b7b7b7] device-dark:hover:bg-[#2a2a2a] device-dark:hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 md:px-8">
        <ColourSection />
        <TypographySection />
        <LogoSection />
        <TokensSection />
        <ComponentsSection />
        <LayoutSection />
        <AccessibilitySection />
        <VoiceSection />
        <ChangelogSection />
      </main>

      <footer className="border-t border-border py-10 text-center font-['Inter',sans-serif] text-xs text-muted-foreground device-dark:border-[#2c2c2c] device-dark:text-[#929292]">
        <p>
          Tokens sourced from{" "}
          <code className="text-[11px]">frontend/src/styles/theme.css</code> /
          Components from{" "}
          <code className="text-[11px]">frontend/src/components/ui</code>
        </p>
        <p className="mt-2">
          Route:{" "}
          <Link
            to="/style-guide"
            className="underline underline-offset-2 device-dark:text-[#b7b7b7]"
          >
            /style-guide
          </Link>
        </p>
      </footer>
    </div>
  );
}
