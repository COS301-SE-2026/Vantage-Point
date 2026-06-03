import svgPaths from "./svg-ggf1p8xwk0";
import imgRectangle1 from "./d28b50c79a88e9246a27dde74d7163e72d0415bd.webp";
import imgRectangle2 from "./798001aef0b2686ac929f8c349135d3326ab65bb.webp";

function Logo() {
  return (
    <div className="absolute contents left-[101px] top-[79px]" data-name="logo">
      <div className="absolute h-[256px] left-[121px] top-[79px] w-[281px]">
        <img
          alt=""
          className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
          src={imgRectangle2}
        />
      </div>
      <p className="absolute font-['Sarina:Regular',sans-serif] leading-[normal] left-[101px] not-italic text-[32px] text-black top-[253px] whitespace-nowrap">{`Vantage Point `}</p>
    </div>
  );
}

function Dot() {
  return (
    <div
      className="bg-black relative rounded-[50px] shrink-0 size-[8px]"
      data-name="Dot 1"
    />
  );
}

function Dot1() {
  return (
    <div
      className="bg-black opacity-30 relative rounded-[50px] shrink-0 size-[8px]"
      data-name="Dot 2"
    />
  );
}

function Dot2() {
  return (
    <div
      className="bg-black opacity-30 relative rounded-[50px] shrink-0 size-[8px]"
      data-name="Dot 3"
    />
  );
}

function Dot3() {
  return (
    <div
      className="bg-black opacity-30 relative rounded-[50px] shrink-0 size-[8px]"
      data-name="Dot 4"
    />
  );
}

function Dot4() {
  return (
    <div
      className="bg-black opacity-30 relative rounded-[50px] shrink-0 size-[8px]"
      data-name="Dot 5"
    />
  );
}

function Dot5() {
  return (
    <div
      className="bg-black opacity-30 relative rounded-[50px] shrink-0 size-[8px]"
      data-name="Dot 6"
    />
  );
}

function Frame() {
  return (
    <div
      className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex gap-[8px] items-center justify-center left-[calc(50%-1px)] px-[12px] py-[8px] rounded-[50px] top-1/2"
      data-name="Frame"
    >
      <Dot />
      <Dot1 />
      <Dot2 />
      <Dot3 />
      <Dot4 />
      <Dot5 />
    </div>
  );
}

function Input() {
  return (
    <div
      className="bg-white min-w-[120px] relative rounded-[8px] shrink-0 w-full"
      data-name="Input"
    >
      <div className="flex flex-row items-center min-w-[inherit] overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center min-w-[inherit] px-[16px] py-[12px] relative size-full">
          <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-none min-w-px not-italic relative text-[#b3b3b3] text-[16px]">{`What's your email address?`}</p>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="absolute border border-[#d9d9d9] border-solid inset-[-0.5px] pointer-events-none rounded-[8.5px]"
      />
    </div>
  );
}

function Input1() {
  return (
    <div
      className="bg-white min-w-[120px] relative rounded-[8px] shrink-0 w-full"
      data-name="Input"
    >
      <div className="flex flex-row items-center min-w-[inherit] overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center min-w-[inherit] px-[16px] py-[12px] relative size-full">
          <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-none min-w-px not-italic relative text-[#b3b3b3] text-[16px]">{`What's your password?`}</p>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="absolute border border-[#d9d9d9] border-solid inset-[-0.5px] pointer-events-none rounded-[8.5px]"
      />
    </div>
  );
}

function InputButtons() {
  return (
    <div
      className="absolute contents left-[27px] top-[499px]"
      data-name="Input buttons"
    >
      <div
        className="absolute content-stretch flex flex-col gap-[8px] items-start left-[27px] top-[499px] w-[375px]"
        data-name="Input Field"
      >
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.4] min-w-full not-italic relative shrink-0 text-[#1e1e1e] text-[16px] w-[min-content]">
          Email
        </p>
        <Input />
      </div>
      <div
        className="absolute content-stretch flex flex-col gap-[8px] items-start left-[27px] top-[610px] w-[375px]"
        data-name="Input Field"
      >
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.4] min-w-full not-italic relative shrink-0 text-[#1e1e1e] text-[16px] w-[min-content]">
          Password
        </p>
        <Input1 />
      </div>
    </div>
  );
}

function LogIn() {
  return (
    <div
      className="absolute bg-white h-[982px] left-0 overflow-clip top-0 w-[1512px]"
      data-name="log in"
    >
      <div className="absolute h-[982px] left-[463px] top-0 w-[1049px]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            alt=""
            className="absolute h-full left-[0.02%] max-w-none top-[0.01%] w-[166.42%]"
            src={imgRectangle1}
          />
        </div>
      </div>
      <Logo />
      <div
        className="absolute h-[44px] left-[756px] top-[906px] w-[402px]"
        data-name="Page control"
      >
        <Frame />
      </div>
      <InputButtons />
    </div>
  );
}

function Checkbox() {
  return (
    <div
      className="bg-[#2c2c2c] content-stretch flex items-center justify-center overflow-clip relative rounded-[4px] shrink-0 size-[16px]"
      data-name="Checkbox"
    >
      <div
        className="overflow-clip relative shrink-0 size-[16px]"
        data-name="Check"
      >
        <div
          className="absolute bottom-[29.17%] left-[16.67%] right-[16.67%] top-1/4"
          data-name="Icon"
        >
          <div className="absolute inset-[-10.91%_-7.5%]">
            <svg
              className="block size-full"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 12.2667 8.93333"
            >
              <path
                d={svgPaths.p2ea7ce0}
                id="Icon"
                stroke="var(--stroke-0, #F5F5F5)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.6"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckboxAndLabel() {
  return (
    <div
      className="content-stretch flex gap-[12px] items-center min-w-[120px] relative shrink-0"
      data-name="Checkbox and Label"
    >
      <Checkbox />
      <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[1.4] min-w-px not-italic relative text-[#1e1e1e] text-[16px]">
        Show password
      </p>
    </div>
  );
}

function CheckboxAndLabel1() {
  return (
    <div
      className="content-stretch flex gap-[12px] items-center min-w-[120px] relative shrink-0 w-[120px]"
      data-name="Checkbox and Label"
    >
      <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[0] min-w-px not-italic relative text-[#b3b3b3] text-[0px]">
        <span className="leading-[1.4] text-[16px]">{`Don't have an account? `}</span>
        <span className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.4] text-[#0b0b0b] text-[16px]">
          Sign Up
        </span>
      </p>
    </div>
  );
}

function InputButtons1() {
  return (
    <div
      className="absolute contents left-[24px] top-[687px]"
      data-name="Input buttons"
    >
      <div
        className="absolute content-stretch flex flex-col items-start left-[254px] top-[687px]"
        data-name="Checkbox Field"
      >
        <CheckboxAndLabel />
      </div>
      <div
        className="absolute content-stretch flex flex-col items-start left-[84px] top-[807px] w-[239px]"
        data-name="Checkbox Field"
      >
        <CheckboxAndLabel1 />
      </div>
      <div
        className="absolute bg-[#2c2c2c] h-[58px] left-[24px] rounded-[8px] top-[729px] w-[378px]"
        data-name="Button"
      >
        <div className="content-stretch flex gap-[8px] items-center justify-center overflow-clip p-[12px] relative rounded-[inherit] size-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-none not-italic relative shrink-0 text-[#f5f5f5] text-[16px] whitespace-nowrap">
            Sign In
          </p>
        </div>
        <div
          aria-hidden="true"
          className="absolute border border-[#2c2c2c] border-solid inset-0 pointer-events-none rounded-[8px]"
        />
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <div className="relative size-full" data-name="Login">
      <LogIn />
      <InputButtons1 />
    </div>
  );
}
