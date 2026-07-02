import { ApiError, apiFetchPublic } from "./client";
import { normalizeTokens, setStoredTokens } from "../lib/tokens";
import type { CognitoTokenResponse } from "../types/auth";

export class UserNotConfirmedError extends Error {
  readonly username: string;

  constructor(username: string, message = "Account is not confirmed.") {
    super(message);
    this.name = "UserNotConfirmedError";
    this.username = username;
  }
}

export interface LoginPayload {
  readonly email: string;
  readonly password: string;
}

export interface RegisterPayload {
  readonly email: string;
  readonly password: string;
  readonly confirm_password: string;
}

export interface ConfirmPayload {
  readonly username: string;
  readonly confirmation_code: string;
}

function isUserNotConfirmedMessage(message: string): boolean {
  return /not\s*confirmed|UserNotConfirmedException/i.test(message);
}

function throwIfUserNotConfirmed(username: string, err: unknown): never {
  if (err instanceof ApiError && isUserNotConfirmedMessage(err.message)) {
    throw new UserNotConfirmedError(username, err.message);
  }
  throw err;
}

async function storeTokensFromResponse(raw: CognitoTokenResponse): Promise<void> {
  const tokens = normalizeTokens(raw);
  setStoredTokens(tokens.access_token, tokens.refresh_token);
}

export async function loginUser(payload: LoginPayload): Promise<void> {
  const username = payload.email.trim();
  try {
    const raw = await apiFetchPublic<CognitoTokenResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password: payload.password }),
    });
    await storeTokensFromResponse(raw);
  } catch (err) {
    throwIfUserNotConfirmed(username, err);
  }
}

export async function registerUser(payload: RegisterPayload): Promise<void> {
  const username = payload.email.trim();
  await apiFetchPublic<{ message: string }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      username,
      email: username,
      password: payload.password,
      confirm_password: payload.confirm_password,
    }),
  });
}

export async function confirmUser(payload: ConfirmPayload): Promise<void> {
  await apiFetchPublic<{ status: string }>("/api/auth/confirm", {
    method: "POST",
    body: JSON.stringify({
      username: payload.username,
      confirmation_code: payload.confirmation_code,
    }),
  });
}

export async function refreshTokens(refreshToken: string): Promise<void> {
  const raw = await apiFetchPublic<CognitoTokenResponse>("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  await storeTokensFromResponse(raw);
}

export async function logoutUser(accessToken: string): Promise<void> {
  const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
  const response = await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, "Logout failed");
  }
}

export async function exchangeOAuthCode(
  code: string,
  redirectUri: string,
): Promise<void> {
  const raw = await apiFetchPublic<CognitoTokenResponse>(
    "/api/auth/oauth/callback",
    {
      method: "POST",
      body: JSON.stringify({ code, redirect_uri: redirectUri }),
    },
  );
  await storeTokensFromResponse(raw);
}
