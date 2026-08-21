/**
 * Every call here sends its secrets in the request body rather than the query string.
 * A URL carrying a password, a verification code or a token is written to the server's
 * access log, the browser's history and any Referer header the page emits.
 */

import { apiFetch, apiFetchPublic } from "./client";
import { setStoredTokens, setStoredUsername } from "../lib/tokens";
import type { TokenResponse } from "../types/auth";

export interface RegisterPayload {
  readonly username: string;
  readonly email: string;
  readonly password: string;
}

export interface LoginPayload {
  readonly username: string;
  readonly password: string;
}

export interface ConfirmPayload {
  readonly username: string;
  readonly code: string;
}

export async function registerUser(payload: RegisterPayload): Promise<void> {
  await apiFetchPublic<void>("/register", {
    method: "POST",
    body: JSON.stringify({
      username: payload.username,
      email: payload.email,
      password: payload.password,
    }),
  });
}

export async function loginUser(payload: LoginPayload): Promise<void> {
  const tokens = await apiFetchPublic<TokenResponse>("/login", {
    method: "POST",
    body: JSON.stringify({
      username: payload.username,
      password: payload.password,
    }),
  });

  setStoredTokens(tokens.access_token, tokens.refresh_token);
  // Kept for the refresh exchange, which Cognito will not do on the token alone.
  setStoredUsername(payload.username);
}

export async function confirmUser(payload: ConfirmPayload): Promise<void> {
  // The path really is spelled `confim-user` on the API. Left alone deliberately:
  // correcting it is a breaking change for anything else already calling it.
  await apiFetchPublic<void>("/confim-user", {
    method: "POST",
    body: JSON.stringify({
      username: payload.username,
      code: payload.code,
    }),
  });
}

/**
 * Tells the API the session is over. Access tokens are stateless, so the local
 * clear-down is what actually signs the user out. This is best effort and must
 * never keep the user on a screen they asked to leave.
 */
export async function logoutUser(): Promise<void> {
  try {
    await apiFetch<{ message: string }>("/logout", { method: "POST" });
  } catch {
    // already signed out, or the API is unreachable
  }
}
