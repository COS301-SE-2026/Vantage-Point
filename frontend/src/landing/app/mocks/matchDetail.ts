import type { MatchDetail, ParticipantDetail, TeamDetail } from "../types/match";

const VIEWER_PUUID = "mock-viewer-puuid";

function participant(
  overrides: Partial<ParticipantDetail> & Pick<ParticipantDetail, "champion_name" | "champion_id" | "position" | "team_win">
): ParticipantDetail {
  const win = overrides.team_win;
  return {
    puuid: overrides.puuid ?? `puuid-${overrides.champion_name}`,
    riot_id: overrides.riot_id ?? `${overrides.champion_name}Player#EUW`,
    champion_id: overrides.champion_id,
    champion_name: overrides.champion_name,
    position: overrides.position,
    win,
    kills: overrides.kills ?? 3,
    deaths: overrides.deaths ?? 4,
    assists: overrides.assists ?? 8,
    cs: overrides.cs ?? 180,
    gold_earned: overrides.gold_earned ?? 11_000,
    damage_to_champions: overrides.damage_to_champions ?? 18_000,
    vision_score: overrides.vision_score ?? 25,
    items: overrides.items ?? [3031, 3006, 3046, 3035, 3036, 0, 3363],
    summoner_spells: overrides.summoner_spells ?? [4, 14],
    is_viewer: overrides.is_viewer ?? false,
  };
}

function buildTeams(viewerWin: boolean): readonly [TeamDetail, TeamDetail] {
  const blueWin = viewerWin;
  const redWin = !viewerWin;

  const blue: TeamDetail = {
    team_id: 100,
    win: blueWin,
    bans: [157, 64, 238, 555, 89],
    objectives: {
      baron: blueWin ? 1 : 0,
      dragon: 3,
      rift_herald: 1,
      tower: 7,
      inhibitor: blueWin ? 2 : 0,
    },
    participants: [
      participant({
        champion_name: "Garen",
        champion_id: 86,
        position: "TOP",
        team_win: blueWin,
        kills: 5,
        deaths: 2,
        assists: 4,
        cs: 198,
      }),
      participant({
        champion_name: "LeeSin",
        champion_id: 64,
        position: "JUNGLE",
        team_win: blueWin,
        kills: 4,
        deaths: 5,
        assists: 12,
        cs: 142,
        summoner_spells: [4, 11],
      }),
      participant({
        champion_name: "Ahri",
        champion_id: 103,
        position: "MIDDLE",
        team_win: blueWin,
        kills: 8,
        deaths: 3,
        assists: 6,
        cs: 210,
      }),
      participant({
        champion_name: "Jinx",
        champion_id: 222,
        position: "BOTTOM",
        team_win: blueWin,
        kills: 12,
        deaths: 4,
        assists: 5,
        cs: 245,
        is_viewer: true,
        puuid: VIEWER_PUUID,
        riot_id: "You#EUW",
      }),
      participant({
        champion_name: "Thresh",
        champion_id: 412,
        position: "UTILITY",
        team_win: blueWin,
        kills: 1,
        deaths: 6,
        assists: 18,
        cs: 32,
        vision_score: 78,
      }),
    ],
  };

  const red: TeamDetail = {
    team_id: 200,
    win: redWin,
    bans: [222, 51, 254, 777, 360],
    objectives: {
      baron: redWin ? 1 : 0,
      dragon: 2,
      rift_herald: 0,
      tower: 4,
      inhibitor: redWin ? 1 : 0,
    },
    participants: [
      participant({
        champion_name: "Darius",
        champion_id: 122,
        position: "TOP",
        team_win: redWin,
        kills: 6,
        deaths: 4,
        assists: 2,
      }),
      participant({
        champion_name: "Viego",
        champion_id: 234,
        position: "JUNGLE",
        team_win: redWin,
        kills: 7,
        deaths: 6,
        assists: 4,
        summoner_spells: [4, 11],
      }),
      participant({
        champion_name: "Syndra",
        champion_id: 134,
        position: "MIDDLE",
        team_win: redWin,
        kills: 5,
        deaths: 5,
        assists: 7,
      }),
      participant({
        champion_name: "Caitlyn",
        champion_id: 51,
        position: "BOTTOM",
        team_win: redWin,
        kills: 9,
        deaths: 5,
        assists: 3,
      }),
      participant({
        champion_name: "Lux",
        champion_id: 99,
        position: "UTILITY",
        team_win: redWin,
        kills: 2,
        deaths: 7,
        assists: 14,
        vision_score: 65,
      }),
    ],
  };

  return [blue, red];
}

function createMatch(
  matchId: string,
  viewerWin: boolean,
  gameDuration: number
): MatchDetail {
  return {
    match_id: matchId,
    game_creation: Date.now() - 86_400_000,
    game_duration: gameDuration,
    game_version: "14.24.1",
    queue_id: 420,
    queue_label: "Ranked Solo/Duo",
    map_id: 11,
    map_label: "Summoner's Rift",
    teams: buildTeams(viewerWin),
  };
}

const MOCK_MATCHES: Record<string, MatchDetail> = {
  EUW1_mock_1: createMatch("EUW1_mock_1", false, 25 * 60),
  EUW1_mock_2: createMatch("EUW1_mock_2", true, 30 * 60),
  EUW1_mock_3: createMatch("EUW1_mock_3", true, 40 * 60),
  EUW1_mock_4: createMatch("EUW1_mock_4", false, 20 * 60),
};

export const MOCK_MATCH_DETAIL = MOCK_MATCHES.EUW1_mock_1;

export function getMockMatchDetail(matchId: string): MatchDetail {
  return MOCK_MATCHES[matchId] ?? { ...MOCK_MATCH_DETAIL, match_id: matchId };
}

export { VIEWER_PUUID };
