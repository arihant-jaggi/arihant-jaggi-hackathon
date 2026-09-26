import { useEffect, useState } from "react";
import { countdownTo } from "@/lib/format";

const pad = (n: number) => String(n).padStart(2, "0");

/** Mono "T-minus" terminal readout, ticking every second. */
export const Countdown = ({ target, className }: { target: string | null | undefined; className?: string }) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!target) return null;
  const c = countdownTo(target, now);

  return (
    <div className={className} role="timer" aria-live="off">
      <p className="font-mono text-[11px] uppercase tracking-kicker text-dim">
        {c.done ? "Doors are open" : "T-minus"}
      </p>
      {!c.done && (
        <p className="mt-1.5 font-mono text-2xl font-medium tabular-nums text-ink sm:text-3xl" aria-label={`${c.days} days, ${c.hours} hours, ${c.minutes} minutes, ${c.seconds} seconds`}>
          {c.days}
          <span className="text-faint">d</span> {pad(c.hours)}
          <span className="text-faint">h</span> {pad(c.minutes)}
          <span className="text-faint">m</span> {pad(c.seconds)}
          <span className="text-faint">s</span>
          <span className="ml-1 text-signal animate-blink">_</span>
        </p>
      )}
    </div>
  );
};
