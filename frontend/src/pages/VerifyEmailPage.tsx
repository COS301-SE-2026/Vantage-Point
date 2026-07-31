import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import AuthScreen, { AuthInputField } from "../components/auth/AuthScreen";

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
      navigate("/login", { state: { message: "Account verified! Please log in." } });
    } catch (err: any) {
      setError(err.message || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-white device-dark:bg-[#181818] overflow-hidden">
      <AuthScreen socialVerb="Confirm" backgroundImage={undefined}>
        <form onSubmit={handleVerify} className="flex w-full flex-col gap-5">
          <div className="text-center">
            <h2 className="text-xl font-bold device-dark:text-white">Verify Account</h2>
            <p className="text-sm text-gray-500">Enter the code sent to {email}</p>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <AuthInputField
            label="Verification Code"
            placeholder="6-digit code"
            value={code}
            onChange={setCode}
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-[#2c2c2c] h-[58px] rounded-[8px] w-full text-white hover:bg-[#3c3c3c] transition-colors"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>
      </AuthScreen>
    </div>
  );
}
