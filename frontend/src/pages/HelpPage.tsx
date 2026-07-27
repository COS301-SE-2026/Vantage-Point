import { useState } from "react";
import { useOutletContext } from "react-router";
import { Filter, ArrowUpDown, Search, ChevronDown } from "lucide-react";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
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

interface HelpArticle {
  id: string;
  title: string;
  lastUpdated: string;
  tags: string[];
  content: string;
}

const helpArticles: HelpArticle[] = [
  {
    id: "item-1",
    title: "The feedback I received was unhelpful",
    lastUpdated: "2026/05/05",
    tags: ["AI", "INFO"],
    content:
      "If you receive unhelpful AI feedback, you can flag the analysis from your match summary view or contact support to help improve model accuracy.",
  },
  {
    id: "item-2",
    title: "The feedback I received was unhelpful",
    lastUpdated: "2026/05/05",
    tags: ["AI", "INFO"],
    content:
      "If you receive unhelpful AI feedback, you can flag the analysis from your match summary view or contact support to help improve model accuracy.",
  },
  {
    id: "item-3",
    title: "The feedback I received was unhelpful",
    lastUpdated: "2026/05/05",
    tags: ["AI", "INFO"],
    content:
      "If you receive unhelpful AI feedback, you can flag the analysis from your match summary view or contact support to help improve model accuracy.",
  },
  {
    id: "item-4",
    title: "The feedback I received was unhelpful",
    lastUpdated: "2026/05/05",
    tags: ["AI", "INFO"],
    content:
      "If you receive unhelpful AI feedback, you can flag the analysis from your match summary view or contact support to help improve model accuracy.",
  },
  {
    id: "item-5",
    title: "The feedback I received was unhelpful",
    lastUpdated: "2026/05/05",
    tags: ["AI", "INFO"],
    content:
      "If you receive unhelpful AI feedback, you can flag the analysis from your match summary view or contact support to help improve model accuracy.",
  },
];

export default function HelpPage() {
  const outlet = useOutletContext<DashboardOutletContext | undefined>();
  const isInsideDashboard = Boolean(outlet);
  const sidebarOpen = outlet?.sidebarOpen ?? true;
  const contentStyle = isInsideDashboard ? getDashboardContentStyle(sidebarOpen) : {};

  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = helpArticles.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={
        isInsideDashboard
          ? "absolute top-[var(--vp-dashboard-header)] min-w-0 transition-[left,width] duration-300 ease-out bg-white"
          : "min-h-screen w-full bg-white py-6"
      }
      style={isInsideDashboard ? { ...contentStyle, height: DASHBOARD_CONTENT_HEIGHT } : {}}
      data-name="help-page"
    >
      <div className="h-full overflow-y-auto px-8 py-6">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          {/* Controls Header: Filter, Sort, Search */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              className="p-2 text-zinc-600 hover:text-zinc-900 transition-colors"
              aria-label="Filter"
            >
              <Filter className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="p-2 text-zinc-600 hover:text-zinc-900 transition-colors"
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

          {/* Accordion Articles List */}
          <Accordion type="single" collapsible className="flex flex-col gap-4">
            {filteredArticles.map((article, index) => (
              <AccordionItem
                key={`${article.id}-${index}`}
                value={`${article.id}-${index}`}
                className="rounded-2xl border border-zinc-200 bg-white px-6 py-4 shadow-sm transition-all hover:border-zinc-300 [&[data-state=open]]:shadow-md"
              >
                <AccordionTrigger className="p-0 hover:no-underline [&[data-state=open]>div>div>.chevron]:rotate-180">
                  <div className="flex w-full flex-col gap-4 text-left">
                    {/* Top Row: Title & Last Updated */}
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-base font-semibold text-zinc-900">
                        {article.title}
                      </h3>
                      <span className="text-xs font-semibold text-zinc-500 whitespace-nowrap">
                        Last Updated: <span className="text-zinc-900">{article.lastUpdated}</span>
                      </span>
                    </div>

                    {/* Bottom Row: Tags & Chevron Icon */}
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
                  {article.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
