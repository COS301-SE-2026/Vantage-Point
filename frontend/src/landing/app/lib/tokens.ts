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
