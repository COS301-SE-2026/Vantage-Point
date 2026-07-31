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

function RegistrationLink() {
  const navigate = useNavigate();
  return (
    <div
      className="flex items-center justify-center w-full"
      data-name="Sign up option"
    >
      <p className="font-['Inter:Regular',sans-serif] font-normal text-[#b3b3b3] device-dark:text-[#929292] text-[16px] leading-[1.4] text-center">
        {`Don't have an account? `}
        <button
          type="button"
          onClick={() => navigate("/register")}
          className="inline border-0 bg-transparent p-0 font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#0b0b0b] device-dark:text-white cursor-pointer hover:underline"
        >
          Sign Up
        </button>
      </p>
    </div>
  );
}

export default function Login({ form, backgroundImage }: Readonly<LoginProps>) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthScreen
      onSocialClick={form.onSocialClick}
      socialVerb="Sign in"
      backgroundImage={backgroundImage}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.onSubmit();
        }}
        className="flex w-full flex-col gap-6"
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

        <RegistrationLink />
      </form>
    </AuthScreen>
  );
}
