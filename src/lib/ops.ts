// Operator-console data layer: auth, CRUD hooks over Supabase, and pure
// helpers (CSV export, filtering, stats) used by src/pages/ops/*.
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { EVENT_SLUG, requireSupabase, supabase } from "./supabase";
import type {
  AnnouncementRow,
  EventRow,
  FaqItemRow,
  OperatorRow,
  ScheduleItemRow,
  TeamMemberRow,
  TeamRow,
  TeamStatus,
  TeamWithMembers,
  TrackRow,
} from "./types";

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

/** Current Supabase auth session, live-updated via onAuthStateChange. */
export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
};

export const useIsOperator = (userId: string | undefined) =>
  useQuery({
    queryKey: ["is-operator", userId],
    enabled: !!supabase && !!userId,
    queryFn: async (): Promise<boolean> => {
      const { data, error } = await requireSupabase().rpc("is_operator");
      if (error) throw error;
      return !!data;
    },
    staleTime: 30_000,
  });

export const useCurrentOperator = (userId: string | undefined) =>
  useQuery({
    queryKey: ["current-operator", userId],
    enabled: !!supabase && !!userId,
    queryFn: async (): Promise<OperatorRow | null> => {
      const { data, error } = await requireSupabase().from("operators").select("*").eq("user_id", userId).maybeSingle();
      if (error) throw error;
      return (data as OperatorRow) ?? null;
    },
    staleTime: 30_000,
  });

// ---------------------------------------------------------------------------
// Event
// ---------------------------------------------------------------------------

export const useOpsEvent = () =>
  useQuery({
    queryKey: ["ops-event", EVENT_SLUG],
    queryFn: async (): Promise<EventRow> => {
      const { data, error } = await requireSupabase().from("events").select("*").eq("slug", EVENT_SLUG).single();
      if (error) throw error;
      return data as EventRow;
    },
  });

export const useUpdateEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<EventRow> & { id: string }) => {
      const { id, ...rest } = patch;
      const { error } = await requireSupabase().from("events").update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ops-event"] });
      qc.invalidateQueries({ queryKey: ["event"] });
    },
  });
};

// ---------------------------------------------------------------------------
// Teams & members
// ---------------------------------------------------------------------------

export interface TeamFilters {
  q?: string;
  status?: TeamStatus | "all";
  track?: string | "all";
  checkedIn?: "all" | "yes" | "no";
}

export const useTeams = (eventId: string | undefined) =>
  useQuery({
    queryKey: ["ops-teams", eventId],
    enabled: !!eventId,
    queryFn: async (): Promise<TeamWithMembers[]> => {
      const { data, error } = await requireSupabase()
        .from("teams")
        .select("*, team_members(*)")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as TeamWithMembers[]) ?? [];
    },
  });

export const useTeam = (teamId: string | undefined) =>
  useQuery({
    queryKey: ["ops-team", teamId],
    enabled: !!teamId,
    queryFn: async (): Promise<TeamWithMembers | null> => {
      const { data, error } = await requireSupabase().from("teams").select("*, team_members(*)").eq("id", teamId).maybeSingle();
      if (error) throw error;
      return (data as TeamWithMembers) ?? null;
    },
  });

const invalidateTeams = (qc: ReturnType<typeof useQueryClient>, teamId?: string) => {
  qc.invalidateQueries({ queryKey: ["ops-teams"] });
  if (teamId) qc.invalidateQueries({ queryKey: ["ops-team", teamId] });
};

export const useCreateTeam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { event_id: string; name: string; school?: string | null; track_id?: string | null; status?: TeamStatus }) => {
      const { data, error } = await requireSupabase()
        .from("teams")
        .insert({ ...input, status: input.status ?? "approved" })
        .select()
        .single();
      if (error) throw error;
      return data as TeamRow;
    },
    onSuccess: () => invalidateTeams(qc),
  });
};

export const useUpdateTeam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<TeamRow> & { id: string }) => {
      const { id, ...rest } = patch;
      const { error } = await requireSupabase().from("teams").update(rest).eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => invalidateTeams(qc, id),
  });
};

export const useDeleteTeam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await requireSupabase().from("teams").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => invalidateTeams(qc),
  });
};

export const useCheckInTeam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, checkedIn }: { id: string; checkedIn: boolean }) => {
      const { error } = await requireSupabase()
        .from("teams")
        .update({ checked_in_at: checkedIn ? new Date().toISOString() : null })
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => invalidateTeams(qc, id),
  });
};

export const useUpdateMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<TeamMemberRow> & { id: string; team_id: string }) => {
      const { id, team_id, ...rest } = patch;
      const { error } = await requireSupabase().from("team_members").update(rest).eq("id", id);
      if (error) throw error;
      return team_id;
    },
    onSuccess: (teamId) => invalidateTeams(qc, teamId),
  });
};

export const useAddMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<TeamMemberRow, "id" | "created_at" | "checked_in_at">) => {
      const { error } = await requireSupabase().from("team_members").insert(input);
      if (error) throw error;
      return input.team_id;
    },
    onSuccess: (teamId) => invalidateTeams(qc, teamId),
  });
};

export const useDeleteMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, team_id }: { id: string; team_id: string }) => {
      const { error } = await requireSupabase().from("team_members").delete().eq("id", id);
      if (error) throw error;
      return team_id;
    },
    onSuccess: (teamId) => invalidateTeams(qc, teamId),
  });
};

export const useCheckInMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, team_id, checkedIn }: { id: string; team_id: string; checkedIn: boolean }) => {
      const { error } = await requireSupabase()
        .from("team_members")
        .update({ checked_in_at: checkedIn ? new Date().toISOString() : null })
        .eq("id", id);
      if (error) throw error;
      return team_id;
    },
    onSuccess: (teamId) => invalidateTeams(qc, teamId),
  });
};

// ---------------------------------------------------------------------------
// Generic content CRUD (tracks, schedule_items, faq_items, announcements)
// ---------------------------------------------------------------------------

const useContentList = <T,>(table: string, eventId: string | undefined, order: [string, boolean][]) =>
  useQuery({
    queryKey: ["ops-content", table, eventId],
    enabled: !!eventId,
    queryFn: async (): Promise<T[]> => {
      let q = requireSupabase().from(table).select("*").eq("event_id", eventId);
      for (const [col, asc] of order) q = q.order(col, { ascending: asc });
      const { data, error } = await q;
      if (error) throw error;
      return (data as T[]) ?? [];
    },
  });

const useContentCreate = <T extends Record<string, unknown>>(table: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: T) => {
      const { data, error } = await requireSupabase()
        .from(table)
        .insert(input as never)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ops-content", table] }),
  });
};

const useContentUpdate = <T extends { id: string }>(table: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: T) => {
      const { id, ...rest } = patch;
      const { error } = await requireSupabase()
        .from(table)
        .update(rest as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ops-content", table] }),
  });
};

const useContentDelete = (table: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await requireSupabase().from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ops-content", table] }),
  });
};

export const useOpsTracks = (eventId: string | undefined) => useContentList<TrackRow>("tracks", eventId, [["sort_order", true]]);
export const useCreateTrack = () => useContentCreate<Omit<TrackRow, "id">>("tracks");
export const useUpdateTrack = () => useContentUpdate<Partial<TrackRow> & { id: string }>("tracks");
export const useDeleteTrack = () => useContentDelete("tracks");

export const useOpsSchedule = (eventId: string | undefined) =>
  useContentList<ScheduleItemRow>("schedule_items", eventId, [
    ["starts_at", true],
    ["sort_order", true],
  ]);
export const useCreateScheduleItem = () => useContentCreate<Omit<ScheduleItemRow, "id">>("schedule_items");
export const useUpdateScheduleItem = () => useContentUpdate<Partial<ScheduleItemRow> & { id: string }>("schedule_items");
export const useDeleteScheduleItem = () => useContentDelete("schedule_items");

export const useOpsFaqs = (eventId: string | undefined) => useContentList<FaqItemRow>("faq_items", eventId, [["sort_order", true]]);
export const useCreateFaq = () => useContentCreate<Omit<FaqItemRow, "id">>("faq_items");
export const useUpdateFaq = () => useContentUpdate<Partial<FaqItemRow> & { id: string }>("faq_items");
export const useDeleteFaq = () => useContentDelete("faq_items");

export const useOpsAnnouncements = (eventId: string | undefined) =>
  useContentList<AnnouncementRow>("announcements", eventId, [["created_at", false]]);
export const useCreateAnnouncement = () => useContentCreate<Omit<AnnouncementRow, "id" | "created_at">>("announcements");
export const useUpdateAnnouncement = () => useContentUpdate<Partial<AnnouncementRow> & { id: string }>("announcements");
export const useDeleteAnnouncement = () => useContentDelete("announcements");

// ---------------------------------------------------------------------------
// Operators (owners only)
// ---------------------------------------------------------------------------

export const useOperators = () =>
  useQuery({
    queryKey: ["ops-operators"],
    queryFn: async (): Promise<OperatorRow[]> => {
      const { data, error } = await requireSupabase().from("operators").select("*").order("created_at", { ascending: true });
      if (error) throw error;
      return (data as OperatorRow[]) ?? [];
    },
  });

export const useAddOperator = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { user_id: string; email: string; role: "owner" | "operator"; display_name?: string }) => {
      const { error } = await requireSupabase().from("operators").insert(input);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ops-operators"] }),
  });
};

export const useUpdateOperatorRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ user_id, role }: { user_id: string; role: "owner" | "operator" }) => {
      const { error } = await requireSupabase().from("operators").update({ role }).eq("user_id", user_id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ops-operators"] }),
  });
};

export const useRemoveOperator = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (user_id: string) => {
      const { error } = await requireSupabase().from("operators").delete().eq("user_id", user_id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ops-operators"] }),
  });
};

// ---------------------------------------------------------------------------
// Pure helpers (unit-tested in ops.test.ts)
// ---------------------------------------------------------------------------

/** RFC4180 cell quoting, with a leading apostrophe guard against CSV formula injection. */
const csvCell = (value: unknown): string => {
  let s = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  if (/[",\n\r]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
};

const CSV_HEADERS = [
  "team_code",
  "team_name",
  "team_status",
  "track_id",
  "school",
  "table_number",
  "team_checked_in_at",
  "member_name",
  "member_email",
  "member_phone",
  "member_grade",
  "is_captain",
  "member_checked_in_at",
];

/** One CSV row per team member (teams with no members still get one row). */
export const teamsToCsv = (teams: TeamWithMembers[]): string => {
  const lines = [CSV_HEADERS.map(csvCell).join(",")];
  for (const team of teams) {
    const members = team.team_members && team.team_members.length > 0 ? team.team_members : [null];
    for (const member of members) {
      lines.push(
        [
          team.code,
          team.name,
          team.status,
          team.track_id ?? "",
          team.school ?? "",
          team.table_number ?? "",
          team.checked_in_at ?? "",
          member?.full_name ?? "",
          member?.email ?? "",
          member?.phone ?? "",
          member?.grade ?? "",
          member?.is_captain ? "yes" : "",
          member?.checked_in_at ?? "",
        ]
          .map(csvCell)
          .join(","),
      );
    }
  }
  return lines.join("\r\n");
};

export const teamStats = (teams: TeamWithMembers[]) => {
  const stats = {
    total: teams.length,
    pending: 0,
    approved: 0,
    waitlisted: 0,
    rejected: 0,
    withdrawn: 0,
    hackers: 0,
    checkedIn: 0,
  };
  for (const team of teams) {
    stats[team.status] += 1;
    const members = team.team_members ?? [];
    stats.hackers += members.length;
    stats.checkedIn += members.filter((m) => !!m.checked_in_at).length;
  }
  return stats;
};

export const filterTeams = (teams: TeamWithMembers[], filters: TeamFilters): TeamWithMembers[] => {
  const q = filters.q?.trim().toLowerCase();
  return teams.filter((team) => {
    if (filters.status && filters.status !== "all" && team.status !== filters.status) return false;
    if (filters.track && filters.track !== "all" && team.track_id !== filters.track) return false;
    if (filters.checkedIn && filters.checkedIn !== "all") {
      const isIn = !!team.checked_in_at;
      if (filters.checkedIn === "yes" && !isIn) return false;
      if (filters.checkedIn === "no" && isIn) return false;
    }
    if (q) {
      const members = team.team_members ?? [];
      const haystack = [team.name, team.code, team.school ?? "", ...members.flatMap((m) => [m.full_name, m.email])]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
};
