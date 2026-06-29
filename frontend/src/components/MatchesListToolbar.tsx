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
      className="mb-6 flex min-w-0 w-full max-w-full flex-wrap items-center gap-x-2 gap-y-2"
      role="toolbar"
      aria-label="Match list controls"
    >
      <div
        className="relative min-w-0 w-full max-w-[377px] flex-1 rounded-[9999px] bg-white"
        data-name="Search"
      >
        <label
          htmlFor="matches-search"
          className="relative flex size-full cursor-text items-center gap-[8px] overflow-clip rounded-[inherit] px-[16px] py-[12px]"
        >
          <input
            id="matches-search"
            type="search"
            name="matches-search"
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="Search matches"
            aria-label="Search matches"
            className="m-0 min-w-0 flex-1 border-0 bg-transparent p-0 font-['Inter:Regular',sans-serif] text-[16px] font-normal leading-none text-[#1e1e1e] caret-[#1e1e1e] outline-none placeholder:font-['Inter:Regular',sans-serif] placeholder:text-[#b3b3b3] placeholder:font-normal"
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
      <MatchesListToolbarMenus
        filterId={filterId}
        onFilterIdChange={onFilterIdChange}
        sortId={sortId}
        onSortIdChange={onSortIdChange}
      />
    </div>
  );
}
