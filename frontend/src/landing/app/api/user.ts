import { apiFetch, apiFetchFormData } from "./client";
import type {
  AvatarUploadResponse,
  LinkGameAccountResponse,
  UserMe,
} from "../types/auth";

export async function getMe(): Promise<UserMe> {
  return apiFetch<UserMe>("/api/v1/users/me");
}

export async function updateMe(payload: {
  display_name: string;
}): Promise<UserMe> {
  return apiFetch<UserMe>("/api/v1/users/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function uploadAvatar(file: File): Promise<AvatarUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetchFormData<AvatarUploadResponse>(
    "/api/v1/users/me/avatar",
    formData
  );
}

export async function deleteAvatar(): Promise<void> {
  return apiFetch<void>("/api/v1/users/me/avatar", {
    method: "DELETE",
  });
}

export async function linkGameAccount(
  riotId: string
): Promise<LinkGameAccountResponse> {
  return apiFetch<LinkGameAccountResponse>("/api/v1/users/me/game-accounts", {
    method: "POST",
    body: JSON.stringify({ riot_id: riotId }),
  });
}

export async function updateRiotId(
  riotId: string
): Promise<LinkGameAccountResponse> {
  return apiFetch<LinkGameAccountResponse>("/api/v1/users/me/game-accounts", {
    method: "PUT",
    body: JSON.stringify({ riot_id: riotId }),
  });
}
