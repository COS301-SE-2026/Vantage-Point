import { useState } from "react";
import { useNavigate } from "react-router";
import { ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import LoginComponent, { type LoginFormProps } from "../../imports/Login/Login";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const me = await login({ email: email.trim(), password });
      if (me.has_linked_riot) {
        navigate("/loading", { replace: true });
      } else {
        navigate("/link-riot", { replace: true });
      }
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Sign in failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const formProps: LoginFormProps = {
    email,
    password,
    error,
    loading,
    onEmailChange: setEmail,
    onPasswordChange: setPassword,
    onSubmit: () => void handleSubmit(),
    onSocialClick: () => setError("Social sign-in is coming soon."),
  };

  return (
    <div className="w-screen h-screen bg-white overflow-hidden">
      <LoginComponent form={formProps} />
    </div>
  );
}
