// Row shapes for supabase/migrations/20260924000000_impact_miami_2.sql.

export type RegistrationStatus = "coming_soon" | "open" | "waitlist" | "closed";
export type TeamStatus = "pending" | "approved" | "waitlisted" | "rejected" | "withdrawn";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export const TEAM_STATUSES: TeamStatus[] = ["pending", "approved", "waitlisted", "rejected", "withdrawn"];
export const REGISTRATION_STATUSES: RegistrationStatus[] = ["coming_soon", "open", "waitlist", "closed"];

export interface EventRow {
  id: string;
  slug: string;
  name: string;
  edition: string | null;
  tagline: string | null;
  description: string | null;
  starts_at: string | null;
  ends_at: string | null;
  timezone: string;
  venue_name: string | null;
  venue_detail: string | null;
  venue_address: string | null;
  venue_map_url: string | null;
  partner_name: string | null;
  prize_summary: string | null;
  prize_detail: string | null;
  contact_email: string | null;
  registration_status: RegistrationStatus;
  registration_opens_at: string | null;
  registration_closes_at: string | null;
  min_team_size: number;
  max_team_size: number;
  max_teams: number | null;
  is_current: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TrackRow {
  id: string;
  event_id: string;
  title: string;
  summary: string | null;
  description: string | null;
  icon: string | null;
  sort_order: number;
}

export interface ScheduleItemRow {
  id: string;
  event_id: string;
  starts_at: string;
  ends_at: string | null;
  title: string;
  description: string | null;
  location: string | null;
  /** Short italic note under the block. Column added in 20260926000000. */
  highlight?: string | null;
  sort_order: number;
}

export interface FaqItemRow {
  id: string;
  event_id: string;
  question: string;
  answer: string;
  sort_order: number;
}

export interface AnnouncementRow {
  id: string;
  event_id: string;
  title: string;
  body: string | null;
  published: boolean;
  pinned: boolean;
  created_at: string;
}

export interface TeamRow {
  id: string;
  event_id: string;
  code: string;
  name: string;
  status: TeamStatus;
  track_id: string | null;
  school: string | null;
  project_idea: string | null;
  experience_level: ExperienceLevel | null;
  table_number: string | null;
  notes: string | null;
  checked_in_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamMemberRow {
  id: string;
  team_id: string;
  event_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  grade: string | null;
  school: string | null;
  is_captain: boolean;
  tshirt_size: string | null;
  dietary_notes: string | null;
  guardian_name: string | null;
  guardian_email: string | null;
  guardian_phone: string | null;
  checked_in_at: string | null;
  created_at: string;
}

export type TeamWithMembers = TeamRow & { team_members: TeamMemberRow[] };

export interface OperatorRow {
  user_id: string;
  email: string;
  display_name: string | null;
  role: "owner" | "operator";
  created_at: string;
}

export interface EventPublicStats {
  teams_registered: number;
  hackers_registered: number;
  spots_left: number | null;
}

/** Payloads for the register_team RPC. */
export interface RegisterTeamInput {
  name: string;
  school?: string;
  project_idea?: string;
  experience_level?: ExperienceLevel | "";
  track_id?: string;
}

export interface RegisterMemberInput {
  full_name: string;
  email: string;
  phone?: string;
  grade?: string;
  school?: string;
  is_captain: boolean;
  tshirt_size?: string;
  dietary_notes?: string;
  guardian_name?: string;
  guardian_email?: string;
  guardian_phone?: string;
}
