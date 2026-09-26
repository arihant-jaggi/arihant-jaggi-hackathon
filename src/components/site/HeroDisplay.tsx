import { Mark } from "@/components/Mark";
import { Led } from "@/components/ui";
import { formatShortDate } from "@/lib/format";
import type { EventRow } from "@/lib/types";

/**
 * Hero right column: the Impact Miami 2.0 mark on a glowing deck screen,
 * with the partners card (Big Red Education + Young Coders Initiative) under it.
 */
export const HeroDisplay = ({ event }: { event: EventRow }) => {
  const partner = event.partner_name ?? "Big Red Education";
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
        <div className="flex items-center gap-5">
          <div className="min-w-0 flex-1">
            <p className="kicker">In partnership with</p>
            <p className="mt-1.5 font-display text-2xl font-extrabold leading-tight tracking-[-0.02em] text-ink">{partner}</p>
          </div>
          <span className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white p-2 shadow-glow sm:h-28 sm:w-28">
            <img src="/bigred-logo.png" alt={partner} className="h-full w-full object-contain" />
          </span>
        </div>
        <div className="mt-5 flex items-center gap-4 border-t border-line pt-5">
          <img src="/yci-transparent.png" alt="Young Coders Initiative" className="h-14 w-auto object-contain" />
          <div>
            <p className="kicker">Presented by</p>
            <p className="mt-1 font-display text-lg font-bold text-ink">Young Coders Initiative</p>
          </div>
        </div>
      </div>
    </div>
  );
};
