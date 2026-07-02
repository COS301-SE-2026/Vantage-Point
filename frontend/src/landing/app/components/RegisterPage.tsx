import { useState } from "react";
import { useNavigate } from "react-router";
import { ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import RegisterComponent, {
  type RegisterFormProps,
} from "../../imports/Register/Register";
import {
  buildAuthorizeUrl,
  isCognitoOAuthConfigured,
  type CognitoProvider,
} from "../lib/cognito-oauth";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const trimmedEmail = email.trim();
      await register({
        email: trimmedEmail,
        password,
        confirm_password: confirmPassword,
      });
      navigate("/confirm", {
        replace: true,
        state: { username: trimmedEmail, password },
      });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Registration failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const formProps: RegisterFormProps = {
    email,
    password,
    confirmPassword,
    error,
    loading,
    onEmailChange: setEmail,
    onPasswordChange: setPassword,
    onConfirmPasswordChange: setConfirmPassword,
    onSubmit: () => void handleSubmit(),
    onSocialLogin: handleSocialLogin,
    socialDisabled: !isCognitoOAuthConfigured(),
  };

  return (
    <div className="w-screen h-screen bg-white overflow-hidden">
      <RegisterComponent form={formProps} />
    </div>
  );
}
