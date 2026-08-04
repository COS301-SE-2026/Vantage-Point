<<<<<<< Updated upstream
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { authBackgroundImages, authSlideIndices } from "../../lib/backgrounds";
import imgLogo from "../../assets/images/logos/logo.webp";
import imgGoogle from "../../assets/images/providers/google.webp";
import imgAppleInc from "../../assets/images/providers/apple.webp";
import imgRiotGames from "../../assets/images/providers/riot-games.webp";
=======
import { useState } from "react";
import { Link } from "react-router";
import AuthScreen, {
  AuthInputField,
  PasswordVisibilityToggle,
} from "./AuthScreen";
>>>>>>> Stashed changes

export type RegisterFormProps = Readonly<{
  email: string;
  displayName: string;
  password: string;
  confirmPassword: string;
  error?: string | null;
  loading?: boolean;
  onEmailChange: (value: string) => void;
  onDisplayNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onSocialClick?: () => void;
}>;

<<<<<<< Updated upstream
const authInputClassName =
  "bg-transparent min-w-0 rounded-[8px] w-full px-[16px] py-[12px] font-['Inter:Regular',sans-serif] font-normal text-[16px] text-[#1e1e1e] placeholder:text-[#b3b3b3] border border-[#d9d9d9] focus:outline-none focus:border-[#2c2c2c] caret-[#1e1e1e] [&:-webkit-autofill]:[-webkit-text-fill-color:#1e1e1e] [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_rgb(255,255,255)] [&:-webkit-autofill]:caret-[#1e1e1e] [&:-moz-autofill]:bg-transparent";

const MARQUEE_ITEMS = [
  "Spatial Intelligence",
  "AI Coaching",
  "Positioning",
  "Risk Prediction",
] as const;

export type RegisterFormProps = Readonly<{
  email: string;
  password: string;
  confirmPassword: string;
  error?: string | null;
  loading?: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onSocialClick?: () => void;
}>;

interface RegisterProps {
  form: RegisterFormProps;
  backgroundImage?: string;
}

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

function SocialProviders({
  onSocialClick,
}: Readonly<{ onSocialClick?: () => void }>) {
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
            onClick={onSocialClick}
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
      {MARQUEE_ITEMS.map((item) => (
        <div
          key={`reg-marquee-1-${item}`}
          className="flex flex-row gap-[48px] items-center shrink-0"
        >
          <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.4] text-[#f5f5f5] text-[16px] uppercase tracking-wider">
            {item}
          </p>
          <div className="bg-[#f5f5f5] rounded-[50px] shrink-0 size-[6px]" />
        </div>
      ))}
      {MARQUEE_ITEMS.map((item) => (
        <div
          key={`reg-marquee-2-${item}`}
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

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder: string;
}>) {
  const id = `register-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="flex flex-col gap-1 w-full">
      <label htmlFor={id} className="text-sm font-semibold text-neutral-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={authInputClassName}
      />
    </div>
  );
}

=======
interface RegisterProps {
  form: RegisterFormProps;
  backgroundImage?: string;
}

>>>>>>> Stashed changes
export default function Register({
  form,
  backgroundImage,
}: Readonly<RegisterProps>) {
<<<<<<< Updated upstream
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (backgroundImage) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % backgroundImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [backgroundImage]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (typeof form?.onSubmit === "function") {
      form.onSubmit();
    } else {
      console.warn(
        "Register form `onSubmit` function was not passed or is invalid.",
        form,
      );
    }
  };

  return (
    <div className="relative flex w-screen h-screen min-h-[100dvh] overflow-hidden bg-white select-none">
      {/* LEFT FORM COLUMN */}
      <div className="w-[463px] h-full bg-white z-20 shadow-2xl flex flex-col justify-between items-center py-10 px-8 border-r border-neutral-100 shrink-0">
        <Logo />

        <form
          className="w-full flex flex-col gap-5 mt-4"
          onSubmit={handleSubmit}
        >
          <Field
            label="Email Address"
            value={form?.email ?? ""}
            onChange={form?.onEmailChange}
            type="email"
            placeholder="name@domain.com"
          />

          {/* Password Field Group */}
          <div className="flex flex-col gap-1 w-full">
            <label
              htmlFor="register-password"
              className="text-sm font-semibold text-neutral-700"
            >
              Password
            </label>
            <div className="relative w-full">
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                value={form?.password ?? ""}
                onChange={(e) => form?.onPasswordChange(e.target.value)}
                placeholder="••••••••"
                className={authInputClassName}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-sm font-medium transition-colors cursor-pointer"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label
              htmlFor="register-confirm-password"
              className="text-sm font-semibold text-neutral-700"
            >
              Confirm Password
            </label>
            <div className="relative w-full">
              <input
                id="register-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={form?.confirmPassword ?? ""}
                onChange={(e) => form?.onConfirmPasswordChange(e.target.value)}
                placeholder="••••••••"
                className={authInputClassName}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-sm font-medium transition-colors cursor-pointer"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {form?.error ? (
            <p className="text-sm font-medium text-red-600">{form.error}</p>
          ) : null}

          <button
            type="submit"
            disabled={form?.loading}
            className="w-full h-[54px] bg-[#2c2c2c] hover:bg-black disabled:opacity-60 text-white font-medium rounded-[8px] transition-colors mt-2 cursor-pointer"
          >
            {form?.loading ? "Creating Account..." : "Create Account"}
          </button>

          <SocialProviders onSocialClick={form?.onSocialClick} />
        </form>

        <p className="text-sm text-neutral-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-black font-semibold hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>

      {/* RIGHT WALLPAPER SLIDER COLUMN */}
      <div className="relative flex-1 h-full z-10 bg-neutral-900">
        {backgroundImages.map((bgImage) => (
          <div
            key={bgImage} // Using the unique file path asset string as the key
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              backgroundImages.indexOf(bgImage) === currentSlide
                ? "opacity-100 z-10"
                : "opacity-0 z-0"
            }`}
          >
            <img
              alt="League Gameplay Context"
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
=======
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <AuthScreen
      onSocialClick={form.onSocialClick}
      socialVerb="Sign up"
      backgroundImage={backgroundImage}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.onSubmit();
        }}
        className="flex w-full flex-col gap-5"
      >
        {form.error && (
          <p className="text-[14px] text-red-600 text-center" role="alert">
            {form.error}
>>>>>>> Stashed changes
          </p>
        )}

        <AuthInputField
          label="Username"
          placeholder="gameName#1234"
          value={form.displayName}
          onChange={form.onDisplayNameChange}
        />

        <AuthInputField
          label="Email Address"
          placeholder="name@domain.com"
          type="email"
          value={form.email}
          onChange={form.onEmailChange}
        />

        <AuthInputField
          label="Password"
          placeholder="••••••••"
          type={showPassword ? "text" : "password"}
          value={form.password}
          onChange={form.onPasswordChange}
          trailing={
            <PasswordVisibilityToggle
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              fieldLabel="password"
            />
          }
        />

        <AuthInputField
          label="Confirm Password"
          placeholder="••••••••"
          type={showConfirmPassword ? "text" : "password"}
          value={form.confirmPassword}
          onChange={form.onConfirmPasswordChange}
          trailing={
            <PasswordVisibilityToggle
              showPassword={showConfirmPassword}
              setShowPassword={setShowConfirmPassword}
              fieldLabel="password confirmation"
            />
          }
        />

        <button
          type="submit"
          disabled={form.loading}
          className="bg-[#2c2c2c] h-[58px] rounded-[8px] w-full text-white hover:bg-[#3c3c3c] transition-colors disabled:opacity-60"
        >
          {form.loading ? "Creating account..." : "Register"}
        </button>

        <div className="text-center mt-4">
          <p className="text-[#b3b3b3] text-[16px]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-black font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </form>
    </AuthScreen>
  );
}
