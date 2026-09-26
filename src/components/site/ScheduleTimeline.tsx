import { useEffect, useState } from "react";
import { Badge, Led } from "@/components/ui";
import { formatTime } from "@/lib/format";
import type { ScheduleItemRow } from "@/lib/types";
import { cn } from "@/lib/utils";

const minutesBetween = (a: string, b: string | null) => (b ? Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000) : null);

const durationLabel = (mins: number | null) => {
  if (!mins || mins <= 0) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return [h ? `${h}h` : "", m ? `${m}m` : ""].filter(Boolean).join(" ");
};

/**
 * Run of show as a vertical deck timeline: gradient rail, LED nodes, mono
 * start/end stamps, duration chips. On event day the current block is lit
 * as LIVE and finished blocks dim.
 */
export const ScheduleTimeline = ({ items, timezone }: { items: ScheduleItemRow[]; timezone: string }) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <ol className="relative mt-10">
      {/* Gradient rail */}
      <span aria-hidden className="absolute bottom-3 left-[7px] top-3 w-px bg-gradient-to-b from-signal via-pulse to-transparent sm:left-[183px]" />
      {items.map((item) => {
        const start = new Date(item.starts_at).getTime();
        const end = item.ends_at ? new Date(item.ends_at).getTime() : start;
        const live = now >= start && now < end;
        const done = now >= end && end > start;
        const duration = durationLabel(minutesBetween(item.starts_at, item.ends_at));
        return (
          <li key={item.id} className={cn("relative grid gap-3 pb-10 pl-8 last:pb-0 sm:grid-cols-[160px_1fr] sm:gap-12 sm:pl-0", done && "opacity-50")}>
            {/* Node */}
            <span
              aria-hidden
              className={cn(
                "absolute left-0 top-1.5 grid h-[15px] w-[15px] place-items-center rounded-full border bg-void sm:left-[176px]",
                live ? "border-signal shadow-glow" : "border-signal/60",
              )}
            >
              <span className={cn("h-[5px] w-[5px] rounded-full", live ? "bg-signal" : "bg-pulse/70")} />
            </span>

            {/* Time stamp */}
            <div className="font-mono text-sm tabular-nums sm:text-right">
              <span className="text-signal">{formatTime(item.starts_at, timezone)}</span>
              {item.ends_at && (
                <span className="text-dim">
                  <span className="text-faint"> → </span>
                  <span className="sm:block">{formatTime(item.ends_at, timezone)}</span>
                </span>
              )}
            </div>

            {/* Block */}
            <div className={cn("rounded-2xl border bg-deck p-5 transition-colors sm:p-6", live ? "signal-border" : "border-line hover:border-line-strong")}>
              <div className="flex flex-wrap items-center gap-2">
                {live && (
                  <Badge tone="signal">
                    <Led pulse className="h-1.5 w-1.5" /> Live
                  </Badge>
                )}
                {duration && <Badge>{duration}</Badge>}
              </div>
              <h3 className="mt-3 font-display text-lg font-bold leading-snug text-ink sm:text-xl">{item.title}</h3>
              {item.description && <p className="mt-2 text-[15px] text-dim">{item.description}</p>}
              {item.location && <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-faint">{item.location}</p>}
              {item.highlight && <p className="mt-3 border-t border-line pt-3 text-sm italic text-dim">{item.highlight}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
};
