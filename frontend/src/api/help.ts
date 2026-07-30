import { apiFetch } from "./client";

export interface HelpArticle {
  id: number;
  title: string;
  content: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  created_at: string;
  updated_at: string;
}

export interface CreateHelpArticlePayload {
  title: string;
  content: string;
  tags: string[];
}

export interface UpdateHelpArticlePayload {
  title?: string;
  content?: string;
  tags?: string[];
}

export async function fetchHelpArticles(search?: string): Promise<HelpArticle[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiFetch<HelpArticle[]>(`/api/v1/help${query}`);
}

export async function createHelpArticle(payload: CreateHelpArticlePayload): Promise<HelpArticle> {
  return apiFetch<HelpArticle>("/api/v1/help", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateHelpArticle(
  id: number,
  payload: UpdateHelpArticlePayload,
): Promise<HelpArticle> {
  return apiFetch<HelpArticle>(`/api/v1/help/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteHelpArticle(id: number): Promise<void> {
  return apiFetch<void>(`/api/v1/help/${id}`, {
    method: "DELETE",
  });
}

export async function voteHelpArticle(
  id: number,
  voteType: "up" | "down",
): Promise<HelpArticle> {
  return apiFetch<HelpArticle>(`/api/v1/help/${id}/vote`, {
    method: "POST",
    body: JSON.stringify({ vote_type: voteType }),
  });
}
