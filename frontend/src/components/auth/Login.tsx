import { useState } from "react";
import AuthScreen, {
  AuthFormError,
  AuthInputField,
  AuthSubmitButton,
  AuthSwitchPrompt,
  PasswordVisibilityToggle,
} from "./AuthScreen";

export type LoginFormProps = Readonly<{
  email: string;
  password: string;
  error?: string | null;
  loading?: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onSocialClick?: () => void;
}>;

interface LoginProps {
  form: LoginFormProps;
  backgroundImage?: string; // Optional: If passed, overrides the automatic slide rotation loop
}

export default function Login({ form, backgroundImage }: Readonly<LoginProps>) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthScreen
      onSocialClick={form.onSocialClick}
      socialVerb="Sign in"
      backgroundImage={backgroundImage}
      eyebrow="Welcome back"
      title="Sign in to Vantage Point"
      subtitle="Pick up where your last match left off."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.onSubmit();
        }}
        className="flex w-full flex-col gap-5"
      >
        <AuthFormError message={form.error} />

        <AuthInputField
          label="Username or Email"
          placeholder="john.doe@example.com or handle"
          type="text"
          autoComplete="username"
          value={form.email}
          onChange={form.onEmailChange}
        />

        <AuthInputField
          label="Password"
          placeholder="••••••••••"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
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

        <AuthSubmitButton
          label="Sign In"
          loadingLabel="Signing in…"
          loading={form.loading}
        />

        <AuthSwitchPrompt
          prompt="Don't have an account? "
          actionLabel="Sign Up"
          to="/register"
          dataName="Sign up option"
        />
      </form>
    </AuthScreen>
  );
}
