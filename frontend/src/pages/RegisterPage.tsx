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
<<<<<<< Updated upstream
=======
  const [displayName, setDisplayName] = useState(""); // This is the "Username"
>>>>>>> Stashed changes
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);

    const trimmedEmail = email.trim();
<<<<<<< Updated upstream

    // Validation checks before API call
    if (!trimmedEmail) {
      setError("Please enter your email address.");
=======
    const trimmedUsername = displayName.trim();

    // 1. Basic empty check
    if (!trimmedEmail || !trimmedUsername) {
      setError("Please fill in both Email and Username.");
      return;
    }

    // 2. COGNITO FIX: Ensure Username is NOT an email
    if (trimmedUsername.includes("@")) {
      setError(
        "Username cannot be an email address. Use a handle like 'Player123'.",
      );
      return;
    }

    // 3. The API rejects anything without an "@" with a generic 400, so catch it here
    if (!trimmedEmail.includes("@")) {
      setError("Please enter a valid email address.");
>>>>>>> Stashed changes
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

<<<<<<< Updated upstream
=======
    // Cognito's minimum, enforced by the API too
>>>>>>> Stashed changes
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
<<<<<<< Updated upstream
      // Calls AuthContext register function, which posts to /api/auth/register
      await register({
        username: trimmedEmail,
=======
      // Map 'displayName' from the UI to 'username' for the API
      await register({
        username: trimmedUsername,
>>>>>>> Stashed changes
        email: trimmedEmail,
        password,
        confirm_password: confirmPassword,
      });

<<<<<<< Updated upstream
      navigate("/link-riot", { replace: true });
    } catch (err) {
      console.error("Registration failed:", err);

      let message = "Registration failed. Please try again.";
      if (err instanceof Error) {
        message = err.message;
      }

=======
      // Redirect to verification because Cognito starts users as UNCONFIRMED
      navigate("/verify-email", {
        state: { email: trimmedEmail, username: trimmedUsername },
      });
    } catch (err) {
      console.error("Registration failed:", err);
      let message = "Registration failed. Please try again.";
      if (err instanceof Error) message = err.message;
>>>>>>> Stashed changes
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const formProps: RegisterFormProps = {
    email,
<<<<<<< Updated upstream
=======
    displayName, // Binds to the Username input
>>>>>>> Stashed changes
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
    <div className="w-screen h-screen bg-white device-dark:bg-[#181818] overflow-hidden">
      <RegisterComponent form={formProps} />
    </div>
  );
}
