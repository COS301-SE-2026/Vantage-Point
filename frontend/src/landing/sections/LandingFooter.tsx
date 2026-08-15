import { Github } from "lucide-react";
import imgLogoMark from "../../assets/images/logos/logo-mark-white.webp";

const COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Dashboard tour", href: "#showcase" },
      { label: "How it works", href: "#workflow" },
      { label: "The difference", href: "#positioning" },
      { label: "Pipeline", href: "#pipeline" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Log in", href: "/login" },
      { label: "Create an account", href: "/register" },
      { label: "Link a Riot ID", href: "/register" },
    ],
  },
  {
    heading: "Project",
    links: [
      { label: "Team", href: "#team" },
      {
        label: "GitHub",
        href: "https://github.com/COS301-SE-2026/Vantage-Point",
      },
    ],
  },
];

export default function LandingFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#05060a] px-4 py-16 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <div className="flex items-center gap-2">
            <img src={imgLogoMark} alt="" aria-hidden className="h-9 w-9" />
            <span className="font-spartan text-lg font-semibold uppercase tracking-[0.02em] text-white">
              Vantage Point
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-500">
            Spatial intelligence for competitive gamers. Move past K/D and find
            the positioning that actually decides your matches.
          </p>
          <a
            href="https://github.com/COS301-SE-2026/Vantage-Point"
            className="mt-6 inline-flex items-center gap-2 text-sm text-neutral-400 transition hover:text-white"
          >
            <Github className="h-4 w-4" />
            COS301-SE-2026/Vantage-Point
          </a>
        </div>

        {COLUMNS.map((column) => (
          <nav key={column.heading} aria-label={column.heading}>
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
              {column.heading}
            </h3>
            <ul className="mt-4 space-y-3">
              {column.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-neutral-400 transition hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="mx-auto mt-14 flex max-w-6xl flex-col gap-3 border-t border-white/10 pt-8 text-xs text-neutral-600 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} Team F.R.O.S.N · University of Pretoria
        </p>
        <p>
          Vantage Point is not endorsed by Riot Games and does not reflect the
          views of Riot Games or anyone officially involved in producing or
          managing League of Legends.
        </p>
      </div>
    </footer>
  );
}
