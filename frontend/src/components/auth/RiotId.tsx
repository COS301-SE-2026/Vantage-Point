import AuthScreen, {
  AuthFormError,
  AuthInputField,
  AuthSubmitButton,
} from "./AuthScreen";

export type RiotIdFormProps = Readonly<{
  riotId: string;
  error?: string | null;
  loading?: boolean;
  onRiotIdChange: (value: string) => void;
  onSubmit: () => void;
}>;

interface RiotIdProps {
  form: RiotIdFormProps;
  backgroundImage?: string; // Optional: overrides the automatic slide rotation
}

export default function RiotId({
  form,
  backgroundImage,
}: Readonly<RiotIdProps>) {
  return (
    <AuthScreen
      showSocialLogins={false}
      backgroundImage={backgroundImage}
      eyebrow="One more step"
      title="Link your Riot ID"
      subtitle="Your match history is pulled straight from the Riot API. Nothing to install."
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
          label="Riot ID"
          placeholder="RiotId#TagLine"
          autoComplete="off"
          value={form.riotId}
          onChange={form.onRiotIdChange}
        />

        <AuthSubmitButton
          label="Submit"
          loadingLabel="Linking…"
          loading={form.loading}
        />
      </form>
    </AuthScreen>
  );
}
