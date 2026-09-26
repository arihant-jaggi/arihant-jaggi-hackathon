import { cn } from "@/lib/utils";

/** "In partnership with Big Red Education", laid out like the flyer header. */
export const PartnerBadge = ({ name, className }: { name: string | null; className?: string }) => (
  <div className={cn("flex items-center gap-4", className)}>
    <div className="text-right font-mono text-[11px] uppercase leading-relaxed tracking-[0.24em] text-dim">
      In partnership with
      <br />
      <span className="font-semibold text-ink">{name ?? "Big Red Education"}</span>
    </div>
    <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white p-1.5 sm:h-16 sm:w-16">
      <img src="/bigred.png" alt={name ?? "Big Red Education"} className="h-full w-full object-contain" />
    </span>
  </div>
);
