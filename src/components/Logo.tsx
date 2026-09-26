import { Link } from "react-router-dom";
import { Mark } from "@/components/Mark";
import { cn } from "@/lib/utils";

/** Nav lockup: shield mark + "Impact Miami 2.0". */
export const Logo = ({ className }: { className?: string }) => (
  <Link to="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="Impact Miami 2.0 home">
    <Mark title="" className="h-8 transition-transform duration-300 group-hover:-rotate-6" />
    <span className="font-display text-[17px] font-extrabold tracking-[-0.02em] text-ink">
      Impact Miami <span className="text-signal">2.0</span>
    </span>
  </Link>
);
