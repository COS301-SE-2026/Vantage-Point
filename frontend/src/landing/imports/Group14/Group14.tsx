import { useState, type CSSProperties } from "react";
import { LogOut } from "lucide-react";
import svgPaths from "./svg-a7h301bhtl";
import imgRectangle2 from "./798001aef0b2686ac929f8c349135d3326ab65bb.webp";
import imgImage from "./863f38ed1d3d10010128b3d2c32af74526eee2db.webp";
import imgImage1 from "./52d63edd3ead34fe669ce0b42a6f0cc7fa14831e.webp";
import imgImage2 from "./0dbe3069ff5609f457daa04f89ca5a682c4ec7ad.webp";

/** Fixed artboard width used by this screen (px). */
const DASHBOARD_FRAME_W = 1512;

/** Collapsed grid: card track width (incl. horizontal padding) + gap between columns. */
const COLLAPSED_CARD_TRACK_PX = 278;
const COLLAPSED_COL_GAP_PX = 22;

interface Group1Props {
  readonly onLogout?: () => void;
  readonly onMatchSelect?: (matchId: string) => void;
}

interface FrameProps {
  readonly onLogout?: () => void;
  readonly onMatchSelect?: (matchId: string) => void;
  readonly sidebarOpen: boolean;
}

interface ProductCardBodyProps {
  readonly outcome: string;
  readonly durationLabel: string;
  readonly mapLabel: string;
}

function ProductCardImage({ src }: Readonly<{ src: string }>) {
  return (
    <div className="h-[247px] relative shrink-0 w-full" data-name="Image">
      <img
        alt=""
        className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
        src={src}
      />
    </div>
  );
}

function ProductCardBody({
  outcome,
  durationLabel,
  mapLabel,
}: Readonly<ProductCardBodyProps>) {
  return (
    <div
      className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-[208px]"
      data-name="Body"
    >
      <div
        className="content-stretch flex items-start relative shrink-0 w-full"
        data-name="Text"
      >
        <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[1.4] min-w-px not-italic relative text-[#1e1e1e] text-[16px]">
          Match #
        </p>
      </div>
      <div
        className="content-stretch flex items-start relative shrink-0"
        data-name="Text Strong"
      >
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.4] not-italic relative shrink-0 text-[#1e1e1e] text-[16px] whitespace-nowrap">
          {outcome}
        </p>
      </div>
      <div
        className="content-stretch flex items-start relative shrink-0 w-full"
        data-name="Text Small"
      >
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.4] not-italic relative shrink-0 text-[#757575] text-[14px] whitespace-nowrap">
          {durationLabel}
        </p>
      </div>
      <div
        className="content-stretch flex items-start relative shrink-0 w-full"
        data-name="Text Small"
      >
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.4] not-italic relative shrink-0 text-[#757575] text-[14px] whitespace-nowrap">
          {mapLabel}
        </p>
      </div>
    </div>
  );
}

const COLUMN_MATCH_CARDS = [
  {
    matchId: "EUW1_mock_1",
    src: imgImage,
    outcome: "Defeat",
    durationLabel: "Duration - 25min",
    mapLabel: "Summoner's Rift",
  },
  {
    matchId: "EUW1_mock_2",
    src: imgImage1,
    outcome: "Victory",
    durationLabel: "Duration - 30min",
    mapLabel: "Summoner's Rift",
  },
  {
    matchId: "EUW1_mock_3",
    src: imgImage2,
    outcome: "Victory",
    durationLabel: "Duration - 40min",
    mapLabel: "Summoner's Rift",
  },
  {
    matchId: "EUW1_mock_4",
    src: imgImage2,
    outcome: "Defeat",
    durationLabel: "Duration - 20min",
    mapLabel: "Summoner's Rift",
  },
] as const satisfies ReadonlyArray<
  ProductCardBodyProps & { readonly src: string; readonly matchId: string }
>;

function collapsedCardColumnLefts(): [number, number, number, number] {
  const gridW = 4 * COLLAPSED_CARD_TRACK_PX + 3 * COLLAPSED_COL_GAP_PX;
  const start = Math.round((DASHBOARD_FRAME_W - gridW) / 2);
  return [
    start,
    start + (COLLAPSED_CARD_TRACK_PX + COLLAPSED_COL_GAP_PX),
    start + 2 * (COLLAPSED_CARD_TRACK_PX + COLLAPSED_COL_GAP_PX),
    start + 3 * (COLLAPSED_CARD_TRACK_PX + COLLAPSED_COL_GAP_PX),
  ];
}

function Logo() {
  return (
    <div className="absolute contents left-[12px] top-[8px]" data-name="logo">
      <div className="absolute h-[97px] left-[12px] top-[8px] w-[99px]">
        <img
          alt=""
          className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
          src={imgRectangle2}
        />
      </div>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute left-[46px] size-[48px] top-[345px]">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 48 48"
      >
        <g id="Group 1">
          <circle
            cx="24"
            cy="24"
            fill="var(--fill-0, #D9D9D9)"
            id="Ellipse 1"
            r="24"
          />
        </g>
      </svg>
    </div>
  );
}

function Frame({ onLogout, onMatchSelect, sidebarOpen }: Readonly<FrameProps>) {
  return (
    <div
      className="absolute bg-white h-[982px] left-0 overflow-clip top-0 w-[1512px]"
      data-name="Frame"
    >
      <Logo />
      {sidebarOpen ? (
        <div id="dashboard-sidebar" className="contents">
          <div className="absolute bg-[rgba(117,117,117,0.12)] h-[366px] left-[28px] rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[94px] w-[293px]" />
          <div className="absolute bg-white h-[47px] left-[38px] rounded-[10px] top-[148px] w-[272px]">
            <div
              aria-hidden="true"
              className="absolute border-3 border-solid border-white inset-[-3px] pointer-events-none rounded-[13px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
            />
          </div>
          <div className="absolute bg-white h-[47px] left-[39px] rounded-[10px] top-[213px] w-[272px]">
            <div
              aria-hidden="true"
              className="absolute border-3 border-[#fdfdfd] border-solid inset-[-3px] pointer-events-none rounded-[13px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
            />
          </div>
          <div className="absolute bg-white h-[47px] left-[40px] rounded-[10px] top-[278px] w-[273px]">
            <div
              aria-hidden="true"
              className="absolute border-3 border-[#fdfdfd] border-solid inset-[-3px] pointer-events-none rounded-[13px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
            />
          </div>
          <Group />
          <div
            className="absolute h-[18px] left-[49px] top-[395px] w-[81px]"
            data-name="hugeicons/Text"
          >
            <p className="absolute font-['Sora:Regular',sans-serif] font-normal inset-0 leading-[normal] text-[#737373] text-[14px] tracking-[-0.28px] whitespace-nowrap">
              Username
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="absolute left-[232px] top-[427px] flex cursor-pointer items-center gap-2 rounded-md py-0.5 transition-opacity hover:opacity-80"
            data-name="Logout Button"
          >
            <LogOut
              className="size-[18px] shrink-0 text-[#525252]"
              strokeWidth={2}
              aria-hidden
            />
            <span className="whitespace-nowrap font-['Sora:Regular',sans-serif] text-[14px] font-normal leading-normal tracking-[-0.28px] text-[#0a0a0a]">
              Logout
            </span>
          </button>
          <div
            className="absolute h-[18px] left-[59px] top-[360px] w-[23px]"
            data-name="hugeicons/Text"
          >
            <p className="absolute font-['Sora:Regular',sans-serif] font-normal inset-0 leading-[normal] text-[#0a0a0a] text-[14px] tracking-[-0.28px] whitespace-nowrap">
              UN
            </p>
          </div>
        </div>
      ) : null}
      <p className="absolute left-[128px] top-[36px] whitespace-nowrap font-sarina text-[clamp(18px,1.6vw,24px)] leading-normal not-italic text-black">{`Vantage Point `}</p>
      <div
        className="absolute top-[94px] h-[840px] bg-white transition-[left,width] duration-300 ease-out"
        style={
          sidebarOpen
            ? { left: 372, width: 1091 }
            : { left: 0, width: DASHBOARD_FRAME_W }
        }
      />
    </div>
  );
}

export default function Group1({
  onLogout,
  onMatchSelect,
}: Readonly<Group1Props>) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const collapsedCols = collapsedCardColumnLefts();
  const cardLeft = (col: 0 | 1 | 2 | 3) =>
    sidebarOpen ? [411, 672, 933, 1194][col] : collapsedCols[col];
  const searchLeft = sidebarOpen
    ? 912
    : Math.round((DASHBOARD_FRAME_W - 377) / 2);
  const filterLeft = 1336;
  const sortLeft = 1394;
  const cardWidthClass = sidebarOpen
    ? "min-w-[240px]"
    : "w-[278px] min-w-0 shrink-0";

  const panelVars = {
    "--transform-inner-width": "1200",
    "--transform-inner-height": "19",
  } as CSSProperties;

  return (
    <div className="relative size-full">
      <Frame
        onLogout={onLogout}
        onMatchSelect={onMatchSelect}
        sidebarOpen={sidebarOpen}
      />
      <div
        className="absolute top-[29px] min-w-[120px] w-[377px] rounded-[9999px] bg-white transition-[left] duration-300 ease-out"
        style={{ left: searchLeft }}
        data-name="Search"
      >
        <label
          htmlFor="dashboard-search"
          className="relative flex size-full cursor-text items-center gap-[8px] overflow-clip rounded-[inherit] px-[16px] py-[12px]"
        >
          <input
            id="dashboard-search"
            type="search"
            name="dashboard-search"
            placeholder="search"
            aria-label="Search"
            className="m-0 min-w-0 flex-1 border-0 bg-transparent p-0 font-['Inter:Regular',sans-serif] text-[16px] font-normal leading-none text-[#1e1e1e] caret-[#1e1e1e] outline-none placeholder:font-['Inter:Regular',sans-serif] placeholder:text-[#b3b3b3] placeholder:font-normal"
          />
          <div
            className="relative size-[16px] shrink-0 overflow-clip"
            data-name="Search"
          >
            <div className="absolute inset-[12.5%]" data-name="Icon">
              <div className="absolute inset-[-6.67%]">
                <svg
                  className="block size-full"
                  fill="none"
                  preserveAspectRatio="none"
                  viewBox="0 0 13.6 13.6"
                >
                  <path
                    d={svgPaths.p8625680}
                    id="Icon"
                    stroke="var(--stroke-0, #1E1E1E)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.6"
                  />
                </svg>
              </div>
            </div>
          </div>
        </label>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-[-0.5px] rounded-[9999.5px] border border-solid border-[#d9d9d9] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
        />
      </div>
      <button
        type="button"
        onClick={() => setSidebarOpen((open) => !open)}
        aria-expanded={sidebarOpen}
        aria-controls="dashboard-sidebar"
        aria-label={
          sidebarOpen ? "Collapse navigation panel" : "Expand navigation panel"
        }
        className="absolute top-[94px] flex size-[24px] cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-0 transition-[left,transform] duration-300 ease-out hover:bg-neutral-100"
        style={{ left: sidebarOpen ? 330 : 44, ...panelVars }}
      >
        <div
          className={`flex-none transition-transform duration-300 ease-out ${sidebarOpen ? "rotate-90" : "-rotate-90"}`}
        >
          <div
            className="relative size-[24px] overflow-clip"
            data-name="Icon / panel-top-open"
          >
            <div className="absolute inset-[9.38%]" data-name="Vector">
              <svg
                className="absolute inset-0 block size-full"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 19.5 19.5"
              >
                <g id="Vector">
                  <path d={svgPaths.p1616c880} fill="var(--fill-0, #525252)" />
                  <path d={svgPaths.p184c1a00} fill="var(--fill-0, #525252)" />
                  <path d={svgPaths.p8beb600} fill="var(--fill-0, #525252)" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </button>
      {sidebarOpen ? (
        <>
          <div
            className="absolute left-[58px] top-[158px] flex w-[233px] content-stretch items-start"
            data-name="Text"
          >
            <p className="relative shrink-0 whitespace-nowrap font-['Inter:Regular',sans-serif] text-[16px] font-normal leading-[1.4] not-italic text-[#1e1e1e]">
              Dashboard
            </p>
          </div>
          <div
            className="absolute left-[58px] top-[224px] flex w-[233px] content-stretch items-start"
            data-name="Text"
          >
            <p className="relative shrink-0 whitespace-nowrap font-['Inter:Regular',sans-serif] text-[16px] font-normal leading-[1.4] not-italic text-[#1e1e1e]">
              Analysis
            </p>
          </div>
          <div
            className="absolute left-[58px] top-[286px] flex w-[233px] content-stretch items-start"
            data-name="Text"
          >
            <p className="relative shrink-0 whitespace-nowrap font-['Inter:Regular',sans-serif] text-[16px] font-normal leading-[1.4] not-italic text-[#1e1e1e]">
              Metrics
            </p>
          </div>
        </>
      ) : null}
      <div
        className="absolute top-[29px] size-[40px] overflow-clip transition-[left] duration-300 ease-out"
        style={{ left: filterLeft }}
        data-name="remix/filter-2"
      >
        <div
          className="absolute inset-[12.5%_16.67%_8.33%_16.67%]"
          data-name="Vector"
        >
          <svg
            className="absolute inset-0 block size-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 26.6667 31.6667"
          >
            <path
              d={svgPaths.p2914a000}
              id="Vector"
              stroke="var(--stroke-0, #0A0A0A)"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
      <div
        className="absolute top-[29px] size-[40px] overflow-clip transition-[left] duration-300 ease-out"
        style={{ left: sortLeft }}
        data-name="remix/sort-asc 1"
      >
        <div
          className="absolute inset-[12.5%_4.17%_16.67%_12.5%]"
          data-name="Vector"
        >
          <svg
            className="absolute inset-0 block size-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 33.3333 28.3333"
          >
            <path
              d={svgPaths.p1087f300}
              id="Vector"
              stroke="var(--stroke-0, #0A0A0A)"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
      {COLUMN_MATCH_CARDS.map((card, col) => {
        const column = col as 0 | 1 | 2 | 3;
        return (
          <button
            key={`dashboard-match-top-${card.matchId}`}
            type="button"
            onClick={() => onMatchSelect?.(card.matchId)}
            className={`absolute top-[133px] flex flex-col content-stretch items-start gap-[16px] rounded-[8px] bg-white p-[16px] transition-[left,width] duration-300 ease-out cursor-pointer text-left hover:border-[#b3b3b3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4a7fd4] ${cardWidthClass}`}
            style={{ left: cardLeft(column) }}
            data-name="Product Info Card"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[8px] border border-solid border-[#d9d9d9]"
            />
            <ProductCardImage src={card.src} />
            <ProductCardBody
              outcome={card.outcome}
              durationLabel={card.durationLabel}
              mapLabel={card.mapLabel}
            />
          </button>
        );
      })}
      {COLUMN_MATCH_CARDS.map((card, col) => {
        const column = col as 0 | 1 | 2 | 3;
        return (
          <button
            key={`dashboard-match-bottom-${card.matchId}`}
            type="button"
            onClick={() => onMatchSelect?.(card.matchId)}
            className={`absolute top-[562px] flex flex-col content-stretch items-start gap-[16px] rounded-[8px] bg-white p-[16px] transition-[left,width] duration-300 ease-out cursor-pointer text-left hover:border-[#b3b3b3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4a7fd4] ${cardWidthClass}`}
            style={{ left: cardLeft(column) }}
            data-name="Product Info Card"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[8px] border border-solid border-[#d9d9d9]"
            />
            <ProductCardImage src={card.src} />
            <ProductCardBody
              outcome={card.outcome}
              durationLabel={card.durationLabel}
              mapLabel={card.mapLabel}
            />
          </button>
        );
      })}
    </div>
  );
}
