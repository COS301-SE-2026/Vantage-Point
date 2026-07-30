import { apiFetch, apiFetchPublic } from "./client";
import { setStoredTokens } from "../lib/tokens";
import type { TokenResponse } from "../types/auth";

export interface RegisterPayload {
  readonly email: string;
  readonly display_name: string;
  readonly password: string;
}

export interface LoginPayload {
  readonly username: string;
  readonly password: string;
}

async function storeTokensFromResponse(tokens: TokenResponse): Promise<void> {
  setStoredTokens(tokens.access_token, tokens.refresh_token);
}

export async function registerUser(payload: RegisterPayload): Promise<void> {
  const tokens = await apiFetchPublic<TokenResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  await storeTokensFromResponse(tokens);
}

export async function loginUser(payload: LoginPayload): Promise<void> {
  const tokens = await apiFetchPublic<TokenResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  await storeTokensFromResponse(tokens);
}

/**
 * Tells the API the session is over. Access tokens are stateless, so the local
 * clear-down is what actually signs the user out — this is best effort and must
 * never keep the user on a screen they asked to leave.
 */
export async function logoutUser(): Promise<void> {
  try {
    await apiFetch<{ message: string }>("/api/auth/logout", { method: "POST" });
  } catch {
    // already signed out, or the API is unreachable
  }
}
