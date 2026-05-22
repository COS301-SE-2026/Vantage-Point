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
  "flex size-[40px] shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-0 text-[#0a0a0a] hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4a7fd4]";

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
    <div className="ml-auto flex shrink-0 items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Filter matches: ${matchFilterLabel(filterId)}`}
            className={TOOLBAR_ICON_BUTTON_CLASS}
          >
            <Filter className="size-[22px]" strokeWidth={2} aria-hidden />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end" className="min-w-[10rem]">
          <DropdownMenuLabel>Filter</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={filterId}
            onValueChange={(value) => onFilterIdChange(value as MatchFilterId)}
          >
            {MATCH_FILTER_OPTIONS.map((option) => (
              <DropdownMenuRadioItem key={option.id} value={option.id}>
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
            <ArrowUpDown className="size-[22px]" strokeWidth={2} aria-hidden />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end" className="min-w-[10rem]">
          <DropdownMenuLabel>Sort</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={sortId}
            onValueChange={(value) => onSortIdChange(value as MatchSortId)}
          >
            {MATCH_SORT_OPTIONS.map((option) => (
              <DropdownMenuRadioItem key={option.id} value={option.id}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
