import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import imgBackground from "../assets/images/loading/loading-background.webp";
import imgLogoMark from "../assets/images/logos/logo-mark-white.webp";

const MIN_DISPLAY_MS = 1500;
const DOT_DELAYS_S = [0, 0.9, 1.8] as const;

export default function LoadingPage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const started = Date.now();

    void (async () => {
      await refreshUser();
      const elapsed = Date.now() - started;
      const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
      globalThis.setTimeout(() => {
        navigate("/dashboard/matches", { replace: true });
      }, remaining);
    })();
  }, [navigate, refreshUser]);

  return (
    <div
      className="relative flex min-h-dvh min-h-screen w-full items-center justify-center overflow-hidden bg-black"
      data-name="loading"
      role="status"
      aria-live="polite"
      aria-label="Loading your dashboard"
    >
      <img
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        src={imgBackground}
      />

      <div className="relative z-10 flex w-full max-w-[min(520px,88vw)] flex-col items-center px-6">
        <img
          alt=""
          aria-hidden
          className="pointer-events-none h-auto w-[clamp(120px,20vw,232px)] object-contain animate-vantage-breathe drop-shadow-[0_4px_12px_rgba(0,0,0,0.55)]"
          src={imgLogoMark}
        />

        <p className="mt-[clamp(10px,2vh,20px)] text-center font-['League_Spartan',sans-serif] text-[clamp(28px,5.6vw,64px)] font-bold uppercase leading-none tracking-[0.02em] whitespace-nowrap text-white [text-shadow:4px_4px_4px_rgba(0,0,0,0.5)]">
          Vantage Point
        </p>

        <div
          className="mt-[clamp(14px,2.6vh,26px)] h-[4px] w-full overflow-hidden rounded-full bg-white/25"
          aria-hidden
        >
          <div className="h-full w-1/4 rounded-full bg-white animate-vantage-progress" />
        </div>

        <div
          className="mt-[clamp(14px,2.4vh,24px)] flex justify-center gap-2 text-white"
          aria-hidden
        >
          {DOT_DELAYS_S.map((delay) => (
            <span
              key={delay}
              className="size-2 shrink-0 rounded-full border border-current bg-transparent animate-vantage-dot-fill"
              style={{ animationDelay: `${delay}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
