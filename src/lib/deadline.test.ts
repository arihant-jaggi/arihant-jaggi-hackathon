import { buildProgress, FALLBACK_PITCH_START, isEventDay, pitchDeadline } from "./deadline";
import { DEFAULT_EVENT, DEFAULT_SCHEDULE } from "./defaults";

describe("pitch timer", () => {
  it("counts down to the Pitch Presentations block at 3:30 PM", () => {
    expect(new Date(pitchDeadline(DEFAULT_SCHEDULE)).getTime()).toBe(new Date("2026-10-25T19:30:00Z").getTime());
    expect(pitchDeadline([])).toBe(FALLBACK_PITCH_START);
    expect(pitchDeadline(undefined)).toBe(FALLBACK_PITCH_START);
  });

  it("follows an operator's edit to the pitch block", () => {
    const moved = DEFAULT_SCHEDULE.map((s) => (s.title === "Pitch Presentations" ? { ...s, starts_at: "2026-10-25T15:45:00-04:00" } : s));
    expect(pitchDeadline(moved)).toBe("2026-10-25T15:45:00-04:00");
  });

  it("tracks build time from the start to the deadline", () => {
    const start = "2026-10-25T09:00:00-04:00";
    expect(buildProgress(start, FALLBACK_PITCH_START, new Date("2026-10-25T08:00:00-04:00"))).toBe(0);
    expect(buildProgress(start, FALLBACK_PITCH_START, new Date("2026-10-25T12:15:00-04:00"))).toBeCloseTo(0.5);
    expect(buildProgress(start, FALLBACK_PITCH_START, new Date("2026-10-25T16:00:00-04:00"))).toBe(1);
  });

  it("only shows on event day", () => {
    const { starts_at, ends_at } = DEFAULT_EVENT;
    expect(isEventDay(starts_at, ends_at, new Date("2026-10-25T10:00:00-04:00"))).toBe(true);
    expect(isEventDay(starts_at, ends_at, new Date("2026-10-24T10:00:00-04:00"))).toBe(false);
    expect(isEventDay(starts_at, ends_at, new Date("2026-10-25T18:00:00-04:00"))).toBe(false);
  });
});
