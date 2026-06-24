import { useState, useEffect } from "react";
import {
  authBackgroundImages,
  authSlideIndices,
} from "../../lib/backgrounds";
import imgLogo from "../../assets/images/logos/logo.webp";

const backgroundImages = authBackgroundImages;

const authInputClassName =
  "bg-transparent min-w-0 rounded-[8px] w-full px-[16px] py-[12px] font-['Inter:Regular',sans-serif] font-normal text-[16px] text-[#1e1e1e] placeholder:text-[#b3b3b3] border border-[#d9d9d9] focus:outline-none focus:border-[#2c2c2c] caret-[#1e1e1e] [&:-webkit-autofill]:[-webkit-text-fill-color:#1e1e1e] [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_rgb(255,255,255)] [&:-webkit-autofill]:caret-[#1e1e1e] [&:-moz-autofill]:bg-transparent";

const SLIDE_DOT_INDICES = authSlideIndices;

type FrameSlideProps = Readonly<{
  currentSlide: number;
  onDotClick: (index: number) => void;
}>;

function Logo() {
  return (
    <div
      className="relative z-20 flex w-full shrink-0 flex-col items-center"
      data-name="logo"
    >
      <div className="h-[clamp(120px,18vw,200px)] w-[clamp(120px,18vw,200px)]">
        <img
          alt=""
          className="pointer-events-none h-full w-full object-cover"
          src={imgLogo}
        />
      </div>
      <p className="relative z-30 -mt-6 -translate-y-10 text-center font-sarina text-[clamp(20px,2.5vw,32px)] leading-normal not-italic whitespace-nowrap text-black">
        Vantage Point
      </p>
    </div>
  );
}

function Frame({ currentSlide, onDotClick }: FrameSlideProps) {
  return (
    <div
      className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex gap-[8px] items-center justify-center left-[calc(50%-1px)] px-[12px] py-[8px] rounded-[50px] top-1/2"
      data-name="Frame"
      role="tablist"
      aria-label="Background slides"
    >
      {SLIDE_DOT_INDICES.map((index) => (
        <button
          type="button"
          key={`riot-id-slide-dot-${String(index)}`}
          aria-label={`Show slide ${String(index + 1)}`}
          aria-current={index === currentSlide ? "true" : undefined}
          className={`relative rounded-[50px] shrink-0 size-[8px] cursor-pointer border-0 p-0 transition-opacity duration-300 ${
            index === currentSlide
              ? "bg-black opacity-100"
              : "bg-black opacity-30"
          }`}
          onClick={() => onDotClick(index)}
        />
      ))}
    </div>
  );
}

export type RiotIdFormProps = Readonly<{
  riotId: string;
  error?: string | null;
  loading?: boolean;
  onRiotIdChange: (value: string) => void;
  onSubmit: () => void;
}>;

function LeftPanelForm({ form }: Readonly<{ form: RiotIdFormProps }>) {
  return (
    <div
      className="absolute left-0 top-0 z-20 box-border flex h-full min-w-0 w-[30%] flex-col items-center overflow-y-auto px-[clamp(16px,4vw,40px)] py-[clamp(24px,5vh,48px)]"
      data-name="left-panel"
    >
      <div className="flex w-full max-w-[min(378px,100%)] flex-1 flex-col items-center justify-center gap-8">
        <Logo />
        <div className="flex w-full flex-col gap-6">
          {form.error ? (
            <p
              className="font-['Inter:Regular',sans-serif] text-[14px] text-red-600 text-center"
              role="alert"
            >
              {form.error}
            </p>
          ) : null}
          <div className="flex flex-col gap-[8px]" data-name="Input Field">
            <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.4] text-[#1e1e1e] text-[16px]">
              Riot ID
            </p>
            <input
              type="text"
              value={form.riotId}
              onChange={(e) => form.onRiotIdChange(e.target.value)}
              placeholder="What's your riot id?"
              className={authInputClassName}
            />
          </div>
          <button
            type="button"
            disabled={form.loading}
            onClick={form.onSubmit}
            className="bg-[#2c2c2c] h-[58px] rounded-[8px] w-full cursor-pointer hover:bg-[#3c3c3c] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="content-stretch flex gap-[8px] items-center justify-center p-[12px] size-full">
              <p className="font-['Inter:Regular',sans-serif] font-normal leading-none not-italic text-[#f5f5f5] text-[16px] whitespace-nowrap">
                {form.loading ? "Linking…" : "Submit"}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

function RightPanel({ currentSlide, onDotClick }: FrameSlideProps) {
  return (
    <div
      className="absolute bg-white h-full left-0 overflow-clip top-0 w-full"
      data-name="background"
    >
      <div className="absolute h-full left-[30%] top-0 right-0">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {backgroundImages.map((img, index) => (
            <img
              key={img}
              alt=""
              className={`absolute h-full w-full object-cover transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
              src={img}
            />
          ))}
        </div>
      </div>
      <div
        className="absolute h-[44px] right-[5%] bottom-[5%] w-[clamp(200px,30vw,402px)]"
        data-name="Page control"
      >
        <Frame currentSlide={currentSlide} onDotClick={onDotClick} />
      </div>
    </div>
  );
}

export default function RiotId({ form }: Readonly<{ form: RiotIdFormProps }>) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % backgroundImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative size-full" data-name="RiotId">
      <RightPanel currentSlide={currentSlide} onDotClick={handleDotClick} />
      <LeftPanelForm form={form} />
    </div>
  );
}
