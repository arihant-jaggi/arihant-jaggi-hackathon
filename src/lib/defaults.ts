import type { EventRow, FaqItemRow, ScheduleItemRow } from "./types";
import { ARCHIVE_URL, EVENT_SLUG } from "./supabase";

// Facts from the official Impact Miami 2.0 flyer. Used when no backend is
// configured, and as the first paint before Supabase answers.
export const DEFAULT_EVENT: EventRow = {
  id: "local",
  slug: EVENT_SLUG,
  name: "Impact Miami",
  edition: "2.0",
  tagline: "A one-day youth hackathon building tech for Miami.",
  description:
    "Young Coders Initiative presents Impact Miami 2.0 — a one-day hackathon where student teams design, build, and pitch projects that make a real difference for Miami communities.",
  starts_at: "2026-10-25T09:00:00-04:00",
  ends_at: "2026-10-25T17:30:00-04:00",
  timezone: "America/New_York",
  venue_name: "The Cushman School",
  venue_detail: "Middle School",
  venue_address: "592 NE 60th Street, Miami, FL 33137",
  venue_map_url: "https://www.google.com/maps/search/?api=1&query=592+NE+60th+Street+Miami+FL+33137",
  partner_name: "Big Red Education",
  prize_summary: "Huge cash prize pool",
  prize_detail: "Plus awards for winners.",
  contact_email: "contact@youngcodersmiami.org",
  registration_status: "coming_soon",
  registration_opens_at: null,
  registration_closes_at: null,
  min_team_size: 1,
  max_team_size: 4,
  max_teams: null,
  is_current: true,
};

export const DEFAULT_SCHEDULE: ScheduleItemRow[] = [
  {
    id: "local-hack-day",
    event_id: "local",
    starts_at: "2026-10-25T09:00:00-04:00",
    ends_at: "2026-10-25T17:30:00-04:00",
    title: "Hack day",
    description: "Doors open at 9:00 AM; awards wrap by 5:30 PM. The detailed run of show is posted here before the event.",
    location: "The Cushman School, Middle School",
    sort_order: 0,
  },
];

export const DEFAULT_FAQS: FaqItemRow[] = [
  {
    id: "f1",
    event_id: "local",
    question: "When and where is Impact Miami 2.0?",
    answer:
      "Sunday, October 25, 2026, from 9:00 AM to 5:30 PM at The Cushman School (Middle School), 592 NE 60th Street, Miami, FL 33137.",
    sort_order: 10,
  },
  {
    id: "f2",
    event_id: "local",
    question: "How do I register?",
    answer:
      "Registration is coming soon. When it opens, the Register button on this site goes live — one teammate registers the whole team.",
    sort_order: 20,
  },
  { id: "f3", event_id: "local", question: "What can we win?", answer: "There is a cash prize pool, plus awards for winning teams.", sort_order: 30 },
  {
    id: "f4",
    event_id: "local",
    question: "Who is running it?",
    answer: "Impact Miami 2.0 is presented by the Young Coders Initiative in partnership with Big Red Education.",
    sort_order: 40,
  },
  {
    id: "f5",
    event_id: "local",
    question: "Where can I see the last hackathon?",
    answer: `The Spring 2026 site is archived at ${ARCHIVE_URL.replace("https://", "")}.`,
    sort_order: 50,
  },
];
