import { Search } from "lucide-react";
import type { MatchFilterId, MatchSortId } from "../lib/matchListControls";
import MatchesListToolbarMenus from "./MatchesListToolbarMenus";

interface MatchesListToolbarProps {
  readonly searchQuery: string;
  readonly onSearchQueryChange: (query: string) => void;
  readonly filterId: MatchFilterId;
  readonly onFilterIdChange: (filterId: MatchFilterId) => void;
  readonly sortId: MatchSortId;
  readonly onSortIdChange: (sortId: MatchSortId) => void;
}

export default function MatchesListToolbar({
  searchQuery,
  onSearchQueryChange,
  filterId,
  onFilterIdChange,
  sortId,
  onSortIdChange,
}: Readonly<MatchesListToolbarProps>) {
  return (
    <div
      className="mb-5 flex w-full max-w-[820px] min-w-0 items-center justify-end gap-2"
      role="toolbar"
      aria-label="Match list controls"
    >
      <MatchesListToolbarMenus
        filterId={filterId}
        onFilterIdChange={onFilterIdChange}
        sortId={sortId}
        onSortIdChange={onSortIdChange}
      />
      <div
        className="relative min-w-0 w-full max-w-[378px] flex-1 rounded-[9999px] bg-transparent"
        data-name="Search"
      >
        <label
          htmlFor="matches-search"
          className="relative flex size-full cursor-text items-center gap-[8px] overflow-clip rounded-[inherit] px-[16px] py-[6px]"
        >
          <input
            id="matches-search"
            type="search"
            name="matches-search"
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="search"
            aria-label="Search matches"
            className="m-0 min-w-0 flex-1 border-0 bg-transparent p-0 font-['Inter:Regular',sans-serif] text-[16px] font-normal leading-none text-[#1e1e1e] caret-[#1e1e1e] outline-none placeholder:font-['Inter:Regular',sans-serif] placeholder:text-[#b7b7b7] placeholder:font-normal"
          />
          <Search
            className="size-4 shrink-0 text-[#1e1e1e]"
            strokeWidth={1.6}
            aria-hidden
          />
        </label>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-[-0.5px] rounded-[9999.5px] border border-solid border-[#d9d9d9]"
        />
      </div>
    </div>
  );
}
