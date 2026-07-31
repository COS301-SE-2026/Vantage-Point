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

export interface ChampionBan {
  readonly champion_id: number;
  readonly champion_name: string;
}

export interface TeamDetail {
  readonly team_id: number;
  readonly win: boolean;
  readonly bans: readonly ChampionBan[];
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

/** Result of importing recent matches from Riot into the backend. */
export interface MatchSyncResult {
  /** Match ids Riot returned for the linked account. */
  readonly fetched: number;
  /** How many of those were new and got stored. */
  readonly imported: number;
  /** Matches now stored for this account in total. */
  readonly total: number;
}

/** Viewer summary for a single match in the dashboard list. */
export interface MatchHistorySummary {
  readonly matchId: string;
  readonly champion_name: string;
  readonly outcome: "Victory" | "Defeat";
  readonly duration_minutes: number;
  readonly map_label: string;
  readonly played_on: string;
  readonly kills: number;
  readonly deaths: number;
  readonly assists: number;
  readonly cs: number;
  readonly position: string;
}
