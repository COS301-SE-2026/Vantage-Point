import { useState, useEffect } from "react";
import svgPaths from "./svg-xwtbp9m57d";
import imgRectangle1 from "./463eb708ddbeadb3c53cc0b26e34667670fe167b.webp";
import imgRectangle2 from "../Login-1/97d8c9201149029b885bb52960ef71eae5ce7ae9.webp";
import imgRectangle3 from "../Login-2/c9e85ad67d883d93480f830760511c1c35efd163.webp";
import imgRectangle4 from "../Login-3/d28b50c79a88e9246a27dde74d7163e72d0415bd.webp";
import imgRectangle5 from "../Login-4/d4b85c8bb23b5c155d2f9615ee10643ea1e3a199.webp";
import imgLogo from "./798001aef0b2686ac929f8c349135d3326ab65bb.webp";
import imgGoogle from "./e98e9b24669bda4f34daad81de74f1cbc0c60e43.webp";
import imgAppleInc from "./42dab27d0f348cbd097620054816915a603a2f3b.webp";
import imgRiotGames from "./da8e2b2b779ebc3b362dbe11022d83a4a28639da.webp";

const backgroundImages = [
  imgRectangle1,
  imgRectangle2,
  imgRectangle3,
  imgRectangle4,
  imgRectangle5,
];

const authInputClassName =
  "bg-transparent min-w-0 rounded-[8px] w-full px-[16px] py-[12px] font-['Inter:Regular',sans-serif] font-normal text-[16px] text-[#1e1e1e] placeholder:text-[#b3b3b3] border border-[#d9d9d9] focus:outline-none focus:border-[#2c2c2c] caret-[#1e1e1e] [&:-webkit-autofill]:[-webkit-text-fill-color:#1e1e1e] [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_rgb(255,255,255)] [&:-webkit-autofill]:caret-[#1e1e1e] [&:-moz-autofill]:bg-transparent";

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

function Frame({
  currentSlide,
  onDotClick,
}: {
  currentSlide: number;
  onDotClick: (index: number) => void;
}) {
  return (
    <div
      className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex gap-[8px] items-center justify-center left-[calc(50%-1px)] px-[12px] py-[8px] rounded-[50px] top-1/2"
      data-name="Frame"
    >
      {[0, 1, 2, 3, 4].map((index) => (
        <div
          key={index}
          className={`relative rounded-[50px] shrink-0 size-[8px] cursor-pointer transition-opacity duration-300 ${
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

function Group() {
  return (
    <div className="flex gap-[clamp(20px,5vw,80px)] items-center justify-center w-full">
      <button
        className="size-[60px] hover:opacity-80 transition-opacity cursor-pointer"
        data-name="Google"
      >
        <img
          alt="Sign up with Google"
          className="w-full h-full object-contain pointer-events-none"
          src={imgGoogle}
        />
      </button>
      <button
        className="size-[60px] hover:opacity-80 transition-opacity cursor-pointer"
        data-name="Apple Inc"
      >
        <img
          alt="Sign up with Apple"
          className="w-full h-full object-contain pointer-events-none"
          src={imgAppleInc}
        />
      </button>
      <button
        className="size-[60px] hover:opacity-80 transition-opacity cursor-pointer"
        data-name="Riot Games"
      >
        <img
          alt="Sign up with Riot Games"
          className="w-full h-full object-contain pointer-events-none"
          src={imgRiotGames}
        />
      </button>
    </div>
  );
}

function InputButtons1() {
  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-col gap-[8px]" data-name="Input Field">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.4] text-[#1e1e1e] text-[16px]">
          Email
        </p>
        <input
          type="email"
          placeholder="Enter email"
          className={authInputClassName}
        />
      </div>
      <div className="flex flex-col gap-[8px]" data-name="Input Field">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.4] text-[#1e1e1e] text-[16px]">
          User name
        </p>
        <input
          type="text"
          placeholder="Enter username"
          className={authInputClassName}
        />
      </div>
    </div>
  );
}

function InputButtons({ showPassword }: { showPassword: boolean }) {
  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-col gap-[8px]" data-name="Input Field">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.4] text-[#1e1e1e] text-[16px]">
          Password
        </p>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Enter password"
          className={authInputClassName}
        />
      </div>
      <div className="flex flex-col gap-[8px]" data-name="Input Field">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.4] text-[#1e1e1e] text-[16px]">
          Confirm password
        </p>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Confirm password"
          className={authInputClassName}
        />
      </div>
    </div>
  );
}

function CheckboxAndLabel({
  showPassword,
  setShowPassword,
}: {
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
}) {
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

function LeftPanelForm({
  showPassword,
  setShowPassword,
}: {
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
}) {
  return (
    <div
      className="absolute left-0 top-0 z-20 box-border flex h-full w-[30%] flex-col items-center overflow-y-auto px-[clamp(16px,4vw,40px)] py-[clamp(20px,4vh,40px)]"
      data-name="left-panel"
    >
      <div className="flex w-full max-w-[min(378px,100%)] flex-col items-center gap-6">
        <Logo />
        <Group />
        <InputButtons1 />
        <div className="w-full flex flex-col gap-4">
          <InputButtons showPassword={showPassword} />
          <CheckboxAndLabel
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />
        </div>
        <button
          type="button"
          className="bg-[#2c2c2c] h-[58px] rounded-[8px] w-full cursor-pointer hover:bg-[#3c3c3c] transition-colors shrink-0"
        >
          <div className="content-stretch flex gap-[8px] items-center justify-center p-[12px] size-full">
            <p className="font-['Inter:Regular',sans-serif] font-normal leading-none not-italic text-[#f5f5f5] text-[16px] whitespace-nowrap">
              Sign Up
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}

function LogIn({
  currentSlide,
  onDotClick,
}: {
  currentSlide: number;
  onDotClick: (index: number) => void;
}) {
  return (
    <div
      className="absolute bg-white h-full left-0 overflow-clip top-0 w-full"
      data-name="Log In"
    >
      <div className="absolute h-full left-[30%] top-0 right-0">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {backgroundImages.map((img, index) => (
            <img
              key={index}
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

function Login({
  showPassword,
  setShowPassword,
  currentSlide,
  onDotClick,
}: {
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  currentSlide: number;
  onDotClick: (index: number) => void;
}) {
  return (
    <div className="absolute contents left-0 top-0" data-name="Login">
      <LogIn currentSlide={currentSlide} onDotClick={onDotClick} />
      <LeftPanelForm
        showPassword={showPassword}
        setShowPassword={setShowPassword}
      />
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

  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative size-full" data-name="Register">
      <Login
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        currentSlide={currentSlide}
        onDotClick={handleDotClick}
      />
    </div>
  );
}
