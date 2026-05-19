import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  landingBackgroundImages,
  landingSlideIndices,
} from "../../lol-wallpapers/backgrounds";
import img512732DbC4Af40C9A287649A4D140412RemovalaiPreview1 from "./7166b6362ecbe85befc7e0770705b8c3ae5f4193.webp";

const backgroundImages = landingBackgroundImages;

const MARQUEE_ITEMS = [
  "Spatial Intelligence",
  "AI Coaching",
  "Positioning",
  "Risk Prediction",
] as const;

const SLIDE_DOT_INDICES = landingSlideIndices;

type FrameSlideProps = Readonly<{
  currentSlide: number;
  onDotClick: (index: number) => void;
}>;

type CurrentSlideProps = Readonly<{ currentSlide: number }>;

function HeroCopy() {
  return (
    <section
      className="pointer-events-none absolute inset-0 z-[5] flex flex-col items-center justify-center px-[clamp(16px,5vw,48px)] pt-[clamp(48px,10vh,120px)] pb-[clamp(120px,22vh,200px)]"
      aria-label="Introduction"
    >
      <h1 className="max-w-[min(920px,92vw)] text-center text-[clamp(2rem,5.2vw,3.75rem)] font-bold leading-[1.15] tracking-[-0.02em]">
        <span className="font-sarina bg-gradient-to-r from-[#1d4ed8] via-[#3b82f6] to-[#7dd3fc] bg-clip-text text-transparent drop-shadow-sm">
          Vantage Point
        </span>
        <span className="font-['Inter',sans-serif] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)]">
          {" "}
          turns every match into a lesson.
        </span>
      </h1>
      <p className="mt-[clamp(16px,2.5vh,28px)] max-w-[min(640px,88vw)] text-center font-['Inter',sans-serif] text-[clamp(0.9375rem,1.65vw,1.125rem)] font-normal leading-[1.65] text-[#e5e5e5] drop-shadow-[0_1px_16px_rgba(0,0,0,0.5)]">
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
      className="absolute left-[2%] top-[1%] z-10 flex flex-row items-center gap-[clamp(10px,2vw,20px)]"
      data-name="logo"
    >
      <div
        className="relative h-[clamp(72px,12vw,140px)] w-[clamp(72px,12vw,140px)] shrink-0"
        data-name="512732db-c4af-40c9-a287-649a4d140412_removalai_preview 1"
      >
        <img
          alt=""
          className="pointer-events-none absolute inset-0 size-full object-contain"
          src={img512732DbC4Af40C9A287649A4D140412RemovalaiPreview1}
        />
      </div>
      <p className="-translate-y-3 font-sarina text-[clamp(20px,2.5vw,32px)] leading-normal not-italic whitespace-nowrap text-white">{`Vantage Point `}</p>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute left-0 bottom-[15%] w-full overflow-hidden h-[clamp(40px,5vh,60px)]">
      <div className="flex gap-[clamp(60px,8vw,120px)] animate-scroll whitespace-nowrap">
        {[0, 1, 2].flatMap((copy) =>
          MARQUEE_ITEMS.map((item) => (
            <p
              key={`${String(copy)}-${item}`}
              className="font-sarina leading-[clamp(40px,5vh,60px)] text-[clamp(20px,2.5vw,32px)] text-white tracking-[-1.5px] shrink-0"
            >
              {item}
            </p>
          )),
        )}
      </div>
    </div>
  );
}

function LogIn({ currentSlide }: CurrentSlideProps) {
  return (
    <div
      className="absolute h-full left-0 overflow-clip top-0 w-full"
      data-name="Log In"
    >
      {backgroundImages.map((img, index) => (
        <img
          key={img}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
          src={img}
        />
      ))}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-black/35 via-black/10 to-black/55"
      />
      <HeroCopy />
      <Logo />
      <Group1 />
    </div>
  );
}

function Login({ currentSlide }: CurrentSlideProps) {
  return (
    <div className="absolute contents left-0 top-0" data-name="Login">
      <LogIn currentSlide={currentSlide} />
    </div>
  );
}

function Register({ currentSlide }: CurrentSlideProps) {
  return (
    <div className="absolute contents left-0 top-0" data-name="Register">
      <Login currentSlide={currentSlide} />
    </div>
  );
}

function Al() {
  const navigate = useNavigate();

  return (
    <div
      className="content-stretch flex gap-[8px] items-center justify-end relative shrink-0 w-full"
      data-name="AL"
    >
      <button
        type="button"
        onClick={() => navigate("/login")}
        className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0)] flex-[1_0_0] min-h-[36px] min-w-px relative rounded-[8px] cursor-pointer"
        data-name="Button"
      >
        <div
          aria-hidden="true"
          className="absolute border border-[#d4d4d4] border-solid inset-0 pointer-events-none rounded-[8px]"
        />
        <div className="flex flex-row items-center justify-center min-h-[inherit] size-full">
          <div className="content-stretch flex gap-[8px] items-center justify-center min-h-[inherit] px-[16px] py-[8px] relative size-full">
            <div className="flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#0a0a0a] text-[14px] text-center whitespace-nowrap">
              <p className="leading-[20px]">Log In</p>
            </div>
          </div>
        </div>
      </button>
      <button
        type="button"
        onClick={() => navigate("/register")}
        className="bg-[#171717] content-stretch flex gap-[8px] items-center justify-center min-h-[36px] px-[16px] py-[8px] relative rounded-[8px] shrink-0 cursor-pointer hover:bg-[#2c2c2c] transition-colors"
        data-name="Button"
      >
        <div className="flex flex-col font-['Geist:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#fafafa] text-[14px] text-center whitespace-nowrap">
          <p className="leading-[20px]">Sign Up</p>
        </div>
      </button>
    </div>
  );
}

function Frame({ currentSlide, onDotClick }: FrameSlideProps) {
  return (
    <div
      className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex gap-[8px] items-center justify-center left-[calc(50%-1px)] px-[12px] py-[8px] rounded-[50px] top-1/2"
      data-name="Frame"
      role="tablist"
      aria-label="Background slides"
    >
      {SLIDE_DOT_INDICES.map((index) => (
        <button
          type="button"
          key={`group12-slide-dot-${String(index)}`}
          aria-label={`Show slide ${String(index + 1)}`}
          aria-current={index === currentSlide ? "true" : undefined}
          className={`relative rounded-[50px] shrink-0 size-[8px] cursor-pointer border-0 p-0 transition-opacity duration-300 ${
            index === currentSlide
              ? "bg-black opacity-100"
              : "bg-black opacity-30"
          }`}
          onClick={() => onDotClick(index)}
        />
      ))}
    </div>
  );
}

export default function Group() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % backgroundImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative w-full h-full">
      <Register currentSlide={currentSlide} />
      <div
        className="absolute content-stretch flex flex-col items-start right-[2%] p-[16px] top-[1%] w-[clamp(180px,15vw,220px)]"
        data-name="Dialog Footer"
      >
        <Al />
      </div>
      <div
        className="absolute h-[44px] left-1/2 -translate-x-1/2 bottom-[5%] w-[clamp(200px,30vw,402px)]"
        data-name="Page control"
      >
        <Frame currentSlide={currentSlide} onDotClick={handleDotClick} />
      </div>
    </div>
  );
}
