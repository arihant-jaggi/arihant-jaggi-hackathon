import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

/** Wordmark: bracket glyph + "impact miami 2.0" in mono. */
export const Logo = ({ className }: { className?: string }) => (
  <Link to="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="Impact Miami 2.0 home">
    <span aria-hidden className="font-mono text-lg font-semibold text-signal transition-transform group-hover:-translate-x-0.5">&lt;</span>
    <span className="font-display text-[17px] font-extrabold tracking-[-0.02em] text-ink">
      Impact Miami <span className="text-signal">2.0</span>
    </span>
    <span aria-hidden className="font-mono text-lg font-semibold text-pulse transition-transform group-hover:translate-x-0.5">/&gt;</span>
  </Link>
);
