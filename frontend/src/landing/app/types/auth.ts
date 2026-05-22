export interface TokenResponse {
  readonly access_token: string;
  readonly refresh_token: string;
  readonly token_type: string;
}

export interface UserMe {
  readonly id: string;
  readonly email: string;
  readonly display_name: string;
  readonly avatar_url: string | null;
  readonly riot_id_tag: string | null;
  readonly has_linked_riot: boolean;
}

export interface AvatarUploadResponse {
  readonly avatar_url: string;
}

export interface LinkGameAccountResponse {
  readonly puuid: string;
  readonly riot_id_tag: string;
  readonly message: string;
}

export interface ApiErrorBody {
  readonly detail?: string | { readonly msg?: string }[];
}
