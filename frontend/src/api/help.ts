import type {
  HelpArticle,
  HelpArticleCreatePayload,
  HelpArticleUpdatePayload,
} from "../types/help";

// Re-export type for convenience in components
export type { HelpArticle };

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const BASE_URL = `${API_BASE_URL}/api/help`;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP Error ${response.status}`);
  }
  return response.json() as Promise<T>;
}

/**
 * Fetch all help articles ordered by updated_at descending.
 */
export async function fetchHelpArticles(): Promise<HelpArticle[]> {
  const response = await fetch(BASE_URL, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
  return handleResponse<HelpArticle[]>(response);
}

/**
 * Create a new help article.
 */
export async function createHelpArticle(
  payload: HelpArticleCreatePayload
): Promise<HelpArticle> {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<HelpArticle>(response);
}

/**
 * Update an existing help article by ID.
 */
export async function updateHelpArticle(
  articleId: number,
  payload: HelpArticleUpdatePayload
): Promise<HelpArticle> {
  const response = await fetch(`${BASE_URL}/${articleId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<HelpArticle>(response);
}

/**
 * Delete a help article by ID.
 */
export async function deleteHelpArticle(articleId: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/${articleId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Failed to delete article with ID ${articleId}`);
  }
}

/**
 * Cast an upvote or downvote on an article.
 */
export async function voteHelpArticle(
  articleId: number,
  voteType: "up" | "down"
): Promise<HelpArticle> {
  const response = await fetch(`${BASE_URL}/${articleId}/vote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ vote_type: voteType }),
  });
  return handleResponse<HelpArticle>(response);
}
