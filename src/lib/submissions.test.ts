import { latestPerTeam, validateSubmission } from "./submissions";
import type { SubmissionRow } from "./types";

const ok = { team_name: "Bay Bots", project_title: "TideWatch", description: "An agent that flags flood risk.", github_url: "https://github.com/x/y" };

describe("validateSubmission", () => {
  it("accepts a complete submission with one link", () => {
    expect(validateSubmission(ok, false)).toEqual({});
  });

  it("requires team name, title, description and at least one link", () => {
    const e = validateSubmission({ team_name: " ", project_title: "", description: "", github_url: "" }, false);
    expect(Object.keys(e).sort()).toEqual(["description", "links", "project_title", "team_name"]);
  });

  it("requires a track only once tracks are released", () => {
    expect(validateSubmission(ok, true).track_id).toBeDefined();
    expect(validateSubmission({ ...ok, track_id: "t1" }, true)).toEqual({});
  });

  it("rejects links that are not full http(s) URLs", () => {
    expect(validateSubmission({ ...ok, demo_url: "mysite.com" }, false).demo_url).toBeDefined();
    expect(validateSubmission({ ...ok, slides_url: "javascript:alert(1)" }, false).slides_url).toBeDefined();
  });
});

describe("latestPerTeam", () => {
  const row = (team: string, at: string, title = "p"): SubmissionRow => ({
    id: team + at, event_id: "e", team_name: team, project_title: title, description: "d", track_id: null, track_title: null,
    github_url: null, demo_url: null, slides_url: null, created_at: at,
  });

  it("keeps only the newest submission per team, ignoring case", () => {
    const out = latestPerTeam([row("Bay Bots", "2026-10-25T15:00:00Z", "old"), row("bay bots ", "2026-10-25T15:20:00Z", "new"), row("Other", "2026-10-25T15:10:00Z")]);
    expect(out).toHaveLength(2);
    expect(out.find((r) => r.team_name.trim().toLowerCase() === "bay bots")!.project_title).toBe("new");
  });
});

describe("submissionsToCsv", () => {
  it("quotes commas and neutralizes formulas", async () => {
    const { submissionsToCsv } = await import("./submissions");
    const csv = submissionsToCsv([
      { id: "1", event_id: "e", team_name: "=cmd", project_title: "A, B", description: 'say "hi"', track_id: null, track_title: "Civic", github_url: null, demo_url: null, slides_url: "https://s" , created_at: "t" },
    ]);
    expect(csv.split("\r\n")[1]).toBe(`t,'=cmd,"A, B",Civic,"say ""hi""",,,https://s`);
  });
});
