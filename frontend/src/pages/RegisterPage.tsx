import { useState } from "react";
import { useNavigate } from "react-router";
import { ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import RegisterComponent, {
  type RegisterFormProps,
} from "../components/auth/Register";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);

    const trimmedEmail = email.trim();

    // Validation checks before API call
    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      // Calls AuthContext register function, which posts to /api/auth/register
      await register({
        username: trimmedEmail,
        email: trimmedEmail,
        password,
        confirm_password: confirmPassword,
      });

      navigate("/link-riot", { replace: true });
    } catch (err) {
      console.error("Registration failed:", err);

      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
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
    onSocialClick: () => setError("Social sign-in is coming soon."),
  };

  return (
    <div className="w-screen h-screen bg-white overflow-hidden">
      <RegisterComponent form={formProps} />
    </div>
  );
}
