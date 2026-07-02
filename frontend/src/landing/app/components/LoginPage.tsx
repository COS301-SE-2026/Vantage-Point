import { useState } from "react";
import { useNavigate } from "react-router";
import { ApiError } from "../api/client";
import { UserNotConfirmedError } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import LoginComponent, { type LoginFormProps } from "../../imports/Login/Login";
import {
  buildAuthorizeUrl,
  isCognitoOAuthConfigured,
  type CognitoProvider,
} from "../lib/cognito-oauth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSocialLogin = (provider: CognitoProvider) => {
    if (!isCognitoOAuthConfigured()) {
      setError("Social sign-in is not configured yet.");
      return;
    }
    const url = buildAuthorizeUrl(provider);
    if (!url) {
      setError("Social sign-in is not configured yet.");
      return;
    }
    window.location.assign(url);
  };

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
      if (err instanceof UserNotConfirmedError) {
        navigate("/confirm", {
          replace: true,
          state: { username: err.username, password },
        });
        return;
      }
      const message =
        err instanceof ApiError
          ? err.message
          : "Sign in failed. Please try again.";
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
    onSocialLogin: handleSocialLogin,
    socialDisabled: !isCognitoOAuthConfigured(),
  };

  return (
    <div className="w-screen h-screen bg-white overflow-hidden">
      <LoginComponent form={formProps} />
    </div>
  );
}
