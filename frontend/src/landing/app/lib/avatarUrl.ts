const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

/** Resolve a backend-relative avatar path to a full URL for img src. */
export function resolveAvatarUrl(avatarUrl: string | null | undefined): string | undefined {
  if (!avatarUrl) {
    return undefined;
  }
  if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
    return avatarUrl;
  }
  return `${API_URL}${avatarUrl}`;
}
