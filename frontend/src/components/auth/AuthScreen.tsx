import { useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import { authBackgroundImages, authSlideIndices } from "../../lib/backgrounds";
import imgLogoMark from "../../assets/images/logos/logo-mark.webp";
import imgLogoMarkWhite from "../../assets/images/logos/logo-mark-white.webp";
import imgGoogle from "../../assets/images/providers/google.webp";
import imgAppleInc from "../../assets/images/providers/apple.webp";
import imgAppleIncWhite from "../../assets/images/providers/apple-white.webp";
import imgRiotGames from "../../assets/images/providers/riot-games.webp";

const backgroundImages = authBackgroundImages;
const SLIDE_DOT_INDICES = authSlideIndices;

/** Figma 12:60 / 12:62 — the light-panel field. */
const inputFieldLightClasses =
  "bg-transparent min-w-0 rounded-[8px] w-full px-[16px] py-[12px] font-['Inter:Regular',sans-serif] font-normal text-[16px] text-[#1e1e1e] placeholder:text-[#b3b3b3] border border-[#d9d9d9] focus:outline-none focus:border-[#2c2c2c] caret-[#1e1e1e] [&:-webkit-autofill]:[-webkit-text-fill-color:#1e1e1e] [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_rgb(255,255,255)] [&:-webkit-autofill]:caret-[#1e1e1e] [&:-moz-autofill]:bg-transparent";

/**
 * Node 12:44: a filled #575757 pill (no contrasting border) with #929292
 * placeholder text. The autofill inset shadow has to be re-stated per theme,
 * otherwise Chrome paints an opaque white field over the dark panel.
 */
const inputFieldDarkClasses =
  "device-dark:bg-[#575757] device-dark:text-white device-dark:placeholder:text-[#929292] device-dark:border-[#575757] device-dark:focus:border-[#929292] device-dark:caret-white device-dark:[&:-webkit-autofill]:[-webkit-text-fill-color:#ffffff] device-dark:[&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_rgb(87,87,87)] device-dark:[&:-webkit-autofill]:caret-white";

const inputFieldClassName = `${inputFieldLightClasses} ${inputFieldDarkClasses}`;

function Logo() {
  return (
    <div
      className="relative z-20 flex w-full shrink-0 flex-col items-center gap-[clamp(6px,1.2vh,14px)]"
      data-name="logo"
    >
      <p className="text-center font-['League_Spartan',sans-serif] text-[clamp(20px,2.6vw,36px)] font-bold uppercase leading-none tracking-[0.02em] whitespace-nowrap text-black device-dark:text-[#f9f9f9]">
        Vantage Point
      </p>
      {/* The mark is a solid silhouette, so the dark panel needs the white cut. */}
      <picture>
        <source
          srcSet={imgLogoMarkWhite}
          media="(prefers-color-scheme: dark)"
        />
        <img
          alt="Vantage Point Logo"
          className="pointer-events-none h-auto w-[clamp(96px,13vw,176px)] object-contain"
          src={imgLogoMark}
        />
      </picture>
    </div>
  );
}

function SocialLoginButtons({
  onSocialClick,
  verb,
}: Readonly<{ onSocialClick?: () => void; verb: string }>) {
  /**
   * Figma 12:57–12:59. Google and Riot are full-colour marks that read on either
   * panel; the Apple mark is a solid silhouette and needs the white cut on dark.
   */
  const providers = [
    { id: "google", src: imgGoogle, name: "Google" },
    { id: "apple", src: imgAppleInc, darkSrc: imgAppleIncWhite, name: "Apple" },
    { id: "riot", src: imgRiotGames, name: "Riot Games" },
  ];

  return (
    <div
      className="flex w-full gap-[clamp(24px,4.5vw,64px)] items-center justify-center"
      data-name="Social login"
    >
      {providers.map((provider) => (
        <button
          key={provider.id}
          type="button"
          onClick={onSocialClick}
          className="h-[clamp(30px,3.2vw,44px)] w-[clamp(28px,3vw,41px)] hover:opacity-80 transition-opacity cursor-pointer border-0 bg-transparent p-0"
          data-name={provider.name}
        >
          <picture>
            {provider.darkSrc ? (
              <source
                srcSet={provider.darkSrc}
                media="(prefers-color-scheme: dark)"
              />
            ) : null}
            <img
              alt={`${verb} with ${provider.name}`}
              className="w-full h-full object-contain pointer-events-none"
              src={provider.src}
            />
          </picture>
        </button>
      ))}
    </div>
  );
}

function SlideDots({
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
          key={`auth-slide-dot-${String(index)}`}
          aria-label={`Show slide ${String(index + 1)}`}
          aria-current={index === currentSlide ? "true" : undefined}
          className={`relative rounded-[50px] shrink-0 size-[8px] cursor-pointer border-0 p-0 transition-opacity duration-300 ${
            index === currentSlide
              ? "bg-white opacity-100"
              : "bg-white opacity-40"
          }`}
          onClick={() => onDotClick(index)}
        />
      ))}
    </div>
  );
}

export function AuthInputField({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  autoComplete,
  trailing,
}: Readonly<{
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  trailing?: ReactNode;
}>) {
  return (
    <div
      className="content-stretch flex flex-col gap-[8px] items-stretch"
      data-name="Input Field"
    >
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.4] text-[#1e1e1e] device-dark:text-white text-[16px]">
        {label}
      </p>
      <div className="relative flex items-center">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-label={label}
          className={`${inputFieldClassName}${trailing ? " pr-[46px]" : ""}`}
        />
        {trailing}
      </div>
    </div>
  );
}

export function PasswordVisibilityToggle({
  showPassword,
  setShowPassword,
  fieldLabel,
}: Readonly<{
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  fieldLabel: string;
}>) {
  const Icon = showPassword ? EyeOff : Eye;
  return (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      aria-label={`${showPassword ? "Hide" : "Show"} ${fieldLabel}`}
      aria-pressed={showPassword}
      className="absolute right-[14px] flex cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[#757575] transition-colors hover:text-[#1e1e1e] device-dark:text-[#c9c9c9] device-dark:hover:text-white"
    >
      <Icon className="size-[18px]" strokeWidth={1.75} aria-hidden />
    </button>
  );
}

/** Submission failure banner, shared by every auth form. */
export function AuthFormError({
  message,
}: Readonly<{ message?: string | null }>) {
  if (!message) return null;
  return (
    <p
      className="font-['Inter:Regular',sans-serif] text-[14px] text-red-600 text-center"
      role="alert"
    >
      {message}
    </p>
  );
}

/** The dark pill submit button at the foot of every auth form. */
export function AuthSubmitButton({
  label,
  loadingLabel,
  loading,
}: Readonly<{ label: string; loadingLabel: string; loading?: boolean }>) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="bg-[#2c2c2c] h-[58px] rounded-[8px] w-full cursor-pointer hover:bg-[#3c3c3c] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <div className="content-stretch flex gap-[8px] items-center justify-center p-[12px] size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-none not-italic text-[#f5f5f5] text-[16px] whitespace-nowrap">
          {loading ? loadingLabel : label}
        </p>
      </div>
    </button>
  );
}

/**
 * Figma 12:64 / 13:490 — the "go to the other auth screen" line. Supporting copy
 * is "Supp text dark" #929292, the action itself white on dark.
 */
export function AuthSwitchPrompt({
  prompt,
  actionLabel,
  to,
  dataName,
}: Readonly<{
  prompt: string;
  actionLabel: string;
  to: string;
  dataName: string;
}>) {
  const navigate = useNavigate();
  return (
    <div
      className="flex items-center justify-center w-full"
      data-name={dataName}
    >
      <p className="font-['Inter:Regular',sans-serif] font-normal text-[#b3b3b3] device-dark:text-[#929292] text-[16px] leading-[1.4] text-center">
        {prompt}
        <button
          type="button"
          onClick={() => navigate(to)}
          className="inline border-0 bg-transparent p-0 font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#0b0b0b] device-dark:text-white cursor-pointer hover:underline"
        >
          {actionLabel}
        </button>
      </p>
    </div>
  );
}

/**
 * Two-column auth shell: rotating champion splash on the right, white form
 * panel on the left with the logo pinned top and social sign-in pinned bottom.
 */
export default function AuthScreen({
  children,
  onSocialClick,
  socialVerb = "Sign in",
  showSocialLogins = true,
  backgroundImage,
}: Readonly<{
  children: ReactNode;
  onSocialClick?: () => void;
  socialVerb?: string;
  showSocialLogins?: boolean;
  backgroundImage?: string; // Optional: overrides the automatic slide rotation
}>) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (backgroundImage) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % backgroundImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [backgroundImage]);

  return (
    <div
      className="relative size-full bg-white device-dark:bg-[#181818] overflow-clip"
      data-name="auth-screen"
      data-node-id="12:49"
    >
      {/* Right side champion splash (70% of the width) */}
      <div className="absolute h-full left-[30%] top-0 right-0 z-0">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {backgroundImage ? (
            <img
              alt="League of Legends champion splash art"
              className="absolute h-full w-full object-cover"
              src={backgroundImage}
            />
          ) : (
            backgroundImages.map((img, index) => (
              <img
                key={img}
                alt="League of Legends champion splash art"
                className={`absolute h-full w-full object-cover transition-opacity duration-1000 ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
                src={img}
              />
            ))
          )}
        </div>
      </div>

      {!backgroundImage && (
        <div
          className="absolute h-[44px] right-[5%] bottom-[5%] w-[clamp(200px,30vw,402px)] z-10"
          data-name="Page control"
        >
          <SlideDots currentSlide={currentSlide} onDotClick={setCurrentSlide} />
        </div>
      )}

      {/* Left form panel (30% of the width) */}
      <div
        className="absolute left-0 top-0 z-20 box-border flex h-full min-w-0 w-[30%] flex-col items-center justify-between gap-[clamp(16px,3vh,32px)] overflow-y-auto px-[clamp(16px,4vw,40px)] py-[clamp(24px,5vh,48px)] bg-white device-dark:bg-[#181818]"
        data-name="left-panel"
        data-node-id="12:52"
      >
        <div className="flex w-full max-w-[min(378px,100%)] shrink-0 flex-col items-center">
          <Logo />
        </div>

        <div className="flex w-full max-w-[min(378px,100%)] flex-1 flex-col items-center justify-center py-[clamp(16px,3vh,32px)]">
          {children}
        </div>

        {showSocialLogins && (
          <div className="w-full max-w-[min(378px,100%)] shrink-0">
            <SocialLoginButtons
              onSocialClick={onSocialClick}
              verb={socialVerb}
            />
          </div>
        )}
      </div>
    </div>
  );
}
