export interface TokenResponse {
  readonly access_token: string;
  readonly refresh_token: string;
  readonly token_type: string;
}

/**
 * What a refresh exchange returns. Deliberately not a `TokenResponse`: Cognito does
 * not reissue a refresh token here, so the caller keeps the one it already has.
 */
export interface RefreshResponse {
  readonly access_token: string;
  readonly id_token: string | null;
}

export interface UserMe {
  readonly cognito_sub: string;
  readonly email: string;
  readonly display_name: string;
  readonly avatar_url: string | null;
  readonly riot_id_tag: string | null;
  readonly has_linked_riot: boolean;
  readonly role: "Player" | "Admin" | "Super Admin"; // This is for COGNITO grouping. needs /api/v1/users/me  to be working
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
