import { Link } from "react-router";
import imgLogoMarkWhite from "../assets/images/logos/logo-mark-white.webp";
import { AccessibilitySection } from "./style-guide/AccessibilitySection";
import { ColourSection } from "./style-guide/ColourSection";
import { ComponentsSection } from "./style-guide/ComponentsSection";
import { NAV_ITEMS } from "./style-guide/GuideSection";
import { LayoutSection } from "./style-guide/LayoutSection";
import { LogoSection } from "./style-guide/LogoSection";
import { TokensSection } from "./style-guide/TokensSection";
import { TypographySection } from "./style-guide/TypographySection";
import { VoiceSection } from "./style-guide/VoiceSection";

/**
 * The live brand guide.
 *
 * It carries `dark` and `font-beaufort` for the same reasons the product does:
 * the app is a single dark theme regardless of the device setting, and the
 * shadcn primitives demonstrated further down are class-driven, so they only
 * render the way the dashboard renders them inside a `dark` subtree. Setting
 * the face once here means every section below reads in the display serif
 * without repeating a family, which is how the rest of the app does it too.
 */
export default function StyleGuidePage() {
  return (
    <div className="dark min-h-screen bg-vp-canvas font-beaufort text-vp-ink">
      <a
        href="#colour"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-vp-gold focus:px-3 focus:py-2 focus:text-black"
      >
        Skip to content
      </a>

      <header className="relative overflow-hidden border-b border-vp-line">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 0%, rgba(224,180,108,0.14), transparent 55%), radial-gradient(circle at 15% 90%, rgba(224,180,108,0.05), transparent 45%)",
          }}
        />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pb-14 pt-10 text-center md:px-8 md:pb-16 md:pt-14">
          <Link
            to="/"
            className="mb-8 text-[13px] text-vp-faint underline-offset-4 transition-colors hover:text-vp-ink hover:underline"
          >
            Back to app
          </Link>
          <img
            src={imgLogoMarkWhite}
            alt="Vantage Point"
            className="mb-5 size-[clamp(72px,14vw,116px)] animate-vantage-breathe object-contain"
          />
          <h1 className="font-spartan text-[clamp(28px,5vw,48px)] font-bold uppercase leading-tight tracking-[0.06em] text-vp-ink">
            Vantage Point
          </h1>
          <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-vp-dim md:text-[18px]">
            The live design system behind the app: the dark surface palette, the
            two brand faces, and the primitives every dashboard tab is built
            from.
          </p>
        </div>
      </header>

      <nav
        aria-label="Style guide sections"
        className="sticky top-0 z-40 border-b border-vp-line bg-vp-canvas/85 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 md:px-8">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="shrink-0 rounded-lg px-3 py-2 text-[13px] text-vp-dim transition-colors hover:bg-vp-raised hover:text-vp-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vp-gold/50"
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
      </main>
    </div>
  );
}
