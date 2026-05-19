export interface ObjectivesSummary {
  readonly baron: number;
  readonly dragon: number;
  readonly rift_herald: number;
  readonly tower: number;
  readonly inhibitor: number;
}

export interface ParticipantDetail {
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
  readonly items: readonly number[];
  readonly summoner_spells: readonly number[];
  readonly is_viewer: boolean;
}

export interface TeamDetail {
  readonly team_id: number;
  readonly win: boolean;
  readonly bans: readonly number[];
  readonly objectives: ObjectivesSummary;
  readonly participants: readonly ParticipantDetail[];
}

export interface MatchDetail {
  readonly match_id: string;
  readonly game_creation: number;
  readonly game_duration: number;
  readonly game_version: string;
  readonly queue_id: number;
  readonly queue_label: string;
  readonly map_id: number;
  readonly map_label: string;
  readonly teams: readonly TeamDetail[];
}
