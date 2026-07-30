import { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router";
import {
  Filter,
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
  DASHBOARD_CONTENT_HEIGHT,
  getDashboardContentStyle,
} from "../lib/dashboardLayout";
import type { DashboardOutletContext } from "../context/dashboardLayoutContext";
import {
  fetchHelpArticles,
  createHelpArticle,
  updateHelpArticle,
  deleteHelpArticle,
  voteHelpArticle,
  type HelpArticle,
} from "../api/help";

export default function HelpPage() {
  const outlet = useOutletContext<DashboardOutletContext | undefined>();
  const isInsideDashboard = Boolean(outlet);
  const sidebarOpen = outlet?.sidebarOpen ?? true;
  const contentStyle = isInsideDashboard
    ? getDashboardContentStyle(sidebarOpen)
    : {};

  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<HelpArticle | null>(null);
  const [formData, setFormData] = useState({ title: "", content: "", tags: "" });
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
          prev.map((a) => (a.id === updated.id ? updated : a))
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
    if (!window.confirm("Are you sure you want to delete this article?")) return;

    try {
      await deleteHelpArticle(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Failed to delete article:", err);
    }
  };

  const handleVote = async (id: number, type: "up" | "down", e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await voteHelpArticle(id, type);
      setArticles((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a))
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
        article.content.toLowerCase().includes(searchQuery.toLowerCase())
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
          ? "absolute top-[var(--vp-dashboard-header)] min-w-0 transition-[left,width] duration-300 ease-out bg-white"
          : "min-h-screen w-full bg-white py-6"
      }
      style={
        isInsideDashboard
          ? { ...contentStyle, height: DASHBOARD_CONTENT_HEIGHT }
          : {}
      }
      data-name="help-page"
    >
      <div className="h-full overflow-y-auto px-8 py-6">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          {/* Controls Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 bg-zinc-900 text-white hover:bg-zinc-800 rounded-full px-4"
            >
              <Plus className="h-4 w-4" />
              <span>Add Article</span>
            </Button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSortAsc((prev) => !prev)}
                className="p-2 text-zinc-600 hover:text-zinc-900 transition-colors"
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
                  className="pr-9 rounded-full border-zinc-300 bg-white placeholder:text-zinc-400 focus-visible:ring-zinc-400"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Article List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              No help articles found.
            </div>
          ) : (
            <Accordion type="single" collapsible className="flex flex-col gap-4">
              {filteredArticles.map((article) => (
                <AccordionItem
                  key={article.id}
                  value={`article-${article.id}`}
                  className="rounded-2xl border border-zinc-200 bg-white px-6 py-4 shadow-sm transition-all hover:border-zinc-300 [&[data-state=open]]:shadow-md"
                >
                  <AccordionTrigger className="p-0 hover:no-underline [&[data-state=open]>div>div>.chevron]:rotate-180">
                    <div className="flex w-full flex-col gap-4 text-left">
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="text-base font-semibold text-zinc-900">
                          {article.title}
                        </h3>
                        <span className="text-xs font-semibold text-zinc-500 whitespace-nowrap">
                          Last Updated:{" "}
                          <span className="text-zinc-900">
                            {new Date(article.updated_at).toLocaleDateString()}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            TAGS
                          </span>
                          {article.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="rounded-full bg-zinc-100 px-3 py-0.5 text-xs font-bold text-zinc-800 hover:bg-zinc-200"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <ChevronDown className="chevron h-5 w-5 text-zinc-600 transition-transform duration-200" />
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="pt-4 text-sm leading-relaxed text-zinc-600 border-t border-zinc-100 mt-4">
                    <p className="mb-4 whitespace-pre-line">{article.content}</p>

                    {/* Voting & Actions Toolbar */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={(e) => handleVote(article.id, "up", e)}
                          className="flex items-center gap-1.5 text-zinc-600 hover:text-green-600 transition-colors text-xs font-medium"
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span>{article.upvotes}</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleVote(article.id, "down", e)}
                          className="flex items-center gap-1.5 text-zinc-600 hover:text-red-600 transition-colors text-xs font-medium"
                        >
                          <ThumbsDown className="h-4 w-4" />
                          <span>{article.downvotes}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleOpenEditModal(article, e)}
                          className="p-1.5 text-zinc-500 hover:text-zinc-900 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteArticle(article.id, e)}
                          className="p-1.5 text-zinc-500 hover:text-red-600 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
              <h2 className="text-lg font-bold text-zinc-900">
                {editingArticle ? "Edit Help Article" : "Create New Help Article"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Title
                </label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g. How to link Riot ID"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
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
                  className="w-full rounded-md border border-zinc-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Tags (comma separated)
                </label>
                <Input
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  placeholder="AI, INFO, ACCOUNT"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-zinc-900 text-white hover:bg-zinc-800"
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
