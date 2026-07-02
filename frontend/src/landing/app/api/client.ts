import {
  clearStoredTokens,
  getStoredTokens,
  setStoredTokens,
} from "../lib/tokens";
import { normalizeTokens } from "../lib/tokens";
import type { ApiErrorBody, CognitoTokenResponse } from "../types/auth";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
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
  if (!refreshToken) {
    return false;
  }

  const response = await fetch(`${API_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    clearStoredTokens();
    return false;
  }

  const raw = (await response.json()) as CognitoTokenResponse;
  const tokens = normalizeTokens(raw);
  setStoredTokens(tokens.access_token, tokens.refresh_token);
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

  let response = await fetch(`${API_URL}${path}`, { ...options, headers });

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
      response = await fetch(`${API_URL}${path}`, {
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

  let response = await fetch(`${API_URL}${path}`, {
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
      response = await fetch(`${API_URL}${path}`, {
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

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response));
  }
  return (await response.json()) as T;
}
