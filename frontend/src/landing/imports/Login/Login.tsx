import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import svgPaths from "./svg-jgo840jab8";
import {
  landingBackgroundImages,
  landingSlideIndices,
} from "../../lol-wallpapers/backgrounds";
import imgLogo from "./798001aef0b2686ac929f8c349135d3326ab65bb.webp";
import imgGoogle from "../Register/e98e9b24669bda4f34daad81de74f1cbc0c60e43.webp";
import imgAppleInc from "../Register/42dab27d0f348cbd097620054816915a603a2f3b.webp";
import imgRiotGames from "../Register/da8e2b2b779ebc3b362dbe11022d83a4a28639da.webp";

const backgroundImages = landingBackgroundImages;

const authInputClassName =
  "bg-transparent min-w-0 rounded-[8px] w-full px-[16px] py-[12px] font-['Inter:Regular',sans-serif] font-normal text-[16px] text-[#1e1e1e] placeholder:text-[#b3b3b3] border border-[#d9d9d9] focus:outline-none focus:border-[#2c2c2c] caret-[#1e1e1e] [&:-webkit-autofill]:[-webkit-text-fill-color:#1e1e1e] [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_rgb(255,255,255)] [&:-webkit-autofill]:caret-[#1e1e1e] [&:-moz-autofill]:bg-transparent";

const SLIDE_DOT_INDICES = landingSlideIndices;

type FrameSlideProps = Readonly<{
  currentSlide: number;
  onDotClick: (index: number) => void;
}>;

type ShowPasswordProps = Readonly<{
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
}>;

function Logo() {
  return (
    <div
      className="relative z-20 flex w-full shrink-0 flex-col items-center"
      data-name="logo"
    >
      <div className="h-[clamp(120px,18vw,200px)] w-[clamp(120px,18vw,200px)]">
        <img
          alt=""
          className="pointer-events-none h-full w-full object-cover"
          src={imgLogo}
        />
      </div>
      <p className="relative z-30 -mt-6 -translate-y-10 text-center font-sarina text-[clamp(20px,2.5vw,32px)] leading-normal not-italic whitespace-nowrap text-black">
        Vantage Point
      </p>
    </div>
  );
}

function SocialLoginButtons() {
  return (
    <div
      className="flex w-full gap-[clamp(20px,5vw,80px)] items-center justify-center"
      data-name="Social login"
    >
      <button
        type="button"
        className="size-[60px] hover:opacity-80 transition-opacity cursor-pointer"
        data-name="Google"
      >
        <img
          alt="Sign in with Google"
          className="w-full h-full object-contain pointer-events-none"
          src={imgGoogle}
        />
      </button>
      <button
        type="button"
        className="size-[60px] hover:opacity-80 transition-opacity cursor-pointer"
        data-name="Apple Inc"
      >
        <img
          alt="Sign in with Apple"
          className="w-full h-full object-contain pointer-events-none"
          src={imgAppleInc}
        />
      </button>
      <button
        type="button"
        className="size-[60px] hover:opacity-80 transition-opacity cursor-pointer"
        data-name="Riot Games"
      >
        <img
          alt="Sign in with Riot Games"
          className="w-full h-full object-contain pointer-events-none"
          src={imgRiotGames}
        />
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
          key={`login-slide-dot-${String(index)}`}
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

function Input() {
  return (
    <input
      type="email"
      placeholder="What's your email address?"
      className={authInputClassName}
    />
  );
}

function Input1({ showPassword }: Readonly<{ showPassword: boolean }>) {
  return (
    <input
      type={showPassword ? "text" : "password"}
      placeholder="What's your password?"
      className={authInputClassName}
    />
  );
}

function CheckboxAndLabel({
  showPassword,
  setShowPassword,
}: ShowPasswordProps) {
  return (
    <label
      className="flex gap-[12px] items-center cursor-pointer self-start mt-1"
      data-name="Checkbox and Label"
    >
      <input
        type="checkbox"
        checked={showPassword}
        onChange={(e) => setShowPassword(e.target.checked)}
        className="sr-only"
      />
      <div
        className={`flex shrink-0 items-center justify-center rounded-[4px] size-[16px] transition-colors ${showPassword ? "bg-[#2c2c2c]" : "bg-white border border-[#d9d9d9]"}`}
      >
        {showPassword && (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 12.2667 8.93333">
            <path
              d={svgPaths.p2ea7ce0}
              stroke="#F5F5F5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.6"
            />
          </svg>
        )}
      </div>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.4] text-[#1e1e1e] text-[16px]">
        Show password
      </p>
    </label>
  );
}

function CheckboxAndLabel1() {
  const navigate = useNavigate();

  return (
    <div
      className="flex items-center justify-center w-full"
      data-name="Checkbox and Label"
    >
      <p className="font-['Inter:Regular',sans-serif] font-normal text-[#b3b3b3] text-[16px] leading-[1.4] text-center">
        {`Don't have an account? `}
        <button
          type="button"
          onClick={() => navigate("/register")}
          className="inline border-0 bg-transparent p-0 font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#0b0b0b] cursor-pointer hover:underline"
        >
          Sign Up
        </button>
      </p>
    </div>
  );
}

function LeftPanelForm({
  showPassword,
  setShowPassword,
}: ShowPasswordProps) {
  const navigate = useNavigate();

  return (
    <div
      className="absolute left-0 top-0 z-20 box-border flex h-full w-[30%] flex-col items-center overflow-y-auto px-[clamp(16px,4vw,40px)] py-[clamp(24px,5vh,48px)]"
      data-name="left-panel"
    >
      <div className="flex w-full max-w-[min(378px,100%)] flex-1 flex-col items-center gap-8">
        <Logo />
        <SocialLoginButtons />
        <div className="flex w-full flex-col gap-6">
          <div
            className="content-stretch flex flex-col gap-[8px] items-stretch"
            data-name="Input Field"
          >
            <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.4] text-[#1e1e1e] text-[16px]">
              Email
            </p>
            <Input />
          </div>
          <div
            className="content-stretch flex flex-col gap-[8px] items-stretch"
            data-name="Input Field"
          >
            <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.4] text-[#1e1e1e] text-[16px]">
              Password
            </p>
            <Input1 showPassword={showPassword} />
            <CheckboxAndLabel
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
          </div>
          <button
            type="button"
            onClick={() => navigate("/sign-in-loading")}
            className="bg-[#2c2c2c] h-[58px] rounded-[8px] w-full cursor-pointer hover:bg-[#3c3c3c] transition-colors"
          >
            <div className="content-stretch flex gap-[8px] items-center justify-center p-[12px] size-full">
              <p className="font-['Inter:Regular',sans-serif] font-normal leading-none not-italic text-[#f5f5f5] text-[16px] whitespace-nowrap">
                Sign In
              </p>
            </div>
          </button>
          <CheckboxAndLabel1 />
        </div>
      </div>
    </div>
  );
}

function LogIn({ currentSlide, onDotClick }: FrameSlideProps) {
  return (
    <div
      className="absolute bg-white h-full left-0 overflow-clip top-0 w-full"
      data-name="log in"
    >
      <div className="absolute h-full left-[30%] top-0 right-0">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {backgroundImages.map((img, index) => (
            <img
              key={img}
              alt=""
              className={`absolute h-full w-full object-cover transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
              src={img}
            />
          ))}
        </div>
      </div>
      <div
        className="absolute h-[44px] right-[5%] bottom-[5%] w-[clamp(200px,30vw,402px)]"
        data-name="Page control"
      >
        <Frame currentSlide={currentSlide} onDotClick={onDotClick} />
      </div>
    </div>
  );
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="relative size-full" data-name="Login">
      <LogIn currentSlide={currentSlide} onDotClick={handleDotClick} />
      <LeftPanelForm
        showPassword={showPassword}
        setShowPassword={setShowPassword}
      />
    </div>
  );
}
