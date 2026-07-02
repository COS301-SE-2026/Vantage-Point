import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithOAuthCode } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const oauthError = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");
    if (oauthError) {
      setError(errorDescription ?? oauthError);
      return;
    }

    const code = searchParams.get("code");
    if (!code) {
      setError("Missing authorization code.");
      return;
    }

    void (async () => {
      try {
        const me = await loginWithOAuthCode(code);
        if (me.has_linked_riot) {
          navigate("/loading", { replace: true });
        } else {
          navigate("/link-riot", { replace: true });
        }
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : "Social sign-in failed. Please try again.";
        setError(message);
      }
    })();
  }, [loginWithOAuthCode, navigate, searchParams]);

  if (error) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-white px-6">
        <p className="font-['Inter:Regular',sans-serif] text-center text-red-600">
          {error}
        </p>
        <button
          type="button"
          onClick={() => navigate("/login", { replace: true })}
          className="rounded-[8px] bg-[#2c2c2c] px-6 py-3 text-white hover:bg-black"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-white">
      <p className="font-['Inter:Regular',sans-serif] text-[#757575]">
        Completing sign-in…
      </p>
    </div>
  );
}
