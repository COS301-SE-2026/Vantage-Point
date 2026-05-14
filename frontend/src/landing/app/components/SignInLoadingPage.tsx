import { useEffect } from "react";
import { useNavigate } from "react-router";
import imgLogo from "../../imports/Login/798001aef0b2686ac929f8c349135d3326ab65bb.webp";

const LOADING_MS = 10_000;

export default function SignInLoadingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const id = window.setTimeout(() => {
      navigate("/dashboard", { replace: true });
    }, LOADING_MS);
    return () => window.clearTimeout(id);
  }, [navigate]);

  return (
    <div
      className="flex min-h-dvh min-h-screen w-full flex-col items-center justify-center bg-white"
      data-name="sign-in-loading"
    >
      <div className="relative flex flex-col items-center px-6">
        <div className="relative z-0 w-[clamp(160px,28vw,281px)] shrink-0">
          <img
            alt=""
            className="pointer-events-none h-auto w-full object-contain"
            src={imgLogo}
          />
        </div>
        <p className="relative z-10 -mt-[clamp(48px,11vw,120px)] animate-vantage-pulse text-center font-sarina text-[clamp(22px,4.2vw,40px)] leading-tight whitespace-nowrap">
          Vantage Point
        </p>
      </div>
    </div>
  );
}
