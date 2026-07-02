import type { CognitoTokenResponse, TokenResponse } from "../types/auth";

const ACCESS_KEY = "vp_access_token";
const REFRESH_KEY = "vp_refresh_token";

export function getStoredTokens(): {
  accessToken: string | null;
  refreshToken: string | null;
} {
  return {
    accessToken: localStorage.getItem(ACCESS_KEY),
    refreshToken: localStorage.getItem(REFRESH_KEY),
  };
}

export function setStoredTokens(
  accessToken: string,
  refreshToken: string,
): void {
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearStoredTokens(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function hasStoredAccessToken(): boolean {
  return Boolean(localStorage.getItem(ACCESS_KEY));
}

/** Accepts AWS PascalCase or normalized snake_case token payloads. */
export function normalizeTokens(raw: CognitoTokenResponse): TokenResponse {
  const accessToken = raw.access_token ?? raw.AccessToken;
  const refreshToken = raw.refresh_token ?? raw.RefreshToken;

  if (!accessToken || !refreshToken) {
    throw new Error("Authentication response is missing required tokens.");
  }

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: raw.token_type ?? raw.TokenType ?? "Bearer",
  };
}
