import { useState } from "react";
import { useNavigate } from "react-router";
import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  Navbar,
  NavBody,
  NavItems,
  NavbarButton,
} from "@/components/ui/aceternity/resizable-navbar";
import imgLogoMark from "../../assets/images/logos/logo-mark-white.webp";
import { NAV_LINKS } from "../content";

function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <a
      href="#top"
      className="relative z-20 flex shrink-0 items-center gap-2 px-2 py-1"
    >
      <img
        src={imgLogoMark}
        alt=""
        aria-hidden
        className="h-8 w-8 object-contain"
      />
      <span
        className={`font-spartan font-semibold uppercase tracking-[0.02em] text-white ${
          compact ? "text-base" : "text-xs xl:text-sm"
        }`}
      >
        Vantage&nbsp;Point
      </span>
    </a>
  );
}

/**
 * Aceternity's Resizable Navbar, pinned rather than sticky so it floats over
 * the full-bleed hero. It shrinks to a pill once the page scrolls past 100px.
 */
export default function LandingNav() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Navbar className="fixed top-2 z-50 sm:top-4">
      <NavBody className="border border-white/10 backdrop-blur-md">
        <Wordmark />
        {/* Upstream centres the links with `absolute inset-0`, which overlaps
            the wordmark and buttons once the bar shrinks to its pill. Putting
            them back in flow keeps the three groups apart at any width. */}
        <NavItems
          items={[...NAV_LINKS]}
          className="relative inset-auto whitespace-nowrap text-neutral-300"
        />
        <div className="relative z-20 flex items-center gap-2">
          <NavbarButton
            as="button"
            variant="secondary"
            onClick={() => navigate("/login")}
            className="whitespace-nowrap text-neutral-200 hover:text-white"
          >
            Log in
          </NavbarButton>
          <NavbarButton
            as="button"
            variant="gradient"
            onClick={() => navigate("/register")}
            className="whitespace-nowrap bg-gradient-to-b from-[#e0b46c] to-[#a9762f] text-black"
          >
            Start free
          </NavbarButton>
        </div>
      </NavBody>

      <MobileNav className="rounded-2xl">
        <MobileNavHeader className="px-4">
          <Wordmark compact />
          <MobileNavToggle
            isOpen={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          />
        </MobileNavHeader>
        <MobileNavMenu
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          className="border border-white/10 bg-neutral-950/95"
        >
          {NAV_LINKS.map((item) => (
            <a
              key={item.name}
              href={item.link}
              onClick={() => setMenuOpen(false)}
              className="w-full py-1 text-neutral-300"
            >
              {item.name}
            </a>
          ))}
          <div className="mt-2 flex w-full flex-col gap-2">
            <NavbarButton
              as="button"
              variant="secondary"
              onClick={() => navigate("/login")}
              className="w-full border border-white/15 text-neutral-200"
            >
              Log in
            </NavbarButton>
            <NavbarButton
              as="button"
              variant="gradient"
              onClick={() => navigate("/register")}
              className="w-full bg-gradient-to-b from-[#e0b46c] to-[#a9762f] text-black"
            >
              Start free
            </NavbarButton>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
