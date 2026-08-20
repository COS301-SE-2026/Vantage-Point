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
      className="flex w-full min-w-0 items-center justify-end gap-2"
      role="toolbar"
      aria-label="Match list controls"
    >
      <MatchesListToolbarMenus
        filterId={filterId}
        onFilterIdChange={onFilterIdChange}
        sortId={sortId}
        onSortIdChange={onSortIdChange}
      />
      <label
        htmlFor="matches-search"
        className="flex min-w-0 w-full max-w-[320px] cursor-text items-center gap-2 rounded-lg border border-vp-line bg-vp-surface px-3 py-2 transition-colors focus-within:border-vp-gold/60"
      >
        <Search
          className="size-4 shrink-0 text-vp-faint"
          strokeWidth={1.7}
          aria-hidden
        />
        <input
          id="matches-search"
          type="search"
          name="matches-search"
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          placeholder="Champion or role"
          aria-label="Search matches"
          className="m-0 min-w-0 flex-1 border-0 bg-transparent p-0 text-[13px] leading-none text-vp-ink caret-vp-gold outline-none placeholder:text-vp-faint"
        />
      </label>
    </div>
  );
}
