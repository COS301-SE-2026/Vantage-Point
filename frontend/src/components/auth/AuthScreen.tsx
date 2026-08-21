import { useEffect, useId, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import { authBackgroundImages, authSlideIndices } from "../../lib/backgrounds";
import imgLogoMark from "../../assets/images/logos/logo-mark-white.webp";
import imgGoogle from "../../assets/images/providers/google.webp";
import imgApple from "../../assets/images/providers/apple-white.webp";
import imgRiotGames from "../../assets/images/providers/riot-games.webp";

const backgroundImages = authBackgroundImages;
const SLIDE_DOT_INDICES = authSlideIndices;

/**
 * The dark field the dashboard palette asks for: raised surface, hairline edge,
 * gold focus. Chrome paints autofilled inputs with its own opaque background, so
 * the inset shadow re-states the surface and the fill colour re-states the ink.
 */
const inputFieldClassName =
  "w-full min-w-0 rounded-lg border border-vp-line bg-vp-raised px-4 py-3 text-[15px] text-vp-ink transition-colors placeholder:text-vp-faint caret-vp-gold focus:border-vp-gold/60 focus:outline-none focus:ring-2 focus:ring-vp-gold/15 [&:-webkit-autofill]:[-webkit-text-fill-color:#eceef2] [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#1b1e25] [&:-webkit-autofill]:caret-vp-gold";

/** The wordmark, in the same lockup the landing nav and the dashboard use. */
function Wordmark() {
  return (
    <Link
      to="/"
      className="flex shrink-0 items-center gap-2.5"
      aria-label="Vantage Point home"
    >
      <img
        src={imgLogoMark}
        alt=""
        aria-hidden
        className="h-8 w-8 object-contain"
      />
      <span className="font-spartan text-[14px] font-bold uppercase tracking-[0.06em] text-vp-ink">
        Vantage&nbsp;Point
      </span>
    </Link>
  );
}

function SocialLoginButtons({
  onSocialClick,
  verb,
}: Readonly<{ onSocialClick?: () => void; verb: string }>) {
  /** Every mark reads on the dark panel; Apple ships as the white cut. */
  const providers = [
    { id: "google", src: imgGoogle, name: "Google" },
    { id: "apple", src: imgApple, name: "Apple" },
    { id: "riot", src: imgRiotGames, name: "Riot Games" },
  ];

  return (
    <div className="flex flex-col gap-4" data-name="Social login">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-vp-line" />
        <span className="text-[10px] uppercase tracking-[0.22em] text-vp-faint">
          or continue with
        </span>
        <span className="h-px flex-1 bg-vp-line" />
      </div>

      <div className="flex items-center gap-3">
        {providers.map((provider) => (
          <button
            key={provider.id}
            type="button"
            onClick={onSocialClick}
            aria-label={`${verb} with ${provider.name}`}
            className="flex h-[46px] flex-1 cursor-pointer items-center justify-center rounded-lg border border-vp-line bg-vp-surface transition-colors hover:border-vp-line-strong hover:bg-vp-raised"
            data-name={provider.name}
          >
            <img
              alt=""
              aria-hidden
              className="pointer-events-none h-5 w-5 object-contain"
              src={provider.src}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function SlideDots({
  currentSlide,
  onDotClick,
}: Readonly<{ currentSlide: number; onDotClick: (index: number) => void }>) {
  return (
    <div
      className="flex items-center gap-2"
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
          className={`h-[6px] cursor-pointer rounded-full border-0 p-0 transition-all duration-300 ${
            index === currentSlide
              ? "w-6 bg-vp-gold"
              : "w-[6px] bg-white/35 hover:bg-white/60"
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
  const id = useId();

  return (
    <div className="flex flex-col gap-2" data-name="Input Field">
      <label
        htmlFor={id}
        className="text-[11px] font-medium uppercase tracking-[0.16em] text-vp-dim"
      >
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
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
      className="absolute right-[14px] flex cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-vp-faint transition-colors hover:text-vp-ink"
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
      className="rounded-lg border border-vp-loss/40 bg-vp-loss/10 px-4 py-3 text-[13px] leading-relaxed text-vp-loss"
      role="alert"
    >
      {message}
    </p>
  );
}

/** The gold pill submit button at the foot of every auth form. */
export function AuthSubmitButton({
  label,
  loadingLabel,
  loading,
}: Readonly<{ label: string; loadingLabel: string; loading?: boolean }>) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="h-[48px] w-full cursor-pointer rounded-lg bg-gradient-to-b from-vp-gold to-[#a9762f] text-[15px] font-semibold tracking-[0.02em] text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:brightness-100"
    >
      {loading ? loadingLabel : label}
    </button>
  );
}

/**
 * The "go to the other auth screen" line. Login pushes with a button, Register
 * with a router link, so `asLink` picks the element rather than a second copy of
 * the markup.
 */
export function AuthSwitchPrompt({
  prompt,
  actionLabel,
  to,
  dataName,
  asLink = false,
}: Readonly<{
  prompt: string;
  actionLabel: string;
  to: string;
  dataName: string;
  asLink?: boolean;
}>) {
  const navigate = useNavigate();
  const actionClassName =
    "font-semibold text-vp-gold transition-colors hover:text-vp-ink hover:underline";

  return (
    <p
      className="text-center text-[13px] leading-relaxed text-vp-dim"
      data-name={dataName}
    >
      {prompt}
      {asLink ? (
        <Link to={to} className={actionClassName}>
          {actionLabel}
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => navigate(to)}
          className={`inline cursor-pointer border-0 bg-transparent p-0 ${actionClassName}`}
        >
          {actionLabel}
        </button>
      )}
    </p>
  );
}

/**
 * Two-column auth shell in the dashboard's palette: the form panel on the dark
 * canvas, a rotating champion splash filling the rest. On narrow screens the
 * splash becomes the page background and the panel floats over it, which is why
 * the art carries a scrim on every breakpoint rather than only on the seam.
 */
export default function AuthScreen({
  children,
  onSocialClick,
  socialVerb = "Sign in",
  showSocialLogins = true,
  backgroundImage,
  eyebrow,
  title,
  subtitle,
}: Readonly<{
  children: ReactNode;
  onSocialClick?: () => void;
  socialVerb?: string;
  showSocialLogins?: boolean;
  backgroundImage?: string; // Optional: overrides the automatic slide rotation
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}>) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (backgroundImage) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [backgroundImage]);

  return (
    <div
      className="dark relative flex min-h-dvh w-full flex-col bg-vp-canvas font-beaufort text-vp-ink lg:flex-row"
      data-name="auth-screen"
      data-node-id="12:49"
    >
      {/* Champion splash: the whole page on mobile, the right column above lg.
          It is decoration, so it is hidden from assistive tech rather than
          described: the form is what the screen is about. */}
      <div
        className="absolute inset-0 lg:left-[46%]"
        aria-hidden
        data-name="splash"
      >
        <div className="absolute inset-0 overflow-hidden">
          {backgroundImage ? (
            <img
              alt=""
              className="absolute h-full w-full object-cover"
              src={backgroundImage}
            />
          ) : (
            backgroundImages.map((img, index) => (
              <img
                key={img}
                alt=""
                className={`absolute h-full w-full object-cover transition-opacity duration-1000 ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
                src={img}
              />
            ))
          )}
        </div>
        {/* Behind the panel on mobile the art has to go almost black; above lg
            only the seam and the caption strip need covering. */}
        <div className="absolute inset-0 bg-vp-canvas/80 lg:bg-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-vp-canvas via-vp-canvas/30 to-transparent" />
        <div className="absolute inset-0 hidden bg-gradient-to-r from-vp-canvas via-vp-canvas/20 to-transparent lg:block" />
      </div>

      {/* Form column */}
      <div
        className="relative z-10 flex min-h-dvh w-full flex-col lg:w-[46%] lg:min-w-[440px] lg:border-r lg:border-vp-line lg:bg-vp-canvas"
        data-name="left-panel"
        data-node-id="12:52"
      >
        {/* The wordmark is the way back to the marketing site, so the header
            carries nothing beside it. */}
        <header className="flex items-center px-6 pt-6 sm:px-10">
          <Wordmark />
        </header>

        <main className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-[420px] rounded-2xl border border-vp-line bg-vp-surface/85 p-6 backdrop-blur-xl sm:p-8 lg:bg-vp-surface">
            {title ? (
              <div className="pb-6">
                {eyebrow ? (
                  <p className="text-[11px] uppercase tracking-[0.22em] text-vp-gold">
                    {eyebrow}
                  </p>
                ) : null}
                <h1 className="mt-2.5 text-[26px] font-bold leading-tight text-vp-ink">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="mt-2 text-[13px] leading-relaxed text-vp-dim">
                    {subtitle}
                  </p>
                ) : null}
              </div>
            ) : null}

            {children}

            {showSocialLogins ? (
              <div className="pt-6">
                <SocialLoginButtons
                  onSocialClick={onSocialClick}
                  verb={socialVerb}
                />
              </div>
            ) : null}
          </div>
        </main>

        <footer className="px-6 pb-6 text-center text-[11px] text-vp-faint sm:px-10">
          Vantage Point reads your match history through the Riot Games API.
        </footer>
      </div>

      {/* Caption strip over the art, above lg only. */}
      <div className="pointer-events-none relative z-10 hidden flex-1 flex-col justify-end p-10 lg:flex">
        <p className="text-[11px] uppercase tracking-[0.22em] text-vp-gold">
          Spatial intelligence for competitive play
        </p>
        <p className="mt-3 max-w-md text-[22px] font-bold leading-snug text-white">
          Every death, every rotation, every metre of the map you gave away.
        </p>
        {!backgroundImage && (
          <div className="pointer-events-auto mt-6" data-name="Page control">
            <SlideDots
              currentSlide={currentSlide}
              onDotClick={setCurrentSlide}
            />
          </div>
        )}
      </div>
    </div>
  );
}
