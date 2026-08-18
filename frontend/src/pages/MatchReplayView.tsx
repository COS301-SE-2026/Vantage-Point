import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { fetchMatchHistory } from "../api/matches";
import MatchReplayMenuRow from "../components/MatchReplayMenuRow";
import { menuRowFromSummary } from "../lib/matchMenuRow";
import MatchReplayPanel from "../components/MatchReplayPanel";
import { PageContainer } from "../components/dashboard/primitives";
import type { MatchHistorySummary } from "../types/match";

/** How many recent games the replay screen lists at once. */
const REPLAY_MATCH_COUNT = 5;

/**
 * Everything stacked above and below an open map that is not a match row: the
 * 64px header, the page's top padding, and a little air at the bottom. The rows
 * themselves are added per row so the square never gets cropped.
 */
const MAP_VERTICAL_CHROME = 148;

/** Row height plus the gap under it. */
const MENU_ROW_STRIDE = 42;

export default function MatchReplayView() {
  const navigate = useNavigate();
  const { matchId: matchIdParam } = useParams<{ matchId?: string }>();

  const [matches, setMatches] = useState<readonly MatchHistorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchMatchHistory()
      .then((history) => {
        if (cancelled) return;
        if (history.length === 0) {
          throw new Error("No matches available for replay");
        }
        const recent = history.slice(0, REPLAY_MATCH_COUNT);

        // A link to an older game still gets a row of its own, at the top,
        // rather than dropping off the end of the list it is not recent enough for.
        const routed = matchIdParam
          ? history.find((row) => row.matchId === matchIdParam)
          : undefined;
        setMatches(
          routed && !recent.includes(routed) ? [routed, ...recent] : recent,
        );

        // The bare route names no match, so it lands on the most recent one and
        // that panel opens; a deep link opens the match it names instead.
        if (!matchIdParam) {
          navigate(
            `/dashboard/replay/${encodeURIComponent(recent[0].matchId)}`,
            { replace: true },
          );
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load replay",
          );
          setMatches([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [matchIdParam, navigate]);

  // The routed match starts open. Anything the player opens afterwards stays
  // open on its own, so two games can be compared side by side down the page.
  useEffect(() => {
    if (!matchIdParam) return;
    setOpenIds((prev) => {
      if (prev.has(matchIdParam)) return prev;
      return new Set(prev).add(matchIdParam);
    });
  }, [matchIdParam]);

  const verticalChrome = useMemo(
    () => MAP_VERTICAL_CHROME + matches.length * MENU_ROW_STRIDE,
    [matches.length],
  );

  const handleToggle = (matchId: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(matchId)) next.delete(matchId);
      else next.add(matchId);
      return next;
    });
  };

  return (
    <div data-name="match-replay-view">
      <PageContainer className="max-w-none pb-6">
        {loading ? (
          <p className="text-[16px] text-vp-dim">Loading match replay…</p>
        ) : null}
        {error ? <p className="text-[16px] text-vp-loss">{error}</p> : null}

        {!loading && !error ? (
          /* Figma "Map view" 26:1008 — 820×557, an 11px gutter under MatchMenu. */
          <div
            data-name="Map view"
            data-node-id="26:1008"
            className="flex w-full flex-col gap-[8px]"
          >
            {matches.map((summary) => {
              const open = openIds.has(summary.matchId);
              return (
                <div
                  key={summary.matchId}
                  data-name="replay-match"
                  data-match-id={summary.matchId}
                  className="flex w-full flex-col gap-[8px]"
                >
                  <MatchReplayMenuRow
                    row={menuRowFromSummary(summary)}
                    expanded={open}
                    onToggle={() => {
                      handleToggle(summary.matchId);
                    }}
                  />
                  {open ? (
                    <MatchReplayPanel
                      matchId={summary.matchId}
                      verticalChrome={verticalChrome}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </PageContainer>
    </div>
  );
}
