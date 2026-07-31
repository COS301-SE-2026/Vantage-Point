import { useState } from "react";
import { Link } from "react-router";
import AuthScreen, {
  AuthFormError,
  AuthInputField,
  AuthSubmitButton,
  AuthSwitchPrompt,
  PasswordVisibilityToggle,
} from "./AuthScreen";

export type RegisterFormProps = Readonly<{
  email: string;
  displayName: string;
  password: string;
  confirmPassword: string;
  error?: string | null;
  loading?: boolean;
  onEmailChange: (value: string) => void;
  onDisplayNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onSocialClick?: () => void;
}>;

interface RegisterProps {
  form: RegisterFormProps;
  backgroundImage?: string;
}

export default function Register({
  form,
  backgroundImage,
}: Readonly<RegisterProps>) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <AuthScreen
      onSocialClick={form.onSocialClick}
      socialVerb="Sign up"
      backgroundImage={backgroundImage}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.onSubmit();
        }}
        className="flex w-full flex-col gap-5"
      >
        {form.error && (
          <p className="text-[14px] text-red-600 text-center" role="alert">
            {form.error}
          </p>
        )}

        <AuthInputField
          label="Username"
          placeholder="gameName#1234"
          value={form.displayName}
          onChange={form.onDisplayNameChange}
        />

        <AuthInputField
          label="Email Address"
          placeholder="name@domain.com"
          type="email"
          value={form.email}
          onChange={form.onEmailChange}
        />

        <AuthInputField
          label="Password"
          placeholder="••••••••"
          type={showPassword ? "text" : "password"}
          value={form.password}
          onChange={form.onPasswordChange}
          trailing={
            <PasswordVisibilityToggle
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              fieldLabel="password"
            />
          }
        />

        <AuthInputField
          label="Confirm Password"
          placeholder="••••••••"
          type={showConfirmPassword ? "text" : "password"}
          value={form.confirmPassword}
          onChange={form.onConfirmPasswordChange}
          trailing={
            <PasswordVisibilityToggle
              showPassword={showConfirmPassword}
              setShowPassword={setShowConfirmPassword}
              fieldLabel="password confirmation"
            />
          }
        />

        <button
          type="submit"
          disabled={form.loading}
          className="bg-[#2c2c2c] h-[58px] rounded-[8px] w-full text-white hover:bg-[#3c3c3c] transition-colors disabled:opacity-60"
        >
          {form.loading ? "Creating account..." : "Register"}
        </button>

        <div className="text-center mt-4">
          <p className="text-[#b3b3b3] text-[16px]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-black font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </form>
    </AuthScreen>
  );
}
