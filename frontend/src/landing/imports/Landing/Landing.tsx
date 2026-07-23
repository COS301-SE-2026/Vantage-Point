import { useNavigate } from "react-router";
import imgBackground from "../../../assets/images/landing/landing-raw-2.jpeg";
import imgLogoMark from "../../../assets/images/landing/landing-raw-3.png";

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
      <h1 className="max-w-[min(760px,90vw)] text-center font-['Cinzel',serif] text-[clamp(2rem,4vw,3.2rem)] font-bold leading-[1.2] tracking-[-0.02em] text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.65)]">
        Turning every match into a lesson
      </h1>
      <p className="mt-[clamp(8px,1.4vh,16px)] max-w-[min(700px,90vw)] text-center font-['Cinzel',serif] text-[clamp(0.95rem,1.4vw,1.2rem)] font-semibold leading-[1.4] text-[#e5e5e5] drop-shadow-[0_4px_4px_rgba(0,0,0,0.65)]">
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
      className="absolute left-[2%] top-[2%] z-10 flex flex-row items-center gap-[clamp(8px,1.4vw,16px)]"
      data-name="logo"
    >
      <div className="relative h-[clamp(52px,8vw,84px)] w-[clamp(52px,8vw,84px)] shrink-0">
        <img
          alt="Vantage Point icon"
          className="pointer-events-none absolute inset-0 size-full object-contain"
          src={imgLogoMark}
        />
      </div>
      <p className="font-['League_Spartan',sans-serif] text-[clamp(20px,2.8vw,42px)] font-semibold leading-none not-italic whitespace-nowrap text-white tracking-[0.01em]">
        VANTAGE POINT
      </p>
    </div>
  );
}

function BackgroundLayer() {
  return (
    <div className="absolute inset-0" aria-hidden>
      <img
        alt=""
        className="absolute inset-0 h-full w-full object-cover pointer-events-none"
        src={imgBackground}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/22 via-black/12 to-black/46" />
    </div>
  );
}

function Marquee() {
  return (
    <div className="absolute bottom-[3%] left-0 z-10 h-[clamp(46px,6.5vh,72px)] w-full overflow-hidden">
      <div className="flex gap-[clamp(40px,6vw,88px)] animate-scroll whitespace-nowrap">
        {[0, 1, 2].flatMap((copy) =>
          MARQUEE_ITEMS.map((item) => (
            <p
              key={`${String(copy)}-${item}`}
              className="shrink-0 font-['Cinzel',serif] text-[clamp(30px,3.8vw,48px)] font-medium leading-[clamp(46px,6.5vh,72px)] tracking-[-0.025em] text-white drop-shadow-[0_4px_2px_rgba(0,0,0,0.75)]"
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
        <span className="font-['Cinzel',serif] text-[13px] font-medium leading-[1.4] text-white">
          LOGIN
        </span>
      </button>
      <button
        type="button"
        onClick={() => navigate("/register")}
        className="flex h-[42px] min-w-[94px] cursor-pointer items-center justify-center rounded-[10px] bg-[#101010]/90 px-[18px] shadow-[0px_4px_4px_rgba(0,0,0,0.5)] transition-colors hover:bg-[#101010]"
      >
        <span className="font-['Cinzel',serif] text-[14px] font-medium leading-[1.4] text-white">
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
