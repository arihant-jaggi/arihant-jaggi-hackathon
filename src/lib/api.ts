import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EVENT_SLUG, requireSupabase, supabase } from "./supabase";
import { DEFAULT_EVENT, DEFAULT_FAQS, DEFAULT_SCHEDULE } from "./defaults";
import type {
  AnnouncementRow,
  EventPublicStats,
  EventRow,
  FaqItemRow,
  RegisterMemberInput,
  RegisterTeamInput,
  ScheduleItemRow,
  TrackRow,
} from "./types";

// ---------------------------------------------------------------------------
// Public reads. Each falls back to the flyer defaults with no backend.
// ---------------------------------------------------------------------------

// The first migration seeded a 9:00 start, a single "Hack day" block and a
// 9:00 FAQ answer. Until 20260926000000_schedule_and_hours.sql runs (or an
// operator edits these in /ops), show the current 9:30-5:30 content instead.
// Anything an operator has changed no longer matches and is shown as stored.
const SEEDED_START = new Date("2026-10-25T09:00:00-04:00").getTime();
const SEEDED_TIMES = "9:00 AM to 5:30 PM";
const SEEDED_TAGLINE = "A one-day youth hackathon building tech for Miami.";

export const withCurrentHours = (event: EventRow): EventRow => {
  let out = event;
  if (event.starts_at && new Date(event.starts_at).getTime() === SEEDED_START) {
    out = { ...out, starts_at: DEFAULT_EVENT.starts_at, ends_at: DEFAULT_EVENT.ends_at };
  }
  if (event.tagline === SEEDED_TAGLINE) out = { ...out, tagline: DEFAULT_EVENT.tagline };
  return out;
};

export const withCurrentSchedule = (rows: ScheduleItemRow[]): ScheduleItemRow[] =>
  rows.length === 1 && rows[0].title === "Hack day" && new Date(rows[0].starts_at).getTime() === SEEDED_START
    ? DEFAULT_SCHEDULE.map((r) => ({ ...r, event_id: rows[0].event_id }))
    : rows;

export const withCurrentFaqTimes = (rows: FaqItemRow[]): FaqItemRow[] =>
  rows.map((f) => (f.answer.includes(SEEDED_TIMES) ? { ...f, answer: f.answer.replace(SEEDED_TIMES, "9:30 AM to 5:30 PM") } : f));

export const useEvent = () =>
  useQuery({
    queryKey: ["event", EVENT_SLUG],
    queryFn: async (): Promise<EventRow> => {
      if (!supabase) return DEFAULT_EVENT;
      const { data, error } = await supabase.from("events").select("*").eq("slug", EVENT_SLUG).maybeSingle();
      if (error) throw error;
      return data ? withCurrentHours(data as EventRow) : DEFAULT_EVENT;
    },
    placeholderData: DEFAULT_EVENT,
    staleTime: 60_000,
  });

const useEventChildren = <T,>(
  table: string,
  fallback: T[],
  order: [string, boolean][],
  // Postgrest builder generics are too deep to name here.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extra?: (q: any) => any,
  normalize: (rows: T[]) => T[] = (rows) => rows,
) => {
  const { data: event } = useEvent();
  const eventId = event?.id;
  return useQuery({
    queryKey: [table, eventId],
    enabled: !supabase || (!!eventId && eventId !== "local"),
    queryFn: async (): Promise<T[]> => {
      if (!supabase) return fallback;
      let q = supabase.from(table).select("*").eq("event_id", eventId);
      for (const [col, ascending] of order) q = q.order(col, { ascending });
      if (extra) q = extra(q);
      const { data, error } = await q;
      if (error) throw error;
      return normalize((data as T[]) ?? []);
    },
    placeholderData: supabase ? undefined : fallback,
    staleTime: 60_000,
  });
};

export const useTracks = () => useEventChildren<TrackRow>("tracks", [], [["sort_order", true]]);
export const useSchedule = () =>
  useEventChildren<ScheduleItemRow>(
    "schedule_items",
    DEFAULT_SCHEDULE,
    [
      ["starts_at", true],
      ["sort_order", true],
    ],
    undefined,
    withCurrentSchedule,
  );
export const useFaqs = () => useEventChildren<FaqItemRow>("faq_items", DEFAULT_FAQS, [["sort_order", true]], undefined, withCurrentFaqTimes);
export const useAnnouncements = () =>
  useEventChildren<AnnouncementRow>(
    "announcements",
    [],
    [
      ["pinned", false],
      ["created_at", false],
    ],
    (q) => q.eq("published", true),
  );

export const useEventStats = () =>
  useQuery({
    queryKey: ["event-stats", EVENT_SLUG],
    enabled: !!supabase,
    queryFn: async (): Promise<EventPublicStats | null> => {
      const { data, error } = await requireSupabase().rpc("event_public_stats", { p_event_slug: EVENT_SLUG });
      if (error) throw error;
      return (Array.isArray(data) ? data[0] : data) ?? null;
    },
    staleTime: 30_000,
  });

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

const REGISTER_ERRORS: Record<string, string> = {
  EVENT_NOT_FOUND: "We couldn't find this event. Please refresh and try again.",
  REGISTRATION_CLOSED: "Registration isn't open right now.",
  TEAM_NAME_REQUIRED: "Give your team a name.",
  MEMBERS_REQUIRED: "Add at least one team member.",
  TEAM_SIZE_OUT_OF_RANGE: "Your team size is outside the allowed range.",
  EXACTLY_ONE_CAPTAIN: "Pick exactly one team captain.",
  MEMBER_INVALID: "Every member needs a name and a valid email.",
  EMAIL_ALREADY_REGISTERED: "One of these emails is already registered for this event.",
  DUPLICATE_MEMBER_EMAIL: "Each teammate needs a different email.",
  TEAM_NAME_TAKEN: "That team name is taken. Try another.",
};

export const registerErrorMessage = (raw: string) => {
  const key = Object.keys(REGISTER_ERRORS).find((k) => raw.includes(k));
  return key ? REGISTER_ERRORS[key] : "Something went wrong. Please try again.";
};

export const useRegisterTeam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { team: RegisterTeamInput; members: RegisterMemberInput[] }) => {
      const { data, error } = await requireSupabase().rpc("register_team", {
        p_event_slug: EVENT_SLUG,
        p_team: input.team,
        p_members: input.members,
      });
      if (error) throw new Error(registerErrorMessage(error.message));
      const row = Array.isArray(data) ? data[0] : data;
      return row as { team_code: string; team_status: string };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["event-stats"] }),
  });
};
