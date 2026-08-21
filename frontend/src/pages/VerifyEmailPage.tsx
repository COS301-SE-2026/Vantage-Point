import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import AuthScreen, {
  AuthFormError,
  AuthInputField,
  AuthSubmitButton,
} from "../components/auth/AuthScreen";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { confirm } = useAuth();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Retrieve data passed from RegisterPage
  const email = location.state?.email || "";
  const username = location.state?.username || "";

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setError(null);
    setLoading(true);

    try {
      await confirm({ username, code });
      // Redirect to login with a success message in state
      navigate("/login", {
        state: { message: "Account verified! Please log in." },
      });
    } catch (err) {
      let message = "Invalid verification code.";
      if (err instanceof Error && err.message) message = err.message;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh w-full bg-vp-canvas">
      <AuthScreen
        showSocialLogins={false}
        eyebrow="Verify account"
        title="Check your inbox"
        subtitle={`Enter the code sent to ${email}`}
      >
        <form onSubmit={handleVerify} className="flex w-full flex-col gap-5">
          <AuthFormError message={error} />

          <AuthInputField
            label="Verification Code"
            placeholder="6-digit code"
            autoComplete="one-time-code"
            value={code}
            onChange={setCode}
          />

          <AuthSubmitButton
            label="Verify Email"
            loadingLabel="Verifying…"
            loading={loading}
          />
        </form>
      </AuthScreen>
    </div>
  );
}
