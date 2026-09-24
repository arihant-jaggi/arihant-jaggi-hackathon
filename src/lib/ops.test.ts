import { describe, expect, it } from "vitest";
import { filterTeams, teamStats, teamsToCsv } from "./ops";
import type { TeamWithMembers } from "./types";

const team = (overrides: Partial<TeamWithMembers>): TeamWithMembers => ({
  id: "t1",
  event_id: "e1",
  code: "ABC123",
  name: "Team Rocket",
  status: "pending",
  track_id: null,
  school: "Cushman",
  project_idea: null,
  experience_level: null,
  table_number: null,
  notes: null,
  checked_in_at: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  team_members: [],
  ...overrides,
});

const member = (overrides: Partial<TeamWithMembers["team_members"][number]>) => ({
  id: "m1",
  team_id: "t1",
  event_id: "e1",
  full_name: "Ada Lovelace",
  email: "ada@example.com",
  phone: null,
  grade: null,
  school: null,
  is_captain: true,
  tshirt_size: null,
  dietary_notes: null,
  guardian_name: null,
  guardian_email: null,
  guardian_phone: null,
  checked_in_at: null,
  created_at: "2026-01-01T00:00:00Z",
  ...overrides,
});

describe("teamsToCsv", () => {
  it("emits one row per member with team columns, header first", () => {
    const teams = [
      team({
        id: "t1",
        team_members: [member({ id: "m1", full_name: "Ada Lovelace", email: "ada@example.com" }), member({ id: "m2", full_name: "Bo Diaz", email: "bo@example.com", is_captain: false })],
      }),
    ];
    const csv = teamsToCsv(teams);
    const lines = csv.split("\r\n");
    expect(lines[0]).toContain("team_code");
    expect(lines).toHaveLength(3); // header + 2 members
    expect(lines[1]).toContain("Ada Lovelace");
    expect(lines[2]).toContain("Bo Diaz");
  });

  it("emits a single row for a team with no members", () => {
    const csv = teamsToCsv([team({ team_members: [] })]);
    expect(csv.split("\r\n")).toHaveLength(2);
  });

  it("quotes cells containing commas, quotes, or newlines (RFC4180)", () => {
    const csv = teamsToCsv([team({ name: 'Team, "The Best"\nEver' })]);
    expect(csv).toContain('"Team, ""The Best""\nEver"');
  });

  it("prefixes formula-injection-prone cells with a single quote", () => {
    const csv = teamsToCsv([
      team({
        name: "=cmd|'/c calc'!A1",
        team_members: [member({ full_name: "+SUM(1,1)", email: "-2+3", phone: "@evil" })],
      }),
    ]);
    expect(csv).toContain("'=cmd");
    expect(csv).toContain("'+SUM(1,1)");
    expect(csv).toContain("'-2+3");
    expect(csv).toContain("'@evil");
  });
});

describe("filterTeams", () => {
  const teams = [
    team({
      id: "t1",
      name: "Team Alpha",
      code: "ALPHA1",
      status: "approved",
      track_id: "track-a",
      checked_in_at: "2026-01-01T00:00:00Z",
      team_members: [member({ full_name: "Ada Lovelace", email: "ada@example.com" })],
    }),
    team({
      id: "t2",
      name: "Team Beta",
      code: "BETA22",
      status: "pending",
      track_id: "track-b",
      checked_in_at: null,
      school: "Miami High",
      team_members: [member({ id: "m3", full_name: "Grace Hopper", email: "grace@example.com" })],
    }),
  ];

  it("filters by status", () => {
    expect(filterTeams(teams, { status: "approved" })).toHaveLength(1);
  });

  it("filters by track", () => {
    expect(filterTeams(teams, { track: "track-b" }).map((t) => t.id)).toEqual(["t2"]);
  });

  it("filters by checked-in state", () => {
    expect(filterTeams(teams, { checkedIn: "yes" }).map((t) => t.id)).toEqual(["t1"]);
    expect(filterTeams(teams, { checkedIn: "no" }).map((t) => t.id)).toEqual(["t2"]);
  });

  it("searches by team name, code, school, member name and email", () => {
    expect(filterTeams(teams, { q: "beta" }).map((t) => t.id)).toEqual(["t2"]);
    expect(filterTeams(teams, { q: "miami high" }).map((t) => t.id)).toEqual(["t2"]);
    expect(filterTeams(teams, { q: "grace hopper" }).map((t) => t.id)).toEqual(["t2"]);
    expect(filterTeams(teams, { q: "ada@example.com" }).map((t) => t.id)).toEqual(["t1"]);
  });

  it("combines filters", () => {
    expect(filterTeams(teams, { status: "pending", q: "beta" }).map((t) => t.id)).toEqual(["t2"]);
    expect(filterTeams(teams, { status: "approved", q: "beta" })).toHaveLength(0);
  });
});

describe("teamStats", () => {
  it("counts teams per status, hackers and checked-in hackers", () => {
    const teams = [
      team({ id: "t1", status: "pending", team_members: [member({ id: "m1" }), member({ id: "m2", checked_in_at: "2026-01-01T00:00:00Z" })] }),
      team({ id: "t2", status: "approved", team_members: [member({ id: "m3", checked_in_at: "2026-01-01T00:00:00Z" })] }),
      team({ id: "t3", status: "waitlisted", team_members: [] }),
    ];
    const stats = teamStats(teams);
    expect(stats).toMatchObject({
      total: 3,
      pending: 1,
      approved: 1,
      waitlisted: 1,
      rejected: 0,
      withdrawn: 0,
      hackers: 3,
      checkedIn: 2,
    });
  });
});
