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

export interface HelpArticleCreatePayload {
  title: string;
  content: string;
  tags: string[];
}

export interface HelpArticleUpdatePayload {
  title?: string;
  content?: string;
  tags?: string[];
}

export interface HelpArticleVotePayload {
  vote_type: "up" | "down";
}
