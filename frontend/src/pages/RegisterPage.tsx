import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import RegisterComponent, {
  type RegisterFormProps,
} from "../components/auth/Register";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState(""); // This is the "Username"
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);

    const trimmedEmail = email.trim();
    const trimmedUsername = displayName.trim();

    // 1. Basic empty check
    if (!trimmedEmail || !trimmedUsername) {
      setError("Please fill in both Email and Username.");
      return;
    }

    // 2. COGNITO FIX: Ensure Username is NOT an email
    if (trimmedUsername.includes("@")) {
      setError("Username cannot be an email address. Use a handle like 'Player123'.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Map 'displayName' from the UI to 'username' for the API
      await register({
        username: trimmedUsername,
        email: trimmedEmail,
        password,
      });

      // Redirect to verification because Cognito starts users as UNCONFIRMED
      navigate("/verify-email", {
        state: { email: trimmedEmail, username: trimmedUsername }
      });
    } catch (err) {
      console.error("Registration failed:", err);
      let message = "Registration failed. Please try again.";
      if (err instanceof Error) message = err.message;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const formProps: RegisterFormProps = {
    email,
    displayName, // Binds to the Username input
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
