import { useState } from "react";
import { useNavigate } from "react-router";
import AuthScreen, {
  AuthInputField,
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
  backgroundImage?: string; // Optional: overrides the automatic slide rotation
}

function SignInLink() {
  const navigate = useNavigate();
  return (
    <div
      className="flex items-center justify-center w-full"
      data-name="Login option"
    >
      <p className="font-['Inter:Regular',sans-serif] font-normal text-[#b3b3b3] text-[16px] leading-[1.4] text-center">
        {`Already have an account? `}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="inline border-0 bg-transparent p-0 font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#0b0b0b] cursor-pointer hover:underline"
        >
          Login
        </button>
      </p>
    </div>
  );
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
          <p
            className="font-['Inter:Regular',sans-serif] text-[14px] text-red-600 text-center"
            role="alert"
          >
            {form.error}
          </p>
        )}

        <AuthInputField
          label="Username"
          placeholder="gameName#1234"
          autoComplete="username"
          value={form.displayName}
          onChange={form.onDisplayNameChange}
        />

        <AuthInputField
          label="Email"
          placeholder="john.doe@example.com"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={form.onEmailChange}
        />

        <AuthInputField
          label="Password"
          placeholder="••••••••••"
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
          placeholder="••••••••••"
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

        <button
          type="submit"
          disabled={form.loading}
          className="bg-[#2c2c2c] h-[58px] rounded-[8px] w-full cursor-pointer hover:bg-[#3c3c3c] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <div className="content-stretch flex gap-[8px] items-center justify-center p-[12px] size-full">
            <p className="font-['Inter:Regular',sans-serif] font-normal leading-none not-italic text-[#f5f5f5] text-[16px] whitespace-nowrap">
              {form.loading ? "Creating account…" : "Register"}
            </p>
          </div>
        </button>

        <SignInLink />
      </form>
    </AuthScreen>
  );
}
