import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  authBackgroundImages,
  authSlideIndices,
} from "../../lib/backgrounds";
import imgLogo from "../../assets/images/logos/logo.webp";
import imgGoogle from "../../assets/images/providers/google.webp";
import imgAppleInc from "../../assets/images/providers/apple.webp";
import imgRiotGames from "../../assets/images/providers/riot-games.webp";

// Shared SVG checkmark path
const checkmarkPath = "M11.4667 0.8L4.13333 8.13333L0.8 4.8";

const backgroundImages = authBackgroundImages;
const SLIDE_DOT_INDICES = authSlideIndices;

const authInputClassName =
  "bg-transparent min-w-0 rounded-[8px] w-full px-[16px] py-[12px] font-['Inter:Regular',sans-serif] font-normal text-[16px] text-[#1e1e1e] placeholder:text-[#b3b3b3] border border-[#d9d9d9] focus:outline-none focus:border-[#2c2c2c] caret-[#1e1e1e] [&:-webkit-autofill]:[-webkit-text-fill-color:#1e1e1e] [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_rgb(255,255,255)] [&:-webkit-autofill]:caret-[#1e1e1e] [&:-moz-autofill]:bg-transparent";

export type LoginFormProps = Readonly<{
  email: string;
  password: string;
  error?: string | null;
  loading?: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onSocialClick?: () => void;
}>;

interface LoginProps {
  form: LoginFormProps;
  backgroundImage?: string; // Optional: If passed, overrides the automatic slide rotation loop
}

function Logo() {
  return (
    <div
      className="relative z-20 flex w-full shrink-0 flex-col items-center"
      data-name="logo"
    >
      <div className="h-[clamp(120px,18vw,200px)] w-[clamp(120px,18vw,200px)]">
        <img
          alt="Vantage Point Logo"
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

function SocialLoginButtons({
  onSocialClick,
}: Readonly<{ onSocialClick?: () => void }>) {
  return (
    <div
      className="flex w-full gap-[clamp(20px,5vw,80px)] items-center justify-center"
      data-name="Social login"
    >
      <button
        type="button"
        onClick={onSocialClick}
        className="size-[60px] hover:opacity-80 transition-opacity cursor-pointer border-0 bg-transparent p-0"
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
        onClick={onSocialClick}
        className="size-[60px] hover:opacity-80 transition-opacity cursor-pointer border-0 bg-transparent p-0"
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
        onClick={onSocialClick}
        className="size-[60px] hover:opacity-80 transition-opacity cursor-pointer border-0 bg-transparent p-0"
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

function Frame({
  currentSlide,
  onDotClick,
}: Readonly<{ currentSlide: number; onDotClick: (index: number) => void }>) {
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

function InputField({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
}: Readonly<{
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}>) {
  return (
    <div
      className="content-stretch flex flex-col gap-[8px] items-stretch"
      data-name="Input Field"
    >
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.4] text-[#1e1e1e] text-[16px]">
        {label}
      </p>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={authInputClassName}
      />
    </div>
  );
}

function CheckboxAndLabel({
  showPassword,
  setShowPassword,
}: Readonly<{
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
}>) {
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
        className={`flex shrink-0 items-center justify-center rounded-[4px] size-[16px] transition-colors ${
          showPassword ? "bg-[#2c2c2c]" : "bg-white border border-[#d9d9d9]"
        }`}
      >
        =
        {showPassword && (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 12.2667 8.93333">
            <path
              d={checkmarkPath}
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

function RegistrationLink() {
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

export default function Login({ form, backgroundImage }: Readonly<LoginProps>) {
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-rotating slider hook for standard rotation (if no hardcoded single override image is passed)
  useEffect(() => {
    if (backgroundImage) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % backgroundImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [backgroundImage]);

  return (
    <div
      className="relative size-full bg-white overflow-clip"
      data-name="Login"
    >
      {/* Right Side Wallpaper Area (Takes 70% width exactly like your old layout view) */}
      <div className="absolute h-full left-[30%] top-0 right-0 z-0">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {backgroundImage ? (
            // Single override wallpaper mode (e.g. static Champion screen)
            <img
              alt="League of Legends Wallpaper"
              className="absolute h-full w-full object-cover"
              src={backgroundImage}
            />
          ) : (
            // Normal auto-looping rotational slide mode
            backgroundImages.map((img, index) => (
              <img
                key={img}
                alt="League of Legends Background Slide"
                className={`absolute h-full w-full object-cover transition-opacity duration-1000 ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
                src={img}
              />
            ))
          )}
        </div>
      </div>

      {/* Slide Pagination Dots Indicator */}
      {!backgroundImage && (
        <div
          className="absolute h-[44px] right-[5%] bottom-[5%] w-[clamp(200px,30vw,402px)] z-10"
          data-name="Page control"
        >
          <Frame currentSlide={currentSlide} onDotClick={setCurrentSlide} />
        </div>
      )}

      {/* Left Side Form Stack (Occupies exactly 30% spacing matching the original aspect ratio) */}
      <div
        className="absolute left-0 top-0 z-20 box-border flex h-full min-w-0 w-[30%] flex-col items-center overflow-y-auto px-[clamp(16px,4vw,40px)] py-[clamp(24px,5vh,48px)] bg-white"
        data-name="left-panel"
      >
        <div className="flex w-full max-w-[min(378px,100%)] flex-1 flex-col items-center gap-8">
          <Logo />
          <SocialLoginButtons onSocialClick={form.onSocialClick} />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.onSubmit();
            }}
            className="flex w-full flex-col gap-6"
          >
            {form.error && (
              <p
                className="font-['Inter:Regular',sans-serif] text-[14px] text-red-600 text-center"
                role="alert"
              >
                {form.error}
              </p>
            )}

            <InputField
              label="Email"
              placeholder="What's your email address?"
              type="email"
              value={form.email}
              onChange={form.onEmailChange}
            />

            <div className="flex flex-col gap-[8px]">
              <InputField
                label="Password"
                placeholder="What's your password?"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={form.onPasswordChange}
              />
              <CheckboxAndLabel
                showPassword={showPassword}
                setShowPassword={setShowPassword}
              />
            </div>

            <button
              type="submit"
              disabled={form.loading}
              className="bg-[#2c2c2c] h-[58px] rounded-[8px] w-full cursor-pointer hover:bg-[#3c3c3c] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div className="content-stretch flex gap-[8px] items-center justify-center p-[12px] size-full">
                <p className="font-['Inter:Regular',sans-serif] font-normal leading-none not-italic text-[#f5f5f5] text-[16px] whitespace-nowrap">
                  {form.loading ? "Signing in…" : "Sign In"}
                </p>
              </div>
            </button>

            <RegistrationLink />
          </form>
        </div>
      </div>
    </div>
  );
}
