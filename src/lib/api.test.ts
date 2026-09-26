import { noEmDash, withCurrentFaqTimes, withCurrentHours, withCurrentSchedule } from "./api";
import { DEFAULT_EVENT, DEFAULT_SCHEDULE } from "./defaults";
import type { FaqItemRow, ScheduleItemRow } from "./types";

// Values exactly as the first migration seeded them, as Postgres returns them.
const seededEvent = { ...DEFAULT_EVENT, id: "e1", starts_at: "2026-10-25T13:00:00+00:00", ends_at: "2026-10-25T21:30:00+00:00" };
const seededHackDay: ScheduleItemRow = {
  id: "s1",
  event_id: "e1",
  starts_at: "2026-10-25T13:00:00+00:00",
  ends_at: "2026-10-25T21:30:00+00:00",
  title: "Hack day",
  description: "Doors open at 9:00 AM; awards wrap by 5:30 PM.",
  location: "The Cushman School, Middle School",
  sort_order: 0,
};

describe("seed fallbacks", () => {
  it("moves the seeded 9:00 start to 9:30", () => {
    expect(withCurrentHours(seededEvent).starts_at).toBe(DEFAULT_EVENT.starts_at);
  });

  it("swaps the seeded tagline and keeps an edited one", () => {
    const seeded = { ...seededEvent, tagline: "A one-day youth hackathon building tech for Miami." };
    expect(withCurrentHours(seeded).tagline).toBe(DEFAULT_EVENT.tagline);
    const edited = { ...seededEvent, starts_at: "2026-10-25T14:00:00+00:00", tagline: "Our own line" };
    expect(withCurrentHours(edited).tagline).toBe("Our own line");
  });

  it("keeps a start time an operator set", () => {
    const edited = { ...seededEvent, starts_at: "2026-10-25T14:00:00+00:00" };
    expect(withCurrentHours(edited)).toEqual(edited);
  });

  it("replaces the lone seeded Hack day block with the run of show", () => {
    const rows = withCurrentSchedule([seededHackDay]);
    expect(rows).toHaveLength(DEFAULT_SCHEDULE.length);
    expect(rows[0].title).toBe("Introduction and Commencement");
    expect(rows.every((r) => r.event_id === "e1")).toBe(true);
  });

  it("keeps a schedule operators have edited", () => {
    const renamed = [{ ...seededHackDay, title: "Hackathon" }];
    expect(withCurrentSchedule(renamed)).toEqual(renamed);
    const extra = [seededHackDay, { ...seededHackDay, id: "s2", title: "Lunch" }];
    expect(withCurrentSchedule(extra)).toEqual(extra);
  });

  it("updates the seeded FAQ hours and leaves others alone", () => {
    const faqs: FaqItemRow[] = [
      { id: "f1", event_id: "e1", question: "When?", answer: "Sunday, from 9:00 AM to 5:30 PM at Cushman.", sort_order: 1 },
      { id: "f2", event_id: "e1", question: "Prizes?", answer: "Cash prize pool.", sort_order: 2 },
    ];
    const out = withCurrentFaqTimes(faqs);
    expect(out[0].answer).toBe("Sunday, from 9:30 AM to 5:30 PM at Cushman.");
    expect(out[1]).toEqual(faqs[1]);
  });

  it("replaces the previous default tagline too", () => {
    const previous = { ...seededEvent, tagline: "Build AI agents that work for Miami \u2014 in one day." };
    expect(withCurrentHours(previous).tagline).toBe(DEFAULT_EVENT.tagline);
  });
});

describe("no em dashes", () => {
  it("uses a colon in titles and a comma elsewhere", () => {
    expect(noEmDash("Project Building \u2014 Morning Session", true)).toBe("Project Building: Morning Session");
    expect(noEmDash("Impact Miami 2.0 \u2014 a one-day hackathon")).toBe("Impact Miami 2.0, a one-day hackathon");
    expect(noEmDash(null)).toBeNull();
  });

  it("cleans schedule rows, event text and FAQ answers from the database", () => {
    const rows = withCurrentSchedule([
      { ...seededHackDay, title: "Project Building \u2014 Morning Session" },
      { ...seededHackDay, id: "s2", title: "Lunch", description: "Eat \u2014 then build" },
    ]);
    expect(rows[0].title).toBe("Project Building: Morning Session");
    expect(rows[1].description).toBe("Eat, then build");
    const event = withCurrentHours({ ...seededEvent, description: "Impact Miami 2.0 \u2014 a one-day hackathon" });
    expect(event.description).toBe("Impact Miami 2.0, a one-day hackathon");
    const [faq] = withCurrentFaqTimes([
      { id: "f", event_id: "e1", question: "How do I register?", answer: "When it opens, the Register button on this site goes live \u2014 one teammate registers the whole team.", sort_order: 1 },
    ]);
    expect(faq.answer).toBe("When it opens, the Register button on this site goes live, and one teammate registers the whole team.");
  });

  it("leaves no em dash in the built-in content", () => {
    const text = JSON.stringify([DEFAULT_EVENT, DEFAULT_SCHEDULE]);
    expect(text).not.toContain("\u2014");
  });
});
