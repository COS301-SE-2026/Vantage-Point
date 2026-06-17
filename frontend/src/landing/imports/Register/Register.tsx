// frontend/src/landing/imports/Register/Register.tsx
import { useState, useEffect } from "react";
import {
  landingBackgroundImages,
  landingSlideIndices,
} from "../../lol-wallpapers/backgrounds";

// Brand & Provider Image Assets
import imgLogo from "../../../assets/images/logos/logo.webp";
import imgGoogle from "./e98e9b24669bda4f34daad81de74f1cbc0c60e43.webp";
import imgAppleInc from "./42dab27d0f348cbd097620054816915a603a2f3b.webp";
import imgRiotGames from "./da8e2b2b779ebc3b362dbe11022d83a4a28639da.webp";

const backgroundImages = landingBackgroundImages;
const SLIDE_DOT_INDICES = landingSlideIndices;

const authInputClassName =
  "bg-transparent min-w-0 rounded-[8px] w-full px-[16px] py-[12px] font-['Inter:Regular',sans-serif] font-normal text-[16px] text-[#1e1e1e] placeholder:text-[#b3b3b3] border border-[#d9d9d9] focus:outline-none focus:border-[#2c2c2c] caret-[#1e1e1e] [&:-webkit-autofill]:[-webkit-text-fill-color:#1e1e1e] [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_rgb(255,255,255)] [&:-webkit-autofill]:caret-[#1e1e1e] [&:-moz-autofill]:bg-transparent";

const MARQUEE_ITEMS = [
  "Spatial Intelligence",
  "AI Coaching",
  "Positioning",
  "Risk Prediction",
] as const;

function Logo() {
  return (
    <div
      className="relative z-20 flex w-full shrink-0 flex-col items-center gap-4"
      data-name="logo"
    >
      <div className="w-[120px] h-[110px] flex items-center justify-center">
        <img
          alt="Vantage Point Logo"
          className="object-contain size-full max-h-full"
          src={imgLogo}
        />
      </div>
      <p className="font-['Sarina:Regular',sans-serif] leading-none text-[32px] text-black whitespace-nowrap">
        Vantage Point
      </p>
    </div>
  );
}

function SocialProviders() {
  const providers = [
    { id: "google", src: imgGoogle, alt: "Google logo" },
    { id: "apple", src: imgAppleInc, alt: "Apple logo" },
    { id: "riot", src: imgRiotGames, alt: "Riot Games logo" },
  ];

  return (
    <div className="flex flex-col gap-4 w-full mt-6">
      <p className="text-center text-sm text-[#b3b3b3] font-medium uppercase tracking-wider">
        Or sign up with
      </p>
      <div className="flex gap-4 items-center justify-between w-full">
        {providers.map((provider) => (
          <button
            key={provider.id}
            type="button"
            className="flex flex-1 items-center justify-center h-[54px] border border-[#d9d9d9] rounded-[8px] hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <img
              src={provider.src}
              alt={provider.alt}
              className="h-6 w-auto object-contain"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function Marquee() {
  return (
    <div className="flex flex-row gap-[48px] items-center min-w-full shrink-0 animate-marquee whitespace-nowrap">
      {MARQUEE_ITEMS.map((item, index) => (
        <div
          key={`reg-marquee-1-${index}`}
          className="flex flex-row gap-[48px] items-center shrink-0"
        >
          <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.4] text-[#f5f5f5] text-[16px] uppercase tracking-wider">
            {item}
          </p>
          <div className="bg-[#f5f5f5] rounded-[50px] shrink-0 size-[6px]" />
        </div>
      ))}
      {MARQUEE_ITEMS.map((item, index) => (
        <div
          key={`reg-marquee-2-${index}`}
          className="flex flex-row gap-[48px] items-center shrink-0"
          aria-hidden="true"
        >
          <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.4] text-[#f5f5f5] text-[16px] uppercase tracking-wider">
            {item}
          </p>
          <div className="bg-[#f5f5f5] rounded-[50px] shrink-0 size-[6px]" />
        </div>
      ))}
    </div>
  );
}

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % backgroundImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex w-screen h-screen min-h-[100dvh] overflow-hidden bg-white select-none">
      {/* LEFT FORM COLUMN */}
      <div className="w-[463px] h-full bg-white z-20 shadow-2xl flex flex-col justify-between items-center py-10 px-8 border-r border-neutral-100 shrink-0">
        <Logo />

        <form
          className="w-full flex flex-col gap-5 mt-4"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-semibold text-neutral-700">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@domain.com"
              className={authInputClassName}
              required
            />
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-semibold text-neutral-700">
              Password
            </label>
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={authInputClassName}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-sm font-medium transition-colors"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-[54px] bg-[#2c2c2c] hover:bg-black text-white font-medium rounded-[8px] transition-colors mt-2"
          >
            Create Account
          </button>

          <SocialProviders />
        </form>

        <p className="text-sm text-neutral-500">
          Already have an account?{" "}
          <a href="/login" className="text-black font-semibold hover:underline">
            Sign In
          </a>
        </p>
      </div>

      {/* RIGHT WALLPAPER SLIDER COLUMN */}
      <div className="relative flex-1 h-full z-10 bg-neutral-900">
        {backgroundImages.map((bgImage, idx) => (
          <div
            key={`slide-img-${idx}`}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <img
              alt="League Gameplay Landscape context"
              className="w-full h-full object-cover pointer-events-none filter brightness-[0.4]"
              src={bgImage}
            />
          </div>
        ))}

        {/* Hero Copy Overlay */}
        <section className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-12 pb-24 pointer-events-none">
          <h1 className="text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md">
            Master the Map,
            <br />
            Own Your Games.
          </h1>
          <p className="mt-4 max-w-md text-lg text-white/80 drop-shadow-sm">
            Advanced AI telemetry built to transform complex match tracking
            arrays into sharp decisions.
          </p>
        </section>

        {/* Endless rolling marquee info bar */}
        <div className="absolute bg-white/10 backdrop-blur-md border-y border-white/20 bottom-[142px] flex flex-row items-center left-0 overflow-hidden py-4 w-full z-20">
          <Marquee />
        </div>

        {/* Dots Navigation indicators control */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 items-center justify-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-full z-30">
          {SLIDE_DOT_INDICES.map((index) => (
            <button
              type="button"
              key={`dot-${index}`}
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => setCurrentSlide(index)}
              className={`size-2.5 rounded-full border-0 p-0 transition-all duration-300 cursor-pointer ${
                index === currentSlide
                  ? "bg-white scale-110 opacity-100"
                  : "bg-white/40 opacity-50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
