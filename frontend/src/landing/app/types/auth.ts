export interface TokenResponse {
  readonly access_token: string;
  readonly refresh_token: string;
  readonly token_type: string;
}

/** Raw Cognito login response (PascalCase) or normalized backend response (snake_case). */
export interface CognitoTokenResponse {
  readonly AccessToken?: string;
  readonly RefreshToken?: string;
  readonly IdToken?: string;
  readonly ExpiresIn?: number;
  readonly TokenType?: string;
  readonly access_token?: string;
  readonly refresh_token?: string;
  readonly id_token?: string;
  readonly expires_in?: number;
  readonly token_type?: string;
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
