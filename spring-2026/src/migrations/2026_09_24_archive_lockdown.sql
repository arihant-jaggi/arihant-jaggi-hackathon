-- Archive lockdown for the Spring 2026 site.
--
-- OPTIONAL, but strongly recommended. The Spring 2026 event is over, and every
-- table created by the migrations in this folder was set up with permissive
-- row-level-security policies (`using (true)` / `with check (true)`) on
-- select/insert/update/delete. That means anyone holding the public anon key
-- (visible in this repo's client bundle / .env.example) can currently:
--   * read every row of `registrations` and `contact_submissions`, which
--     contain participant PII (names, emails, phone numbers), and
--   * insert, edit, or delete rows in ANY archived table, including wiping
--     out `challenges`, `judges_mentors`, `event_schedule`, etc.
--
-- This migration locks that down now that the event no longer needs public
-- write access:
--   * Public content tables keep public SELECT (they're just marketing copy)
--     but lose public INSERT/UPDATE/DELETE — only operators can write.
--   * `registrations` and `contact_submissions` (PII) lose public SELECT too
--     — only operators can read them.
--
-- "Operator" means a row in public.operators (see the Impact Miami 2.0
-- migration), NOT merely "signed in": the new /ops login can create Auth
-- users, so plain `authenticated` would let anyone who signs up read PII.
-- REQUIRES supabase/migrations/20260924000000_impact_miami_2.sql to run
-- first (it defines public.is_operator()). Add anyone who still needs the
-- old /admin to public.operators.
--   * Public INSERT is dropped entirely on `registrations`,
--     `project_submissions`, and `contact_submissions` since the event is
--     over and no one should be able to submit new rows through the anon key.
--
-- It is idempotent: every `drop policy` uses `if exists`, and every
-- `create policy` is preceded by dropping any policy of the same name, so
-- this file can be re-run safely.
--
-- It touches ONLY the Spring 2026 archive tables listed below. It does not
-- create or alter any Impact Miami 2.0 table (it only calls is_operator())
-- (see supabase/migrations/20260924000000_impact_miami_2.sql at the repo
-- root) — those already ship with a correct, operator-gated RLS model.

-- ---------------------------------------------------------------------------
-- Public content tables: keep public read, restrict writes to authenticated.
-- ---------------------------------------------------------------------------

-- challenges
drop policy if exists challenges_insert_all on challenges;
drop policy if exists challenges_update_all on challenges;
drop policy if exists challenges_delete_all on challenges;
drop policy if exists challenges_write_authenticated on challenges;
create policy challenges_write_authenticated on challenges for insert
  with check (public.is_operator());
drop policy if exists challenges_update_authenticated on challenges;
create policy challenges_update_authenticated on challenges for update
  using (public.is_operator()) with check (public.is_operator());
drop policy if exists challenges_delete_authenticated on challenges;
create policy challenges_delete_authenticated on challenges for delete
  using (public.is_operator());

-- challenge_examples
drop policy if exists challenge_examples_insert_all on challenge_examples;
drop policy if exists challenge_examples_update_all on challenge_examples;
drop policy if exists challenge_examples_delete_all on challenge_examples;
drop policy if exists challenge_examples_insert_authenticated on challenge_examples;
create policy challenge_examples_insert_authenticated on challenge_examples for insert
  with check (public.is_operator());
drop policy if exists challenge_examples_update_authenticated on challenge_examples;
create policy challenge_examples_update_authenticated on challenge_examples for update
  using (public.is_operator()) with check (public.is_operator());
drop policy if exists challenge_examples_delete_authenticated on challenge_examples;
create policy challenge_examples_delete_authenticated on challenge_examples for delete
  using (public.is_operator());

-- judging_criteria
drop policy if exists judging_criteria_insert_all on judging_criteria;
drop policy if exists judging_criteria_update_all on judging_criteria;
drop policy if exists judging_criteria_delete_all on judging_criteria;
drop policy if exists judging_criteria_insert_authenticated on judging_criteria;
create policy judging_criteria_insert_authenticated on judging_criteria for insert
  with check (public.is_operator());
drop policy if exists judging_criteria_update_authenticated on judging_criteria;
create policy judging_criteria_update_authenticated on judging_criteria for update
  using (public.is_operator()) with check (public.is_operator());
drop policy if exists judging_criteria_delete_authenticated on judging_criteria;
create policy judging_criteria_delete_authenticated on judging_criteria for delete
  using (public.is_operator());

-- site_details
drop policy if exists site_details_insert_all on site_details;
drop policy if exists site_details_update_all on site_details;
drop policy if exists site_details_delete_all on site_details;
drop policy if exists site_details_insert_authenticated on site_details;
create policy site_details_insert_authenticated on site_details for insert
  with check (public.is_operator());
drop policy if exists site_details_update_authenticated on site_details;
create policy site_details_update_authenticated on site_details for update
  using (public.is_operator()) with check (public.is_operator());
drop policy if exists site_details_delete_authenticated on site_details;
create policy site_details_delete_authenticated on site_details for delete
  using (public.is_operator());

-- site_highlights
drop policy if exists site_highlights_insert_all on site_highlights;
drop policy if exists site_highlights_update_all on site_highlights;
drop policy if exists site_highlights_delete_all on site_highlights;
drop policy if exists site_highlights_insert_authenticated on site_highlights;
create policy site_highlights_insert_authenticated on site_highlights for insert
  with check (public.is_operator());
drop policy if exists site_highlights_update_authenticated on site_highlights;
create policy site_highlights_update_authenticated on site_highlights for update
  using (public.is_operator()) with check (public.is_operator());
drop policy if exists site_highlights_delete_authenticated on site_highlights;
create policy site_highlights_delete_authenticated on site_highlights for delete
  using (public.is_operator());

-- skills
drop policy if exists skills_insert_all on skills;
drop policy if exists skills_update_all on skills;
drop policy if exists skills_delete_all on skills;
drop policy if exists skills_insert_authenticated on skills;
create policy skills_insert_authenticated on skills for insert
  with check (public.is_operator());
drop policy if exists skills_update_authenticated on skills;
create policy skills_update_authenticated on skills for update
  using (public.is_operator()) with check (public.is_operator());
drop policy if exists skills_delete_authenticated on skills;
create policy skills_delete_authenticated on skills for delete
  using (public.is_operator());

-- environments
drop policy if exists environments_insert_all on environments;
drop policy if exists environments_update_all on environments;
drop policy if exists environments_delete_all on environments;
drop policy if exists environments_insert_authenticated on environments;
create policy environments_insert_authenticated on environments for insert
  with check (public.is_operator());
drop policy if exists environments_update_authenticated on environments;
create policy environments_update_authenticated on environments for update
  using (public.is_operator()) with check (public.is_operator());
drop policy if exists environments_delete_authenticated on environments;
create policy environments_delete_authenticated on environments for delete
  using (public.is_operator());

-- event_schedule
drop policy if exists schedule_insert_all on event_schedule;
drop policy if exists schedule_update_all on event_schedule;
drop policy if exists schedule_delete_all on event_schedule;
drop policy if exists schedule_insert_authenticated on event_schedule;
create policy schedule_insert_authenticated on event_schedule for insert
  with check (public.is_operator());
drop policy if exists schedule_update_authenticated on event_schedule;
create policy schedule_update_authenticated on event_schedule for update
  using (public.is_operator()) with check (public.is_operator());
drop policy if exists schedule_delete_authenticated on event_schedule;
create policy schedule_delete_authenticated on event_schedule for delete
  using (public.is_operator());

-- venues
drop policy if exists venues_insert_all on venues;
drop policy if exists venues_update_all on venues;
drop policy if exists venues_delete_all on venues;
drop policy if exists venues_insert_authenticated on venues;
create policy venues_insert_authenticated on venues for insert
  with check (public.is_operator());
drop policy if exists venues_update_authenticated on venues;
create policy venues_update_authenticated on venues for update
  using (public.is_operator()) with check (public.is_operator());
drop policy if exists venues_delete_authenticated on venues;
create policy venues_delete_authenticated on venues for delete
  using (public.is_operator());

-- judges_mentors
drop policy if exists judges_insert_all on judges_mentors;
drop policy if exists judges_update_all on judges_mentors;
drop policy if exists judges_delete_all on judges_mentors;
drop policy if exists judges_insert_authenticated on judges_mentors;
create policy judges_insert_authenticated on judges_mentors for insert
  with check (public.is_operator());
drop policy if exists judges_update_authenticated on judges_mentors;
create policy judges_update_authenticated on judges_mentors for update
  using (public.is_operator()) with check (public.is_operator());
drop policy if exists judges_delete_authenticated on judges_mentors;
create policy judges_delete_authenticated on judges_mentors for delete
  using (public.is_operator());

-- faqs
drop policy if exists faqs_insert_all on faqs;
drop policy if exists faqs_update_all on faqs;
drop policy if exists faqs_delete_all on faqs;
drop policy if exists faqs_insert_authenticated on faqs;
create policy faqs_insert_authenticated on faqs for insert
  with check (public.is_operator());
drop policy if exists faqs_update_authenticated on faqs;
create policy faqs_update_authenticated on faqs for update
  using (public.is_operator()) with check (public.is_operator());
drop policy if exists faqs_delete_authenticated on faqs;
create policy faqs_delete_authenticated on faqs for delete
  using (public.is_operator());

-- contact_details
drop policy if exists details_insert_all on contact_details;
drop policy if exists details_update_all on contact_details;
drop policy if exists details_delete_all on contact_details;
drop policy if exists details_insert_authenticated on contact_details;
create policy details_insert_authenticated on contact_details for insert
  with check (public.is_operator());
drop policy if exists details_update_authenticated on contact_details;
create policy details_update_authenticated on contact_details for update
  using (public.is_operator()) with check (public.is_operator());
drop policy if exists details_delete_authenticated on contact_details;
create policy details_delete_authenticated on contact_details for delete
  using (public.is_operator());

-- hackathon_info
drop policy if exists hackathon_info_insert_all on hackathon_info;
drop policy if exists hackathon_info_update_all on hackathon_info;
drop policy if exists hackathon_info_delete_all on hackathon_info;
drop policy if exists hackathon_info_insert_authenticated on hackathon_info;
create policy hackathon_info_insert_authenticated on hackathon_info for insert
  with check (public.is_operator());
drop policy if exists hackathon_info_update_authenticated on hackathon_info;
create policy hackathon_info_update_authenticated on hackathon_info for update
  using (public.is_operator()) with check (public.is_operator());
drop policy if exists hackathon_info_delete_authenticated on hackathon_info;
create policy hackathon_info_delete_authenticated on hackathon_info for delete
  using (public.is_operator());

-- project_submissions: public content (kept readable), but no more public
-- inserts — the hackathon is over, nothing new should be submitted.
drop policy if exists project_submissions_insert_all on project_submissions;
drop policy if exists project_submissions_update_all on project_submissions;
drop policy if exists project_submissions_delete_all on project_submissions;
drop policy if exists project_submissions_insert_authenticated on project_submissions;
create policy project_submissions_insert_authenticated on project_submissions for insert
  with check (public.is_operator());
drop policy if exists project_submissions_update_authenticated on project_submissions;
create policy project_submissions_update_authenticated on project_submissions for update
  using (public.is_operator()) with check (public.is_operator());
drop policy if exists project_submissions_delete_authenticated on project_submissions;
create policy project_submissions_delete_authenticated on project_submissions for delete
  using (public.is_operator());

-- ---------------------------------------------------------------------------
-- PII tables: registrations and contact_submissions. Restrict SELECT too, and
-- drop public INSERT entirely (no more sign-ups / messages via the anon key).
-- ---------------------------------------------------------------------------

-- registrations
drop policy if exists allow_select_all on registrations;
drop policy if exists registrations_select_authenticated on registrations;
create policy registrations_select_authenticated on registrations for select
  using (public.is_operator());

drop policy if exists allow_insert_all on registrations;
-- (no replacement insert policy: public sign-ups are closed)

drop policy if exists registrations_update_authenticated on registrations;
create policy registrations_update_authenticated on registrations for update
  using (public.is_operator()) with check (public.is_operator());
drop policy if exists registrations_delete_authenticated on registrations;
create policy registrations_delete_authenticated on registrations for delete
  using (public.is_operator());

-- contact_submissions
drop policy if exists contact_submissions_select_all on contact_submissions;
drop policy if exists contact_submissions_select_authenticated on contact_submissions;
create policy contact_submissions_select_authenticated on contact_submissions for select
  using (public.is_operator());

drop policy if exists contact_submissions_insert_all on contact_submissions;
-- (no replacement insert policy: the contact form is retired on the archive)

drop policy if exists contact_submissions_update_all on contact_submissions;
drop policy if exists contact_submissions_delete_all on contact_submissions;
drop policy if exists contact_submissions_update_authenticated on contact_submissions;
create policy contact_submissions_update_authenticated on contact_submissions for update
  using (public.is_operator()) with check (public.is_operator());
drop policy if exists contact_submissions_delete_authenticated on contact_submissions;
create policy contact_submissions_delete_authenticated on contact_submissions for delete
  using (public.is_operator());
