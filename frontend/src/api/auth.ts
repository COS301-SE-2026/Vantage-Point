import { apiFetchPublic } from "./client";
import { setStoredTokens } from "../lib/tokens";
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
  const params = new URLSearchParams({
    username: payload.username,
    email: payload.email,
    password: payload.password,
  });

  await apiFetchPublic<void>(`/register?${params.toString()}`, {
    method: "POST",
  });
}

export async function loginUser(payload: LoginPayload): Promise<void> {
  const params = new URLSearchParams({
    username: payload.username,
    password: payload.password,
  });

  const tokens = await apiFetchPublic<TokenResponse>(`/login?${params.toString()}`, {
    method: "POST",
  });

  setStoredTokens(tokens.access_token, tokens.refresh_token);
}

export async function confirmUser(payload: ConfirmPayload): Promise<void> {
  const params = new URLSearchParams({
    username: payload.username,
    code: payload.code,
  });

  await apiFetchPublic<void>(`/confim-user?${params.toString()}`, {
    method: "POST",
  });
}
