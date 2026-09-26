// All event times render in the event's own timezone (Miami), regardless of
// where the visitor or operator is.
const TZ = "America/New_York";

export const formatEventDate = (iso: string | null | undefined, tz = TZ) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: tz })
    : "TBA";

export const formatShortDate = (iso: string | null | undefined, tz = TZ) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: tz }) : "TBA";

export const formatTime = (iso: string | null | undefined, tz = TZ) =>
  iso ? new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: tz }) : "";

export const formatTimeRange = (start: string | null | undefined, end: string | null | undefined, tz = TZ) => {
  if (!start) return "TBA";
  return end ? `${formatTime(start, tz)} to ${formatTime(end, tz)}` : formatTime(start, tz);
};

export const formatDateTime = (iso: string | null | undefined, tz = TZ) =>
  iso
    ? new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: tz })
    : "—";

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

export const countdownTo = (iso: string | null | undefined, now = new Date()): Countdown => {
  const diff = iso ? Math.max(0, new Date(iso).getTime() - now.getTime()) : 0;
  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    done: diff === 0,
  };
};

/** "datetime-local" input value (in the event timezone) ⇄ ISO string. */
export const toLocalInput = (iso: string | null | undefined, tz = TZ) => {
  if (!iso) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
};

export const fromLocalInput = (value: string, tz = TZ): string | null => {
  if (!value) return null;
  // Treat the wall-clock value as event-timezone time and find the UTC instant.
  const asUtc = new Date(`${value}:00Z`);
  const offsetMs = asUtc.getTime() - new Date(toLocalInput(asUtc.toISOString(), tz) + ":00Z").getTime();
  return new Date(asUtc.getTime() + offsetMs).toISOString();
};

export const registrationLabel: Record<string, string> = {
  coming_soon: "Coming soon",
  open: "Open",
  waitlist: "Waitlist",
  closed: "Closed",
};
