import { Mark } from "@/components/Mark";
import { Led } from "@/components/ui";
import { formatShortDate } from "@/lib/format";
import { PARTNERS } from "@/lib/partners";
import type { EventRow } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Hero right column: the Impact Miami 2.0 mark on a glowing deck screen,
 * with the partners card (Big Red Education, Founders Future, and Young
 * Coders Initiative as presenter) under it.
 */
export const HeroDisplay = ({ event }: { event: EventRow }) => {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 lg:ml-auto">
      {/* Logo screen */}
      <div className="signal-border brackets relative overflow-hidden rounded-3xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
          <span>impact_miami.v{event.edition ?? "2"}</span>
          <span className="inline-flex items-center gap-2">
            <Led pulse />
            {formatShortDate(event.starts_at, event.timezone)} · Miami
          </span>
        </div>
        <div className="grid-ground relative grid aspect-[4/3] place-items-center">
          <div aria-hidden className="absolute h-3/5 w-3/5 rounded-full bg-signal-diag opacity-20 blur-3xl" />
          <div aria-hidden className="absolute aspect-square h-[82%] animate-[spin_40s_linear_infinite] rounded-full border border-dashed border-signal/25" />
          <Mark className="relative h-36 drop-shadow-[0_0_24px_rgba(22,212,240,0.35)] sm:h-44" />
        </div>
      </div>

      {/* Partners */}
      <div className="rounded-3xl border border-line bg-deck p-5 sm:p-6">
        <p className="kicker">In partnership with</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {PARTNERS.map((p) => (
            <div
              key={p.name}
              className={cn(
                "relative flex flex-col items-center gap-3 rounded-2xl border p-4 text-center",
                p.isNew ? "signal-border shadow-glow" : "border-line bg-rail",
              )}
            >
              {p.isNew && (
                <span className="absolute -top-2.5 right-3 rounded-md bg-signal px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-void">
                  New partner
                </span>
              )}
              <span className={cn("grid h-20 w-20 place-items-center overflow-hidden rounded-2xl p-1.5 sm:h-24 sm:w-24", p.tile)}>
                <img src={p.logo} alt={p.name} className="h-full w-full object-contain" />
              </span>
              <span className="font-display text-base font-extrabold leading-tight tracking-[-0.01em] text-ink">{p.name}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-4 border-t border-line pt-5">
          <img src="/yci-transparent.png" alt="Young Coders Initiative" className="h-12 w-auto object-contain" />
          <div>
            <p className="kicker">Presented by</p>
            <p className="mt-1 font-display text-lg font-bold text-ink">Young Coders Initiative</p>
          </div>
        </div>
      </div>
    </div>
  );
};
