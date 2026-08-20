import { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router";
import {
  ArrowUpDown,
  Search,
  ChevronDown,
  Plus,
  ThumbsUp,
  ThumbsDown,
  Pencil,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import {
  fetchHelpArticles,
  createHelpArticle,
  updateHelpArticle,
  deleteHelpArticle,
  voteHelpArticle,
  type HelpArticle,
} from "../api/help";

export default function HelpPage() {
  // Help is reachable both as a dashboard tab and as a standalone page; only
  // the standalone one paints its own canvas.
  const isInsideDashboard = Boolean(useOutletContext());

  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<HelpArticle | null>(
    null,
  );
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const loadArticles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchHelpArticles();
      setArticles(data);
    } catch (err) {
      console.error("Failed to fetch articles:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadArticles();
  }, [loadArticles]);

  // Handlers for Add/Edit Modal
  const handleOpenAddModal = () => {
    setEditingArticle(null);
    setFormData({ title: "", content: "", tags: "AI, INFO" });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (article: HelpArticle, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingArticle(article);
    setFormData({
      title: article.title,
      content: article.content,
      tags: article.tags.join(", "),
    });
    setIsModalOpen(true);
  };

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const parsedTags = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      if (editingArticle) {
        const updated = await updateHelpArticle(editingArticle.id, {
          title: formData.title,
          content: formData.content,
          tags: parsedTags,
        });
        setArticles((prev) =>
          prev.map((a) => (a.id === updated.id ? updated : a)),
        );
      } else {
        const created = await createHelpArticle({
          title: formData.title,
          content: formData.content,
          tags: parsedTags,
        });
        setArticles((prev) => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save article:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteArticle = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this article?"))
      return;

    try {
      await deleteHelpArticle(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Failed to delete article:", err);
    }
  };

  const handleVote = async (
    id: number,
    type: "up" | "down",
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    try {
      const updated = await voteHelpArticle(id, type);
      setArticles((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a)),
      );
    } catch (err) {
      console.error("Voting failed:", err);
    }
  };

  // Search & Filter
  const filteredArticles = articles
    .filter(
      (article) =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      const dateA = new Date(a.updated_at).getTime();
      const dateB = new Date(b.updated_at).getTime();
      return sortAsc ? dateA - dateB : dateB - dateA;
    });

  return (
    <div
      className={
        isInsideDashboard
          ? "dark min-w-0"
          : "dark min-h-screen w-full bg-vp-canvas py-6"
      }
      data-name="help-page"
    >
      <div className="h-full overflow-y-auto px-8 py-6">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          {/* Controls Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 rounded-full bg-[#C8AA6E] px-5 font-semibold text-[#091428] shadow-md transition-all hover:bg-[#D8BA7E] hover:shadow-lg hover:shadow-[#C8AA6E]/20 active:bg-[#B89A5E]"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Add Article</span>
            </Button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSortAsc((prev) => !prev)}
                className="p-2 text-zinc-400 transition-colors hover:text-[#C8AA6E]"
                title="Toggle Sort Order"
                aria-label="Sort"
              >
                <ArrowUpDown className="h-5 w-5" />
              </button>

              <div className="relative w-full max-w-xs">
                <Input
                  type="text"
                  placeholder="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-full border-zinc-800 bg-vp-surface pr-9 text-zinc-100 placeholder:text-zinc-500 focus-visible:border-[#C8AA6E] focus-visible:ring-1 focus-visible:ring-[#C8AA6E]"
                />
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none text-zinc-500" />
              </div>
            </div>
          </div>

          {/* Article List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#C8AA6E]" />
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="py-12 text-center text-zinc-400">
              No help articles found.
            </div>
          ) : (
            <Accordion
              type="single"
              collapsible
              className="flex flex-col gap-4"
            >
              {filteredArticles.map((article) => (
                <AccordionItem
                  key={article.id}
                  value={`article-${article.id}`}
                  className="rounded-2xl border border-zinc-800/80 bg-vp-surface px-6 py-4 shadow-sm transition-all hover:border-[#C8AA6E]/50 [&[data-state=open]]:border-[#C8AA6E] [&[data-state=open]]:shadow-lg [&[data-state=open]]:shadow-[#C8AA6E]/5"
                >
                  <AccordionTrigger className="p-0 hover:no-underline [&[data-state=open]>div>div>.chevron]:rotate-180 [&[data-state=open]>div>div>.chevron]:text-[#C8AA6E]">
                    <div className="flex w-full flex-col gap-4 text-left">
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="text-base font-semibold text-zinc-100 group-hover:text-[#F0E6D2]">
                          {article.title}
                        </h3>
                        <span className="whitespace-nowrap text-xs font-semibold text-zinc-400">
                          Last Updated:{" "}
                          <span className="text-[#C8AA6E]">
                            {new Date(article.updated_at).toLocaleDateString()}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                            TAGS
                          </span>
                          {article.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="rounded-full border border-[#C8AA6E]/30 bg-[#C8AA6E]/10 px-3 py-0.5 text-xs font-bold text-[#C8AA6E] transition-colors hover:bg-[#C8AA6E]/20"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <ChevronDown className="chevron h-5 w-5 text-zinc-400 transition-transform duration-200" />
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="mt-4 border-t border-zinc-800/60 pt-4 text-sm leading-relaxed text-zinc-300">
                    <p className="mb-4 whitespace-pre-line">
                      {article.content}
                    </p>

                    {/* Voting & Actions Toolbar */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={(e) => handleVote(article.id, "up", e)}
                          className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-[#C8AA6E]"
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span>{article.upvotes}</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleVote(article.id, "down", e)}
                          className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-red-400"
                        >
                          <ThumbsDown className="h-4 w-4" />
                          <span>{article.downvotes}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleOpenEditModal(article, e)}
                          className="p-1.5 text-zinc-400 transition-colors hover:text-[#C8AA6E]"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteArticle(article.id, e)}
                          className="p-1.5 text-zinc-400 transition-colors hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </div>

      {/* Add / Edit Article Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#C8AA6E]/30 bg-vp-surface p-6 shadow-2xl shadow-black/80">
            <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-lg font-bold text-[#F0E6D2]">
                {editingArticle
                  ? "Edit Help Article"
                  : "Create New Help Article"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-[#C8AA6E]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-300">
                  Title
                </label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g. How to link Riot ID"
                  className="border-zinc-700 bg-vp-surface text-zinc-100 focus-visible:border-[#C8AA6E] focus-visible:ring-1 focus-visible:ring-[#C8AA6E]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-300">
                  Content / Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Article details and troubleshooting steps..."
                  className="w-full rounded-md border border-zinc-700 bg-vp-surface p-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-[#C8AA6E] focus:outline-none focus:ring-1 focus:ring-[#C8AA6E]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-300">
                  Tags (comma separated)
                </label>
                <Input
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  placeholder="AI, INFO, ACCOUNT"
                  className="border-zinc-700 bg-vp-surface text-zinc-100 focus-visible:border-[#C8AA6E] focus-visible:ring-1 focus-visible:ring-[#C8AA6E]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#C8AA6E] font-bold text-[#091428] transition-all hover:bg-[#D8BA7E] hover:shadow-lg hover:shadow-[#C8AA6E]/20 active:bg-[#B89A5E]"
                >
                  {submitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingArticle ? "Save Changes" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
