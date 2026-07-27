import { useNavigate, useOutletContext } from "react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  DASHBOARD_CONTENT_HEIGHT,
  getDashboardContentStyle,
} from "../lib/dashboardLayout";
import type { DashboardOutletContext } from "../context/dashboardLayoutContext";

const quickLinks = [
  {
    title: "Matches",
    description: "Review recent matches, filters, and match detail views.",
    action: "Open matches",
    path: "/dashboard/matches",
  },
  {
    title: "Profile",
    description: "Update your Riot-linked profile and dashboard identity.",
    action: "Edit profile",
    path: "/dashboard/profile",
  },
  {
    title: "Support",
    description: "Send a message if something looks broken or unclear.",
    action: "Email support",
    path: "mailto:support@vantagepoint.app",
    external: true,
  },
] as const;

const faqs = [
  {
    question: "Where do I change my Riot profile?",
    answer:
      "Go to Profile from the dashboard. The profile editor updates your linked account, avatar, and public profile data.",
  },
  {
    question: "Why are my matches not loading?",
    answer:
      "Check that your Riot account is linked and that the dashboard finished syncing. If the issue persists, refresh the page and try again.",
  },
  {
    question: "Can I return to the old match view?",
    answer:
      "Yes. Use the dashboard matches page for the list view and the match detail page for a single match breakdown.",
  },
  {
    question: "Who do I contact for support?",
    answer:
      "Use the email support button below. Include the page you were on and the action that failed.",
  },
] as const;

const helpTopics = [
  {
    label: "Getting started",
    title: "Link your Riot account",
    description:
      "Make sure your Riot ID is connected before you expect match data or profile details to appear.",
  },
  {
    label: "Navigation",
    title: "Move between views",
    description:
      "Matches and profile stay inside the same dashboard shell, so context remains consistent while you browse.",
  },
  {
    label: "Troubleshooting",
    title: "Fix stale data",
    description:
      "If values look outdated, refresh the profile and reload the page before reporting the issue.",
  },
] as const;

export default function HelpPage() {
  const navigate = useNavigate();
  const outlet = useOutletContext<DashboardOutletContext | undefined>();
  const sidebarOpen = outlet?.sidebarOpen ?? true;
  const contentStyle = getDashboardContentStyle(sidebarOpen);

  const openLink = (path: string) => {
    if (path.startsWith("mailto:")) {
      window.location.href = path;
      return;
    }
    navigate(path);
  };

  return (
    <div
      className="absolute top-[var(--vp-dashboard-header)] min-w-0 transition-[left,width] duration-300 ease-out"
      style={{ ...contentStyle, height: DASHBOARD_CONTENT_HEIGHT }}
      data-name="help-page"
    >
      <div className="h-full overflow-auto px-10 py-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary">Help center</Badge>
              <Badge variant="outline">Dashboard</Badge>
            </div>

            <div className="space-y-2">
              <h1 className="font-['Inter:Semi_Bold',sans-serif] text-3xl font-semibold text-[#1e1e1e]">
                Need help with Vantage Point?
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-[#525252]">
                Find quick answers, jump back to the dashboard, or contact support
                without leaving the app layout.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
              <Input aria-label="Search help topics" placeholder="Search help topics" />
              <Button type="button" onClick={() => navigate("/dashboard/matches")}>
                View matches
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard/profile")}
              >
                Edit profile
              </Button>
            </div>
          </header>

          <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Quick actions</CardTitle>
                <CardDescription>
                  Common places to go when you need to check something quickly.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {quickLinks.map((link) => (
                  <div
                    key={link.title}
                    className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4"
                  >
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-[#1e1e1e]">
                        {link.title}
                      </h3>
                      <p className="text-sm leading-6 text-[#525252]">
                        {link.description}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant={link.external ? "outline" : "default"}
                      onClick={() => openLink(link.path)}
                      className="w-fit"
                    >
                      {link.action}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">FAQs</CardTitle>
                <CardDescription>
                  Answers to the most common dashboard questions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq) => (
                    <AccordionItem key={faq.question} value={faq.question}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent className="text-sm leading-6 text-[#525252]">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {helpTopics.map((topic) => (
              <Card key={topic.title}>
                <CardHeader>
                  <Badge variant="secondary" className="w-fit">
                    {topic.label}
                  </Badge>
                  <CardTitle className="text-lg">{topic.title}</CardTitle>
                  <CardDescription>{topic.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </section>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Contact support</CardTitle>
              <CardDescription>
                If the built-in help does not solve it, send a support message with
                the page name and what failed.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={() =>
                  (window.location.href = "mailto:support@vantagepoint.app")
                }
              >
                Email support
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard/matches")}
              >
                Back to matches
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/dashboard/profile")}
              >
                Open profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}