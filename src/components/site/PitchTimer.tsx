import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Maximize2 } from "lucide-react";
import { Led } from "@/components/ui";
import { buildProgress } from "@/lib/deadline";
import { countdownTo, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");

export const useNow = (everyMs = 1000) => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), everyMs);
    return () => window.clearInterval(id);
  }, [everyMs]);
  return now;
};

const deadlineLabel = (iso: string, tz?: string | null) =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: tz ?? "America/New_York" });

/**
 * Countdown to when pitches are due and presentations start. "banner" sits on
 * the homepage; "full" fills the screen for the projector at /timer.
 */
export const PitchTimer = ({
  deadline,
  startsAt,
  timezone,
  variant = "banner",
}: {
  deadline: string;
  startsAt: string | null | undefined;
  timezone?: string | null;
  variant?: "banner" | "full";
}) => {
  const now = useNow();
  const c = countdownTo(deadline, now);
  const left = new Date(deadline).getTime() - now.getTime();
  const urgent = !c.done && left <= 5 * 60_000;
  const soon = !c.done && left <= 15 * 60_000;
  const progress = buildProgress(startsAt, deadline, now);
  const hours = c.days * 24 + c.hours;
  const at = deadlineLabel(deadline, timezone);
  const full = variant === "full";

  const status = c.done
    ? "Pencils down. Pitches are underway."
    : urgent
      ? "Final minutes. Submit your project now."
      : soon
        ? "Wrap it up and submit your project."
        : "Keep building. Submit before the clock hits zero.";

  return (
    <div className={cn("relative overflow-hidden rounded-2xl border bg-deck", soon ? "border-warn/50" : "border-line signal-border", full ? "p-8 sm:p-14" : "p-6 sm:p-8")} role="timer" aria-live="off">
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-pulse/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-signal/10 blur-3xl" />

      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Led tone={c.done ? "signal" : soon ? "warn" : "signal"} pulse />
          <p className={cn("font-mono uppercase tracking-kicker text-ink", full ? "text-sm sm:text-base" : "text-[11px] sm:text-xs")}>
            {c.done ? "Presentations are live" : `Pitches due · ${at}`}
          </p>
        </div>
        {!full && (
          <Link to="/timer" className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-dim transition-colors hover:text-signal">
            <Maximize2 className="h-3.5 w-3.5" /> Full screen
          </Link>
        )}
      </div>

      <div
        className={cn("relative mt-6 flex items-start font-mono font-medium tabular-nums leading-none tracking-[-0.04em]", full ? "mt-10 text-[17vw] lg:text-[15vw]" : "text-[17vw] sm:text-7xl lg:text-8xl")}
        aria-label={c.done ? "Time is up" : `${hours} hours, ${c.minutes} minutes, ${c.seconds} seconds left`}
      >
        {[
          [pad(hours), "Hours"],
          [pad(c.minutes), "Minutes"],
          [pad(c.seconds), "Seconds"],
        ].map(([value, label], i) => (
          <div key={label} className="flex items-start">
            {i > 0 && <span className={cn("px-[0.04em] opacity-40", urgent ? "text-alert" : soon ? "text-warn" : i === 1 ? "text-signal" : "text-pulse")}>:</span>}
            <div>
              <span className={cn("block bg-clip-text text-transparent", urgent ? "bg-gradient-to-r from-alert to-warn" : soon ? "bg-gradient-to-r from-warn to-signal" : "bg-signal")}>{value}</span>
              <span className={cn("mt-1 block font-mono font-normal uppercase tracking-[0.2em] text-faint", full ? "text-sm sm:text-lg" : "text-[10px] sm:text-[11px]")}>{label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={cn("relative", full ? "mt-12" : "mt-7")}>
        <div className="h-1.5 overflow-hidden rounded-full bg-rail">
          <div className={cn("h-full rounded-full transition-[width] duration-1000", soon ? "bg-gradient-to-r from-warn to-alert" : "bg-signal")} style={{ width: `${progress * 100}%` }} />
        </div>
        <div className={cn("mt-3 flex flex-wrap items-center justify-between gap-2", full ? "text-lg sm:text-2xl" : "text-sm")}>
          <p className={cn(urgent ? "text-alert" : soon ? "text-warn" : "text-dim")}>{status}</p>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
            {Math.round(progress * 100)}% of build time used
          </p>
        </div>
      </div>

      {!c.done && (
        <div className={cn("relative mt-6 flex flex-wrap gap-3", full && "mt-10")}>
          <Link to="/submit" className={cn("inline-flex items-center rounded-xl bg-signal font-mono font-medium uppercase tracking-[0.16em] text-void transition-opacity hover:opacity-90", full ? "h-14 px-8 text-sm" : "h-11 px-5 text-[12px]")}>
            Submit your project
          </Link>
        </div>
      )}
      <span className="sr-only">Deadline {formatDateTime(deadline)}</span>
    </div>
  );
};
