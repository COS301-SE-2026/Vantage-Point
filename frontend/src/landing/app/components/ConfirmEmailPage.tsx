import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ApiError } from "../api/client";
import { UserNotConfirmedError } from "../api/auth";
import { useAuth } from "../context/AuthContext";

interface ConfirmLocationState {
  readonly username?: string;
  readonly password?: string;
}

export default function ConfirmEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as ConfirmLocationState;
  const { confirmAndLogin } = useAuth();

  const [username, setUsername] = useState(state.username ?? "");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [password, setPassword] = useState(state.password ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    const trimmedUsername = username.trim();
    const trimmedCode = confirmationCode.trim();

    if (!trimmedUsername || trimmedCode.length !== 6) {
      setError("Enter your email and the 6-digit confirmation code.");
      return;
    }
    if (!password) {
      setError("Enter the password you used when registering.");
      return;
    }

    setLoading(true);
    try {
      const me = await confirmAndLogin(trimmedUsername, trimmedCode, password);
      if (me.has_linked_riot) {
        navigate("/loading", { replace: true });
      } else {
        navigate("/link-riot", { replace: true });
      }
    } catch (err) {
      const message =
        err instanceof UserNotConfirmedError || err instanceof ApiError
          ? err.message
          : "Confirmation failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-white px-6">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="text-center">
          <h1 className="font-['Inter:Semi_Bold',sans-serif] text-2xl text-[#1e1e1e]">
            Confirm your email
          </h1>
          <p className="mt-2 font-['Inter:Regular',sans-serif] text-[#757575]">
            Enter the 6-digit code sent to your email address.
          </p>
        </div>

        {error && (
          <p className="text-center text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-neutral-700">Email</span>
            <input
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-[8px] border border-[#d9d9d9] px-4 py-3"
              placeholder="name@domain.com"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-neutral-700">
              Confirmation code
            </span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              className="rounded-[8px] border border-[#d9d9d9] px-4 py-3 tracking-widest"
              placeholder="000000"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-neutral-700">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-[8px] border border-[#d9d9d9] px-4 py-3"
              placeholder="Your account password"
            />
          </label>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={() => void handleSubmit()}
          className="h-[54px] rounded-[8px] bg-[#2c2c2c] text-white hover:bg-black disabled:opacity-60"
        >
          {loading ? "Confirming…" : "Confirm and sign in"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/login", { replace: true })}
          className="text-sm text-[#757575] hover:underline"
        >
          Back to sign in
        </button>
      </div>
    </div>
  );
}
