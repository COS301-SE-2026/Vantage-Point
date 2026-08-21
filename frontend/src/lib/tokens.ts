const ACCESS_KEY = "vp_access_token";
const REFRESH_KEY = "vp_refresh_token";
// Cognito computes a secret hash from the username on a refresh exchange, so the
// refresh token alone is not enough to get a new access token. Kept from login.
const USERNAME_KEY = "vp_username";

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

export function getStoredUsername(): string | null {
  return localStorage.getItem(USERNAME_KEY);
}

export function setStoredUsername(username: string): void {
  localStorage.setItem(USERNAME_KEY, username);
}

export function clearStoredTokens(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USERNAME_KEY);
}

export function hasStoredAccessToken(): boolean {
  return Boolean(localStorage.getItem(ACCESS_KEY));
}
