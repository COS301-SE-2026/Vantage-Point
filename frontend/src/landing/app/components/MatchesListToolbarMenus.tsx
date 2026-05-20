import { useState } from "react";
import { ArrowUpDown, Filter } from "lucide-react";
import {
  DEFAULT_MATCH_FILTER_ID,
  DEFAULT_MATCH_SORT_ID,
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
  "absolute top-[29px] flex size-[40px] cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-0 text-[#0a0a0a] transition-[left] duration-300 ease-out hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4a7fd4]";

interface MatchesListToolbarMenusProps {
  readonly filterLeft: number;
  readonly sortLeft: number;
}

export default function MatchesListToolbarMenus({
  filterLeft,
  sortLeft,
}: Readonly<MatchesListToolbarMenusProps>) {
  // UI-only until match list is driven by search/API data.
  const [filterId, setFilterId] = useState<MatchFilterId>(DEFAULT_MATCH_FILTER_ID);
  const [sortId, setSortId] = useState<MatchSortId>(DEFAULT_MATCH_SORT_ID);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Filter matches: ${matchFilterLabel(filterId)}`}
            className={TOOLBAR_ICON_BUTTON_CLASS}
            style={{ left: filterLeft }}
          >
            <Filter className="size-[22px]" strokeWidth={2} aria-hidden />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end" className="min-w-[10rem]">
          <DropdownMenuLabel>Filter</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={filterId}
            onValueChange={(value) => setFilterId(value as MatchFilterId)}
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
            style={{ left: sortLeft }}
          >
            <ArrowUpDown className="size-[22px]" strokeWidth={2} aria-hidden />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end" className="min-w-[10rem]">
          <DropdownMenuLabel>Sort</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={sortId}
            onValueChange={(value) => setSortId(value as MatchSortId)}
          >
            {MATCH_SORT_OPTIONS.map((option) => (
              <DropdownMenuRadioItem key={option.id} value={option.id}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
