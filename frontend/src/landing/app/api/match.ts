import { getMockMatchDetail } from "../mocks/matchDetail";
import type { MatchDetail } from "../types/match";

const MOCK_DELAY_MS = 300;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, ms);
  });
}

export async function fetchMatchDetail(
  matchId: string,
  _puuid?: string
): Promise<MatchDetail> {
  await delay(MOCK_DELAY_MS);
  return getMockMatchDetail(matchId);
}
