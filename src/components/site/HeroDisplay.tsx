import { Mark } from "@/components/Mark";
import { Led } from "@/components/ui";
import { formatShortDate } from "@/lib/format";
import type { EventRow } from "@/lib/types";

/**
 * The hero's right-hand "deck display": the Impact Miami 2.0 mark on a
 * glowing grid screen, framed with mono status readouts.
 */
export const HeroDisplay = ({ event }: { event: EventRow }) => (
  <div className="signal-border brackets relative overflow-hidden rounded-3xl">
    <div className="flex items-center justify-between border-b border-line px-5 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
      <span>impact_miami.v{event.edition ?? "2"}</span>
      <span className="inline-flex items-center gap-2">
        <Led pulse />
        online
      </span>
    </div>

    <div className="grid-ground relative grid aspect-square place-items-center sm:aspect-[5/4]">
      {/* Soft gradient glow behind the mark */}
      <div aria-hidden className="absolute h-2/3 w-2/3 rounded-full bg-signal-diag opacity-20 blur-3xl" />
      {/* Slow orbit ring */}
      <div aria-hidden className="absolute h-[72%] w-[72%] animate-[spin_40s_linear_infinite] rounded-full border border-dashed border-signal/25" />
      <div aria-hidden className="absolute h-[88%] w-[88%] rounded-full border border-line" />
      <Mark className="relative h-44 drop-shadow-[0_0_28px_rgba(22,212,240,0.35)] sm:h-56" />
    </div>

    <div className="grid grid-cols-3 divide-x divide-line border-t border-line font-mono text-[10px] uppercase tracking-[0.16em] text-dim">
      <span className="px-4 py-3">25.83°N 80.19°W</span>
      <span className="px-4 py-3 text-center">{formatShortDate(event.starts_at, event.timezone)} · 2026</span>
      <span className="px-4 py-3 text-right">Miami, FL</span>
    </div>
  </div>
);
