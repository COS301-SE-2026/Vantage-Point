import { apiFetchPublic } from "./client";
import { setStoredTokens } from "../lib/tokens";
import type { TokenResponse } from "../types/auth";

export interface RegisterPayload {
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly confirm_password: string;
}

export interface LoginPayload {
  readonly username: string;
  readonly password: string;
}

export async function registerUser(payload: RegisterPayload): Promise<void> {
  const tokens = await apiFetchPublic<TokenResponse>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  setStoredTokens(tokens.access_token, tokens.refresh_token);
}

export async function loginUser(payload: LoginPayload): Promise<void> {
  const tokens = await apiFetchPublic<TokenResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  setStoredTokens(tokens.access_token, tokens.refresh_token);
}
