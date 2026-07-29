import { useNavigate } from "react-router";
import imgBackground from "../../../assets/images/landing/landing-wallpaper.jpg";
import imgBackgroundDark from "../../../assets/images/landing/landing-wallpaper-dark.jpg";
import imgLogoMark from "../../../assets/images/logos/logo-mark-white.webp";

const MARQUEE_ITEMS = [
  "Spatial Intelligence",
  "AI Coaching",
  "Positioning",
  "Risk Prediction",
] as const;

function HeroCopy() {
  return (
    <section
      className="pointer-events-none absolute inset-0 z-[5] flex flex-col items-center justify-center px-[clamp(16px,5vw,48px)] pb-[clamp(128px,19vh,172px)] pt-[clamp(56px,12vh,140px)]"
      aria-label="Introduction"
    >
      <h1 className="max-w-[min(760px,90vw)] text-center font-['Beaufort_for_LOL',serif] text-[clamp(2rem,4vw,3.2rem)] font-bold leading-[1.4] text-white [text-shadow:0px_4px_4px_rgba(0,0,0,0.65)]">
        Turning every match into a lesson
      </h1>
      <p className="mt-[clamp(8px,1.4vh,16px)] max-w-[min(700px,88vw)] text-center font-['Beaufort_for_LOL',serif] text-[clamp(0.95rem,1.63vw,1.3rem)] font-bold leading-[1.4] text-[#e5e5e5] [text-shadow:0px_4px_4px_rgba(0,0,0,0.65)]">
        Unlock AI-powered spatial analysis that reveals where you mispositioned,
        why you lost the fight, and how top players would have played it. Level
        up with every game.
      </p>
    </section>
  );
}

function Logo() {
  return (
    <div
      className="absolute left-[2%] top-[2%] z-10 flex flex-row items-center"
      data-name="logo"
    >
      <img
        alt="Vantage Point icon"
        className="pointer-events-none h-auto w-[clamp(56px,7.5vw,104px)] shrink-0 object-contain"
        src={imgLogoMark}
      />
      <p className="ml-[clamp(8px,1.2vw,18px)] font-['League_Spartan',sans-serif] text-[clamp(20px,3vw,40px)] font-semibold uppercase leading-[1.4] tracking-[0.01em] whitespace-nowrap text-white">
        Vantage Point
      </p>
    </div>
  );
}

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
    </div>
  );
}

function Marquee() {
  return (
    <div className="absolute bottom-[3%] left-0 z-10 h-[clamp(46px,9.8vh,72px)] w-full overflow-hidden">
      <div className="flex gap-[clamp(40px,5vw,88px)] animate-scroll whitespace-nowrap">
        {[0, 1, 2].flatMap((copy) =>
          MARQUEE_ITEMS.map((item) => (
            <p
              key={`${String(copy)}-${item}`}
              className="shrink-0 font-['Beaufort_for_LOL',serif] text-[clamp(24px,3vw,42px)] font-medium leading-[clamp(46px,9.8vh,72px)] tracking-[-0.0625em] text-white drop-shadow-[0px_4px_2px_rgba(0,0,0,0.75)]"
            >
              {item}
            </p>
          )),
        )}
      </div>
    </div>
  );
}

function LandingHero() {
  return (
    <div className="absolute h-full left-0 overflow-clip top-0 w-full">
      <BackgroundLayer />
      <HeroCopy />
      <Logo />
      <Marquee />
    </div>
  );
}

function AuthActions() {
  const navigate = useNavigate();

  return (
    <div className="content-stretch flex gap-[12px] items-center justify-end relative shrink-0 w-full">
      <button
        type="button"
        onClick={() => navigate("/login")}
        className="flex h-[42px] min-w-[94px] cursor-pointer items-center justify-center rounded-[10px] bg-[#101010]/90 px-[18px] shadow-[0px_4px_4px_rgba(0,0,0,0.5)] transition-colors hover:bg-[#101010]"
      >
        <span className="font-['Beaufort_for_LOL',serif] text-[14px] font-medium leading-[1.4] text-white">
          LOGIN
        </span>
      </button>
      <button
        type="button"
        onClick={() => navigate("/register")}
        className="flex h-[42px] min-w-[94px] cursor-pointer items-center justify-center rounded-[10px] bg-[#101010]/90 px-[18px] shadow-[0px_4px_4px_rgba(0,0,0,0.5)] transition-colors hover:bg-[#101010]"
      >
        <span className="font-['Beaufort_for_LOL',serif] text-[16px] font-medium leading-[1.4] text-white">
          SIGN UP
        </span>
      </button>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="relative w-full h-full">
      <LandingHero />
      <div className="absolute right-[2%] top-[2%] z-20 flex w-fit flex-col items-start p-[12px]">
        <AuthActions />
      </div>
    </div>
  );
}
