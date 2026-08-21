import { useState } from "react";
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
      eyebrow="Create an account"
      title="Start reading the map"
      subtitle="Link your Riot ID after sign-up and your last match is analysed in under a minute."
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
          label="Username"
          placeholder="Player123"
          autoComplete="username"
          value={form.displayName}
          onChange={form.onDisplayNameChange}
        />

        <AuthInputField
          label="Email Address"
          placeholder="name@domain.com"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={form.onEmailChange}
        />

        <AuthInputField
          label="Password"
          placeholder="••••••••"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
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
          autoComplete="new-password"
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

        <AuthSubmitButton
          label="Register"
          loadingLabel="Creating account…"
          loading={form.loading}
        />

        <AuthSwitchPrompt
          prompt="Already have an account? "
          actionLabel="Login"
          to="/login"
          dataName="Sign in option"
          asLink
        />
      </form>
    </AuthScreen>
  );
}
