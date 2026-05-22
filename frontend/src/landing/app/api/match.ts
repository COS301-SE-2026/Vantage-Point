import { apiFetch } from "./client";
import type { MatchDetail, ParticipantDetail, TeamDetail } from "../types/match";

interface ObjectivesSummaryApi {
  readonly baron: number;
  readonly dragon: number;
  readonly rift_herald: number;
  readonly tower: number;
  readonly inhibitor: number;
}

interface ParticipantDetailApi {
  readonly puuid: string;
  readonly riot_id: string | null;
  readonly champion_id: number;
  readonly champion_name: string;
  readonly position: string;
  readonly win: boolean;
  readonly kills: number;
  readonly deaths: number;
  readonly assists: number;
  readonly cs: number;
  readonly gold_earned: number;
  readonly damage_to_champions: number;
  readonly vision_score: number;
  readonly items: number[];
  readonly summoner_spells: number[];
  readonly is_viewer: boolean;
}

interface ChampionBanApi {
  readonly champion_id: number;
  readonly champion_name: string;
}

interface TeamDetailApi {
  readonly team_id: number;
  readonly win: boolean;
  readonly bans: ChampionBanApi[];
  readonly objectives: ObjectivesSummaryApi;
  readonly participants: ParticipantDetailApi[];
}

interface MatchDetailApi {
  readonly match_id: string;
  readonly game_creation: number;
  readonly game_duration: number;
  readonly game_version: string;
  readonly queue_id: number;
  readonly queue_label: string;
  readonly map_id: number;
  readonly map_label: string;
  readonly teams: TeamDetailApi[];
}

function mapParticipant(p: ParticipantDetailApi): ParticipantDetail {
  return {
    puuid: p.puuid,
    riot_id: p.riot_id,
    champion_id: p.champion_id,
    champion_name: p.champion_name,
    position: p.position,
    win: p.win,
    kills: p.kills,
    deaths: p.deaths,
    assists: p.assists,
    cs: p.cs,
    gold_earned: p.gold_earned,
    damage_to_champions: p.damage_to_champions,
    vision_score: p.vision_score,
    items: p.items,
    summoner_spells: p.summoner_spells,
    is_viewer: p.is_viewer,
  };
}

function mapTeam(t: TeamDetailApi): TeamDetail {
  return {
    team_id: t.team_id,
    win: t.win,
    bans: t.bans.map((ban) => ({
      champion_id: ban.champion_id,
      champion_name: ban.champion_name,
    })),
    objectives: t.objectives,
    participants: t.participants.map(mapParticipant),
  };
}

function mapMatchDetail(body: MatchDetailApi): MatchDetail {
  return {
    match_id: body.match_id,
    game_creation: body.game_creation,
    game_duration: body.game_duration,
    game_version: body.game_version,
    queue_id: body.queue_id,
    queue_label: body.queue_label,
    map_id: body.map_id,
    map_label: body.map_label,
    teams: body.teams.map(mapTeam),
  };
}

export async function fetchMatchDetail(
  matchId: string,
  _puuid?: string
): Promise<MatchDetail> {
  const body = await apiFetch<MatchDetailApi>(
    `/api/v1/matches/${encodeURIComponent(matchId)}`
  );
  return mapMatchDetail(body);
}
