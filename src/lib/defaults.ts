import type { EventRow, FaqItemRow, ScheduleItemRow } from "./types";
import { ARCHIVE_URL, EVENT_SLUG } from "./supabase";

// Facts from the official Impact Miami 2.0 flyer. Used when no backend is
// configured, and as the first paint before Supabase answers.
export const DEFAULT_EVENT: EventRow = {
  id: "local",
  slug: EVENT_SLUG,
  name: "Impact Miami",
  edition: "2.0",
  tagline: "One day. One team. One community. Build the AI agents Miami needs.",
  description:
    "Young Coders Initiative presents Impact Miami 2.0, a one-day hackathon where student teams design, build, and pitch projects that make a real difference for Miami communities.",
  starts_at: "2026-10-25T09:30:00-04:00",
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

const LOCATION = "The Cushman School, Middle School";

// Run of show: Spring 2026's blocks and wording, on the 9:30–5:30 day.
// Mirrors supabase/migrations/20260926000000_schedule_and_hours.sql.
const block = (
  n: number,
  start: string,
  end: string,
  title: string,
  description: string,
  highlight: string | null,
): ScheduleItemRow => ({
  id: `local-${n}`,
  event_id: "local",
  starts_at: `2026-10-25T${start}:00-04:00`,
  ends_at: `2026-10-25T${end}:00-04:00`,
  title,
  description,
  location: LOCATION,
  highlight,
  sort_order: n * 10,
});

export const DEFAULT_SCHEDULE: ScheduleItemRow[] = [
  block(1, "09:30", "10:00", "Introduction and Commencement",
    "Welcome to the hackathon. Opening remarks, formal introduction of the event, and a walkthrough of the challenge prompt, rules, and expectations for the day.",
    "Grab your badge, connect to WiFi, and settle in before we kick things off."),
  block(2, "10:00", "12:30", "Project Building: Morning Session",
    "Teams get to work building their solutions. Use this time to design, develop, and iterate. Mentors will be available to assist regarding technical and device issues.",
    "First block of build time before Lunch. Hit the ground running!"),
  block(3, "12:30", "13:00", "Lunch Break (OPTIONAL)",
    "Take a break, recharge, and connect with other teams. Lunch is provided for all participants.",
    "Pizza provided for all participants."),
  block(4, "13:00", "15:30", "Project Building & Pitch Creation: Afternoon Session",
    "Back to building. Final stretch before presentations begin. Use this time to polish your demo, finalize your pitch deck, and prepare your story.",
    "Two and a half hours left to build. Start thinking about your pitch and finalizing pitch decks."),
  block(5, "15:30", "16:45", "Pitch Presentations",
    "Teams present their projects to the judging panel. Each team will have a 5 minute window to pitch followed by 2 minutes of Q&A from the judges.",
    "Each team has 5 minutes to present followed by 2 minutes of Q&A from the judges. Your pitch should cover the problem you identified, who it affects, a walkthrough of your solution, the tech you used, and your vision for where it goes next. Transitions between teams are kept to 2 minutes so be ready before your slot. The 6 minute presentation window is a hard cutoff."),
  block(6, "16:45", "17:30", "Final Judging and Awards",
    "Judges deliberate and final scores are tallied. Winners are announced and recognized. Closing remarks to follow.",
    "Winners announced live. Stick around for the closing ceremony with awards provided to winning recipients."),
];

export const DEFAULT_FAQS: FaqItemRow[] = [
  {
    id: "f1",
    event_id: "local",
    question: "When and where is Impact Miami 2.0?",
    answer:
      "Sunday, October 25, 2026, from 9:30 AM to 5:30 PM at The Cushman School (Middle School), 592 NE 60th Street, Miami, FL 33137.",
    sort_order: 10,
  },
  {
    id: "f2",
    event_id: "local",
    question: "How do I register?",
    answer:
      "Registration is coming soon. When it opens, the Register button on this site goes live, and one teammate registers the whole team.",
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
