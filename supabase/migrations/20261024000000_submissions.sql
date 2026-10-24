-- Impact Miami 2.0: project submissions.
--
-- Teams submit from /submit (no login). Submissions are private: only
-- operators can read them. Operators open and close submissions from
-- /ops -> Submissions. Teams may resubmit while open; the latest counts.
-- Named `submissions` to avoid the archived site's `project_submissions`.

alter table public.events add column if not exists submissions_open boolean not null default false;

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  team_name text not null check (char_length(team_name) between 1 and 120),
  project_title text not null check (char_length(project_title) between 1 and 160),
  description text not null check (char_length(description) between 1 and 1200),
  track_id uuid references public.tracks(id) on delete set null,
  track_title text,
  github_url text,
  demo_url text,
  slides_url text,
  created_at timestamptz not null default now()
);
create index if not exists submissions_event_idx on public.submissions (event_id, created_at desc);

alter table public.submissions enable row level security;
drop policy if exists submissions_operator_all on public.submissions;
create policy submissions_operator_all on public.submissions for all using (public.is_operator()) with check (public.is_operator());

-- Public submit: validates, then inserts. No public read access at all.
create or replace function public.submit_project(p_event_slug text, p_payload jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_event public.events%rowtype;
  v_id uuid;
  v_track public.tracks%rowtype;
  v_github text := nullif(trim(p_payload->>'github_url'), '');
  v_demo text := nullif(trim(p_payload->>'demo_url'), '');
  v_slides text := nullif(trim(p_payload->>'slides_url'), '');
begin
  select * into v_event from public.events where slug = p_event_slug;
  if not found then raise exception 'EVENT_NOT_FOUND' using errcode = 'P0001'; end if;
  if not v_event.submissions_open then raise exception 'SUBMISSIONS_CLOSED' using errcode = 'P0001'; end if;

  if coalesce(trim(p_payload->>'team_name'), '') = '' then raise exception 'TEAM_NAME_REQUIRED' using errcode = 'P0001'; end if;
  if coalesce(trim(p_payload->>'project_title'), '') = '' then raise exception 'TITLE_REQUIRED' using errcode = 'P0001'; end if;
  if coalesce(trim(p_payload->>'description'), '') = '' then raise exception 'DESCRIPTION_REQUIRED' using errcode = 'P0001'; end if;
  if v_github is null and v_demo is null and v_slides is null then raise exception 'LINK_REQUIRED' using errcode = 'P0001'; end if;
  if (v_github is not null and v_github !~* '^https?://') or (v_demo is not null and v_demo !~* '^https?://')
     or (v_slides is not null and v_slides !~* '^https?://') then
    raise exception 'LINK_INVALID' using errcode = 'P0001';
  end if;

  select * into v_track from public.tracks t
    where t.event_id = v_event.id and t.id::text = p_payload->>'track_id';

  insert into public.submissions (event_id, team_name, project_title, description, track_id, track_title, github_url, demo_url, slides_url)
  values (
    v_event.id,
    left(trim(p_payload->>'team_name'), 120),
    left(trim(p_payload->>'project_title'), 160),
    left(trim(p_payload->>'description'), 1200),
    v_track.id,
    coalesce(v_track.title, nullif(left(trim(p_payload->>'track_title'), 120), '')),
    left(v_github, 500), left(v_demo, 500), left(v_slides, 500)
  )
  returning id into v_id;
  return v_id;
end $$;

revoke all on function public.submit_project(text, jsonb) from public;
grant execute on function public.submit_project(text, jsonb) to anon, authenticated;
