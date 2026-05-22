import { apiFetchPublic } from "./client";
import { setStoredTokens } from "../lib/tokens";
import type { TokenResponse } from "../types/auth";

export interface RegisterPayload {
  readonly email: string;
  readonly display_name: string;
  readonly password: string;
}

export interface LoginPayload {
  readonly email: string;
  readonly password: string;
}

async function storeTokensFromResponse(tokens: TokenResponse): Promise<void> {
  setStoredTokens(tokens.access_token, tokens.refresh_token);
}

export async function registerUser(payload: RegisterPayload): Promise<void> {
  const tokens = await apiFetchPublic<TokenResponse>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  await storeTokensFromResponse(tokens);
}

export async function loginUser(payload: LoginPayload): Promise<void> {
  const tokens = await apiFetchPublic<TokenResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  await storeTokensFromResponse(tokens);
}
