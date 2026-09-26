import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** Null when the site runs without a backend (local preview, forks). */
export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null;

export const isBackendConfigured = supabase !== null;

/** The event this deployment is for. Override with VITE_EVENT_SLUG. */
export const EVENT_SLUG = (import.meta.env.VITE_EVENT_SLUG as string | undefined) ?? "impact-miami-2";

export const ARCHIVE_URL = "https://spring2026.youngcodersimpact.com";

export const requireSupabase = (): SupabaseClient => {
  if (!supabase) throw new Error("Backend not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  return supabase;
};
