import Landing from "../landing/imports/Landing/Landing";

/**
 * The page is dark regardless of the device theme, so it carries `dark` itself:
 * the vendored Aceternity primitives are written against Tailwind's class-driven
 * `dark:` variant, which the app never sets globally.
 *
 * Beaufort for LOL is set once here and inherited by every section, so the whole
 * marketing page reads in the League display face; only the logo wordmark opts
 * back out to League Spartan.
 */
export default function LandingPage() {
  return (
    <div className="dark min-h-screen w-full bg-[#05060a] font-beaufort text-white">
      <Landing />
    </div>
  );
}
