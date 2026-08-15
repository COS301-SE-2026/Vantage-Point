import { ArrowUpDown, Filter } from "lucide-react";
import {
  MATCH_FILTER_OPTIONS,
  MATCH_SORT_OPTIONS,
  matchFilterLabel,
  matchSortLabel,
  type MatchFilterId,
  type MatchSortId,
} from "../lib/matchListControls";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const TOOLBAR_ICON_BUTTON_CLASS =
  "flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-vp-line bg-vp-surface p-0 text-vp-dim transition-colors hover:border-vp-line-strong hover:text-vp-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vp-gold";

const MENU_CLASS = "min-w-[11rem] border-vp-line bg-vp-surface text-vp-ink";
const MENU_LABEL_CLASS =
  "text-[10px] uppercase tracking-[0.16em] text-vp-faint";
const MENU_ITEM_CLASS = "cursor-pointer focus:bg-vp-raised focus:text-vp-ink";

interface MatchesListToolbarMenusProps {
  readonly filterId: MatchFilterId;
  readonly onFilterIdChange: (filterId: MatchFilterId) => void;
  readonly sortId: MatchSortId;
  readonly onSortIdChange: (sortId: MatchSortId) => void;
}

export default function MatchesListToolbarMenus({
  filterId,
  onFilterIdChange,
  sortId,
  onSortIdChange,
}: Readonly<MatchesListToolbarMenusProps>) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Filter matches: ${matchFilterLabel(filterId)}`}
            className={TOOLBAR_ICON_BUTTON_CLASS}
          >
            <Filter className="size-[17px]" strokeWidth={1.8} aria-hidden />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end" className={MENU_CLASS}>
          <DropdownMenuLabel className={MENU_LABEL_CLASS}>
            Filter
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={filterId}
            onValueChange={(value) => onFilterIdChange(value as MatchFilterId)}
          >
            {MATCH_FILTER_OPTIONS.map((option) => (
              <DropdownMenuRadioItem
                key={option.id}
                value={option.id}
                className={MENU_ITEM_CLASS}
              >
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Sort matches: ${matchSortLabel(sortId)}`}
            className={TOOLBAR_ICON_BUTTON_CLASS}
          >
            <ArrowUpDown
              className="size-[17px]"
              strokeWidth={1.8}
              aria-hidden
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end" className={MENU_CLASS}>
          <DropdownMenuLabel className={MENU_LABEL_CLASS}>
            Sort
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={sortId}
            onValueChange={(value) => onSortIdChange(value as MatchSortId)}
          >
            {MATCH_SORT_OPTIONS.map((option) => (
              <DropdownMenuRadioItem
                key={option.id}
                value={option.id}
                className={MENU_ITEM_CLASS}
              >
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
