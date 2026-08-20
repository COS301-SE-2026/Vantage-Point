import { useNavigate } from "react-router";
import { ArrowRight, ChevronDown, Crosshair } from "lucide-react";
import { Spotlight } from "@/components/ui/aceternity/spotlight-new";
import { FlipWords } from "@/components/ui/aceternity/flip-words";
import { TextGenerateEffect } from "@/components/ui/aceternity/text-generate-effect";
import { HoverBorderGradient } from "@/components/ui/aceternity/hover-border-gradient";
import imgBackground from "../../assets/images/landing/landing-wallpaper.jpg";
import imgBackgroundDark from "../../assets/images/landing/landing-wallpaper-dark.jpg";
import { CAPABILITIES, HERO_FLIP_WORDS, HERO_STATS } from "../content";

/**
 * Figma 7:10 (light) and 12:104 (dark) are identical apart from the hero splash,
 * so the theme swap is just the art. <picture> resolves it from the device theme
 * in CSS — no JS, no first-paint flash, and only the matching file is fetched.
 */
function BackgroundLayer() {
  return (
    <div className="absolute inset-0" aria-hidden>
      <picture>
        <source
          srcSet={imgBackgroundDark}
          media="(prefers-color-scheme: dark)"
        />
        <img
          alt=""
          className="absolute inset-0 h-full w-full object-cover pointer-events-none"
          src={imgBackground}
        />
      </picture>
      {/* The splash is a photograph; without a scrim the headline sits on
          whatever the art happens to be doing behind it. */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-[#05060a]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(5,6,10,0.85)_100%)]" />
    </div>
  );
}

function Eyebrow() {
  return (
    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] text-neutral-300 backdrop-blur-sm sm:text-xs">
      <Crosshair className="h-3.5 w-3.5 text-[#e0b46c]" />
      Spatial intelligence for competitive play
    </div>
  );
}

function Stats() {
  return (
    <dl className="mt-14 grid w-full max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm sm:grid-cols-4">
      {HERO_STATS.map((stat) => (
        <div key={stat.label} className="bg-black/40 px-4 py-5 text-center">
          <dt className="sr-only">{stat.label}</dt>
          <dd>
            <span className="block text-2xl font-bold text-[#e0b46c] sm:text-3xl">
              {stat.value}
            </span>
            <span className="mt-1 block text-[11px] leading-tight text-neutral-400">
              {stat.label}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** The original one-viewport landing, kept as the band under the hero. */
function CapabilityStrip() {
  return (
    <div className="relative z-10 overflow-hidden border-y border-white/10 bg-black/60 py-4 backdrop-blur-sm">
      <div className="flex gap-[clamp(40px,5vw,88px)] whitespace-nowrap animate-scroll">
        {[0, 1, 2].flatMap((copy) =>
          CAPABILITIES.map((item) => (
            <p
              key={`${String(copy)}-${item}`}
              className="shrink-0 text-[clamp(18px,2.2vw,28px)] font-medium tracking-[-0.02em] text-white/70"
            >
              {item}
            </p>
          )),
        )}
      </div>
    </div>
  );
}

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <>
      <section
        id="top"
        className="relative isolate flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 pt-28 pb-16 sm:px-6"
        aria-label="Introduction"
      >
        <BackgroundLayer />
        <Spotlight
          gradientFirst="radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(38, 70%, 75%, .10) 0, hsla(38, 70%, 55%, .03) 50%, hsla(38, 70%, 45%, 0) 80%)"
          gradientSecond="radial-gradient(50% 50% at 50% 50%, hsla(190, 90%, 75%, .08) 0, hsla(190, 90%, 55%, .02) 80%, transparent 100%)"
          gradientThird="radial-gradient(50% 50% at 50% 50%, hsla(38, 70%, 75%, .05) 0, hsla(38, 70%, 45%, .02) 80%, transparent 100%)"
        />

        <div className="relative z-10 flex flex-col items-center">
          <Eyebrow />

          <h1 className="max-w-4xl text-center text-[clamp(2.1rem,5.6vw,4.25rem)] font-bold leading-[1.15] text-white [text-shadow:0_4px_24px_rgba(0,0,0,0.6)]">
            Turning every match into
            <br className="hidden sm:block" />
            <FlipWords
              words={HERO_FLIP_WORDS}
              className="text-[#e0b46c] dark:text-[#e0b46c]"
            />
          </h1>

          <TextGenerateEffect
            words="Unlock AI-powered spatial analysis that reveals where you mispositioned, why you lost the fight, and how top players would have played it."
            className="mt-2 max-w-2xl text-center font-normal opacity-80"
            duration={0.6}
          />

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <HoverBorderGradient
              as="button"
              onClick={() => navigate("/register")}
              containerClassName="rounded-full"
              className="flex items-center gap-2 bg-black px-7 py-3 text-sm font-semibold tracking-wide text-white"
            >
              Analyse my last match
              <ArrowRight className="h-4 w-4" />
            </HoverBorderGradient>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="rounded-full border border-white/15 bg-white/5 px-7 py-3 text-sm font-semibold tracking-wide text-neutral-200 backdrop-blur-sm transition hover:border-white/30 hover:text-white"
            >
              I already have an account
            </button>
          </div>

          <Stats />
        </div>

        <a
          href="#showcase"
          className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-neutral-400 transition hover:text-white"
          aria-label="Skip to the product tour"
        >
          <ChevronDown className="h-6 w-6 animate-vantage-breathe" />
        </a>
      </section>

      <CapabilityStrip />
    </>
  );
}
