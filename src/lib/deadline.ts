import type { ScheduleItemRow } from "./types";

/** Pitches are due when presentations start. Used if the schedule has no pitch block. */
export const FALLBACK_PITCH_START = "2026-10-25T15:30:00-04:00";

/** Start of the "Pitch Presentations" block, so an operator's schedule edit moves the timer too. */
export const pitchDeadline = (schedule: ScheduleItemRow[] | undefined): string =>
  schedule?.find((s) => /pitch presentation/i.test(s.title))?.starts_at ?? FALLBACK_PITCH_START;

/** Share of build time used, 0 to 1, from the event start to the deadline. */
export const buildProgress = (startIso: string | null | undefined, deadlineIso: string, now: Date): number => {
  const end = new Date(deadlineIso).getTime();
  const start = startIso ? new Date(startIso).getTime() : end;
  if (end <= start) return now.getTime() >= end ? 1 : 0;
  return Math.min(1, Math.max(0, (now.getTime() - start) / (end - start)));
};

/** Show the timer on event day: from 6 hours before the start until the event ends. */
export const isEventDay = (startIso: string | null | undefined, endIso: string | null | undefined, now: Date): boolean => {
  if (!startIso) return false;
  const start = new Date(startIso).getTime() - 6 * 3600_000;
  const end = endIso ? new Date(endIso).getTime() : start + 18 * 3600_000;
  return now.getTime() >= start && now.getTime() <= end;
};
