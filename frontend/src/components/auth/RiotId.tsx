import AuthScreen, { AuthInputField } from "./AuthScreen";

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
    <AuthScreen showSocialLogins={false} backgroundImage={backgroundImage}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.onSubmit();
        }}
        className="flex w-full flex-col gap-6"
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
          label="Riot ID"
          placeholder="RiotId#TagLine"
          autoComplete="off"
          value={form.riotId}
          onChange={form.onRiotIdChange}
        />

        <button
          type="submit"
          disabled={form.loading}
          className="bg-[#2c2c2c] h-[58px] rounded-[8px] w-full cursor-pointer hover:bg-[#3c3c3c] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <div className="content-stretch flex gap-[8px] items-center justify-center p-[12px] size-full">
            <p className="font-['Inter:Regular',sans-serif] font-normal leading-none not-italic text-[#f5f5f5] text-[16px] whitespace-nowrap">
              {form.loading ? "Linking…" : "Submit"}
            </p>
          </div>
        </button>
      </form>
    </AuthScreen>
  );
}
