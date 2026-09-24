import { ArrowRight } from "lucide-react";

/**
 * Slim notice pinned above the Navbar telling visitors they're looking at the
 * archived Spring 2026 site, with a link to the current event.
 *
 * Renders in normal document flow (not fixed) so the fixed Navbar below it
 * never gets covered — App.tsx just needs to render this before <Navbar />.
 */
const ArchiveBanner = () => {
  return (
    // Fixed height (h-9 = 36px) so Navbar (offset via `top-9`) and PageWrapper
    // (offset via the extra 36px baked into its top padding) can rely on a
    // constant value. Text stays on one line (no wrap) to guarantee that height.
    <div
      role="region"
      aria-label="Archive notice"
      className="fixed top-0 left-0 right-0 z-[60] h-9 w-full overflow-hidden border-b bg-primary text-primary-foreground"
    >
      <div className="container flex h-full items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap px-4 text-center text-[11px] sm:text-sm font-light tracking-wide">
        <span className="truncate">You&apos;re viewing the Spring 2026 hackathon archive.</span>
        <a
          href="https://youngcodersimpact.com"
          className="inline-flex shrink-0 items-center gap-1 font-medium underline underline-offset-2 hover:opacity-90"
        >
          Impact Miami 2.0 is Oct 25, 2026
          <ArrowRight size={12} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
};

export default ArchiveBanner;
