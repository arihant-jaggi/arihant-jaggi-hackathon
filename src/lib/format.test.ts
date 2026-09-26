import { describe, it, expect } from "vitest";
import { formatEventDate, formatTimeRange, countdownTo, toLocalInput, fromLocalInput } from "./format";

// Sample times on the event date, America/New_York (EDT, UTC-4).
const EVENT_START = "2026-10-25T09:00:00-04:00";
const EVENT_END = "2026-10-25T17:30:00-04:00";

describe("formatEventDate", () => {
  it("renders the Miami weekday/date regardless of host TZ", () => {
    expect(formatEventDate(EVENT_START)).toBe("Sunday, October 25, 2026");
  });

  it("returns TBA for a missing date", () => {
    expect(formatEventDate(null)).toBe("TBA");
    expect(formatEventDate(undefined)).toBe("TBA");
  });
});

describe("formatTimeRange", () => {
  it("renders the Miami start/end time regardless of host TZ", () => {
    expect(formatTimeRange(EVENT_START, EVENT_END)).toBe("9:00 AM to 5:30 PM");
  });

  it("returns TBA with no start", () => {
    expect(formatTimeRange(null, EVENT_END)).toBe("TBA");
  });

  it("renders just the start time with no end", () => {
    expect(formatTimeRange(EVENT_START, null)).toBe("9:00 AM");
  });
});

describe("countdownTo", () => {
  it("computes days/hours/minutes/seconds remaining", () => {
    const now = new Date("2026-10-20T09:00:00-04:00");
    const target = "2026-10-25T09:00:00-04:00"; // exactly 5 days later
    const c = countdownTo(target, now);
    expect(c).toEqual({ days: 5, hours: 0, minutes: 0, seconds: 0, done: false });
  });

  it("splits a partial duration into the right units", () => {
    const now = new Date("2026-10-25T00:00:00-04:00");
    // 1 day, 2 hours, 3 minutes, 4 seconds later
    const target = "2026-10-26T02:03:04-04:00";
    const c = countdownTo(target, now);
    expect(c).toEqual({ days: 1, hours: 2, minutes: 3, seconds: 4, done: false });
  });

  it("clamps past dates to zero and marks done", () => {
    const now = new Date("2026-10-26T00:00:00-04:00");
    const target = "2026-10-25T09:00:00-04:00"; // in the past
    const c = countdownTo(target, now);
    expect(c).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0, done: true });
  });

  it("treats a missing date as already done", () => {
    const c = countdownTo(null);
    expect(c.done).toBe(true);
    expect(c.days).toBe(0);
  });
});

describe("toLocalInput / fromLocalInput round-trip", () => {
  it("round-trips an EDT date (October) through fromLocalInput", () => {
    // 9:00 AM local Miami time in October is EDT (UTC-4) -> 13:00 UTC.
    expect(fromLocalInput("2026-10-25T09:00")).toBe("2026-10-25T13:00:00.000Z");
  });

  it("round-trips an EST date (December) through fromLocalInput", () => {
    // 9:00 AM local Miami time in December is EST (UTC-5) -> 14:00 UTC.
    expect(fromLocalInput("2026-12-25T09:00")).toBe("2026-12-25T14:00:00.000Z");
  });

  it("toLocalInput inverts fromLocalInput for an EDT instant", () => {
    const iso = fromLocalInput("2026-10-25T09:00")!;
    expect(toLocalInput(iso)).toBe("2026-10-25T09:00");
  });

  it("toLocalInput inverts fromLocalInput for an EST instant", () => {
    const iso = fromLocalInput("2026-12-25T09:00")!;
    expect(toLocalInput(iso)).toBe("2026-12-25T09:00");
  });

  it("returns null/empty string for empty input", () => {
    expect(fromLocalInput("")).toBeNull();
    expect(toLocalInput(null)).toBe("");
    expect(toLocalInput(undefined)).toBe("");
  });
});
