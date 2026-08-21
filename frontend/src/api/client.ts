import {
  clearStoredTokens,
  getStoredTokens,
  getStoredUsername,
  setStoredTokens,
} from "../lib/tokens";
import type { ApiErrorBody, RefreshResponse } from "../types/auth";

/**
 * Trailing slashes are trimmed in a single pass. The obvious `/\/+$/` costs
 * quadratic time on a long run of slashes, because the engine has to backtrack
 * through every split before it can fail.
 */
function withoutTrailingSlashes(value: string): string {
  let end = value.length;
  while (end > 0 && value[end - 1] === "/") end -= 1;
  return value.slice(0, end);
}

const API_URL = withoutTrailingSlashes(
  import.meta.env.VITE_API_URL ?? "http://localhost:8000",
);

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function buildUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${cleanPath}`;
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    if (typeof body.detail === "string") {
      return body.detail;
    }
    if (Array.isArray(body.detail) && body.detail[0]?.msg) {
      return body.detail[0].msg;
    }
  } catch {
    // ignore JSON parse errors
  }
  return response.statusText || "Request failed";
}

let refreshInFlight: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const { refreshToken } = getStoredTokens();
  const username = getStoredUsername();
  // Cognito derives a secret hash from the username, so a refresh needs both. We only
  // get here because an access token was rejected, so anything we cannot refresh is a
  // dead session: clear it rather than leave a token behind that keeps failing. That
  // covers sessions stored before the username was kept, which sign in again once.
  if (!refreshToken || !username) {
    clearStoredTokens();
    return false;
  }

  const response = await fetch(buildUrl("/refresh-auth"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, refresh_token: refreshToken }),
  });

  if (!response.ok) {
    clearStoredTokens();
    return false;
  }

  const refreshed = (await response.json()) as RefreshResponse;
  // A refresh exchange returns a new access token and nothing else: Cognito does not
  // reissue the refresh token, so the one we already hold has to be carried forward.
  setStoredTokens(refreshed.access_token, refreshToken);
  return true;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retryOnUnauthorized = true,
): Promise<T> {
  const { accessToken } = getStoredTokens();
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  const url = buildUrl(path);
  let response = await fetch(url, { ...options, headers });

  if (response.status === 401 && retryOnUnauthorized) {
    if (!refreshInFlight) {
      refreshInFlight = refreshAccessToken().finally(() => {
        refreshInFlight = null;
      });
    }
    const refreshed = await refreshInFlight;
    if (refreshed) {
      const retryHeaders = new Headers(options.headers);
      if (!retryHeaders.has("Content-Type") && options.body) {
        retryHeaders.set("Content-Type", "application/json");
      }
      const { accessToken: newAccess } = getStoredTokens();
      if (newAccess) {
        retryHeaders.set("Authorization", `Bearer ${newAccess}`);
      }
      response = await fetch(buildUrl(path), {
        ...options,
        headers: retryHeaders,
      });
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function apiFetchFormData<T>(
  path: string,
  formData: FormData,
  retryOnUnauthorized = true,
): Promise<T> {
  const { accessToken } = getStoredTokens();
  const headers = new Headers();
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const url = buildUrl(path);
  let response = await fetch(url, {
    method: "POST",
    headers,
    body: formData,
  });

  if (response.status === 401 && retryOnUnauthorized) {
    if (!refreshInFlight) {
      refreshInFlight = refreshAccessToken().finally(() => {
        refreshInFlight = null;
      });
    }
    const refreshed = await refreshInFlight;
    if (refreshed) {
      const retryHeaders = new Headers();
      const { accessToken: newAccess } = getStoredTokens();
      if (newAccess) {
        retryHeaders.set("Authorization", `Bearer ${newAccess}`);
      }
      response = await fetch(buildUrl(path), {
        method: "POST",
        headers: retryHeaders,
        body: formData,
      });
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response));
  }

  return (await response.json()) as T;
}

export async function apiFetchPublic<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  const url = buildUrl(path);

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response));
  }
  return (await response.json()) as T;
}
