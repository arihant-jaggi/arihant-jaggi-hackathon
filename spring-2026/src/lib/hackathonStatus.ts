export type EventWindowStatus = "missing" | "upcoming" | "open" | "closed";

export const parseDateField = (value?: string | null) => (value ? new Date(value) : null);

export const getWindowStatus = (
  start: Date | null,
  end: Date | null,
  now = new Date(),
): { status: EventWindowStatus; start: Date | null; end: Date | null } => {
  if (!start || !end) {
    return { status: "missing", start, end };
  }
  if (now < start) {
    return { status: "upcoming", start, end };
  }
  const normalizeDateOnly = (value: Date) => {
    const isDateOnly =
      value.getUTCHours() === 0 &&
      value.getUTCMinutes() === 0 &&
      value.getUTCSeconds() === 0 &&
      value.getUTCMilliseconds() === 0;
    if (!isDateOnly) {
      return value;
    }
    const inclusive = new Date(value.getTime() + 24 * 60 * 60 * 1000 - 1);
    return inclusive;
  };

  const inclusiveEnd = normalizeDateOnly(end);
  if (now > inclusiveEnd) {
    return { status: "closed", start, end };
  }
  return { status: "open", start, end };
};

export const formatCountdown = (target: Date, now = new Date()) => {
  const diff = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const parts = [];
  if (days) parts.push(`${days} day${days > 1 ? "s" : ""}`);
  if (hours) parts.push(`${hours}h`);
  if (minutes || parts.length === 0) parts.push(`${minutes}m`);
  return parts.join(" ");
};

export const formatFriendlyDate = (date: Date | null) => {
  if (!date) return "—";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};
