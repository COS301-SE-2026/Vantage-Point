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
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);

    const trimmedEmail = email.trim();
    const trimmedUsername = displayName.trim();

    if (!trimmedUsername) {
      setError("Please enter a username.");
      return;
    }

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
      await register({
        username: trimmedUsername,
        email: trimmedEmail,
        password,
        confirm_password: confirmPassword,
      });

      navigate("/link-riot", { replace: true });
    } catch (err) {
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
    displayName,
    password,
    confirmPassword,
    error,
    loading,
    onEmailChange: setEmail,
    onDisplayNameChange: setDisplayName,
    onPasswordChange: setPassword,
    onConfirmPasswordChange: setConfirmPassword,
    onSubmit: () => void handleSubmit(),
    onSocialClick: () => setError("Social sign-in is coming soon."),
  };

  return (
    <div className="w-screen h-screen bg-white device-dark:bg-[#181818] overflow-hidden">
      <RegisterComponent form={formProps} />
    </div>
  );
}
