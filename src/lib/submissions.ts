import type { SubmissionRow, SubmitProjectInput } from "./types";

export const DESCRIPTION_MAX = 600;

const isHttpUrl = (v: string) => /^https?:\/\/\S+\.\S+/i.test(v.trim());

/** Mirrors submit_project()'s checks so teams see problems before sending. */
export const validateSubmission = (input: SubmitProjectInput, needsTrack: boolean): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (!input.team_name.trim()) errors.team_name = "Enter your team name.";
  if (!input.project_title.trim()) errors.project_title = "Give your project a title.";
  if (!input.description.trim()) errors.description = "Add a short description.";
  else if (input.description.length > DESCRIPTION_MAX) errors.description = `Keep it under ${DESCRIPTION_MAX} characters.`;
  if (needsTrack && !input.track_id) errors.track_id = "Pick your track.";
  const links = { github_url: input.github_url, demo_url: input.demo_url, slides_url: input.slides_url };
  const filled = Object.entries(links).filter(([, v]) => v && v.trim());
  if (filled.length === 0) errors.links = "Add at least one link: GitHub, live demo, or slides.";
  for (const [k, v] of filled) if (!isHttpUrl(v!)) errors[k] = "Use a full link starting with https://";
  return errors;
};

/** Newest submission per team name (case-insensitive): resubmissions replace earlier ones. */
export const latestPerTeam = (rows: SubmissionRow[]): SubmissionRow[] => {
  const byTeam = new Map<string, SubmissionRow>();
  for (const r of [...rows].sort((a, b) => b.created_at.localeCompare(a.created_at))) {
    const key = r.team_name.trim().toLowerCase();
    if (!byTeam.has(key)) byTeam.set(key, r);
  }
  return [...byTeam.values()];
};

const csvCell = (v: string | null | undefined) => {
  const s = v ?? "";
  // Leading = + - @ would run as a formula in Excel/Sheets.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export const submissionsToCsv = (rows: SubmissionRow[]): string =>
  [
    ["submitted_at", "team_name", "project_title", "track", "description", "github_url", "demo_url", "slides_url"].join(","),
    ...rows.map((r) =>
      [r.created_at, r.team_name, r.project_title, r.track_title, r.description, r.github_url, r.demo_url, r.slides_url].map(csvCell).join(","),
    ),
  ].join("\r\n");
