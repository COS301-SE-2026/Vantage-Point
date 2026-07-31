import { useState } from "react";
import { useNavigate } from "react-router";
import { ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import LoginComponent, { type LoginFormProps } from "../components/auth/Login";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const me = await login({ username: identifier.trim(), password });

      if (me.has_linked_riot) {
        navigate("/loading", { replace: true });
      } else {
        navigate("/link-riot", { replace: true });
      }
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Sign in failed. Please check your credentials.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const formProps: LoginFormProps = {
    email: identifier, // This maps to the input value
    password,
    error,
    loading,
    onEmailChange: setIdentifier,
    onPasswordChange: setPassword,
    onSubmit: () => void handleSubmit(),
    onSocialClick: () => setError("Social sign-in is coming soon."),
  };

  return (
    <div className="w-screen h-screen bg-white device-dark:bg-[#181818] overflow-hidden">
      <LoginComponent form={formProps} />
    </div>
  );
}
