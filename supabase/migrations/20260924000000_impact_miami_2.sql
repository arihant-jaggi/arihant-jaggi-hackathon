-- Impact Miami 2.0 — backend schema.
--
-- Safe to run in the same Supabase project as the Spring 2026 site: every
-- table name here is new, so the archived site's tables are untouched.
--
-- Access model
--   * Public (anon) can read published event content and call
--     register_team() / event_public_stats(). Nothing else.
--   * Operators (rows in public.operators, linked to Supabase Auth users)
--     can read and manage everything, including team PII.
--   * Owners are operators who can also add/remove other operators.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- Operators (hackathon staff with console access)
-- ---------------------------------------------------------------------------

create table if not exists public.operators (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  role text not null default 'operator' check (role in ('owner', 'operator')),
  created_at timestamptz not null default now()
);

create or replace function public.is_operator()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.operators where user_id = auth.uid());
$$;

create or replace function public.is_owner()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.operators where user_id = auth.uid() and role = 'owner');
$$;

alter table public.operators enable row level security;
create policy operators_select on public.operators for select using (public.is_operator());
create policy operators_insert on public.operators for insert with check (public.is_owner());
create policy operators_update on public.operators for update using (public.is_owner()) with check (public.is_owner());
create policy operators_delete on public.operators for delete using (public.is_owner());

-- ---------------------------------------------------------------------------
-- Events
-- ---------------------------------------------------------------------------

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  edition text,
  tagline text,
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  timezone text not null default 'America/New_York',
  venue_name text,
  venue_detail text,
  venue_address text,
  venue_map_url text,
  partner_name text,
  prize_summary text,
  prize_detail text,
  contact_email text,
  registration_status text not null default 'coming_soon'
    check (registration_status in ('coming_soon', 'open', 'waitlist', 'closed')),
  registration_opens_at timestamptz,
  registration_closes_at timestamptz,
  min_team_size smallint not null default 1 check (min_team_size >= 1),
  max_team_size smallint not null default 4 check (max_team_size >= 1),
  max_teams integer check (max_teams is null or max_teams > 0),
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_team_size_range check (min_team_size <= max_team_size)
);

-- At most one "current" event drives the public homepage.
create unique index if not exists events_single_current on public.events (is_current) where is_current;

create trigger events_touch before update on public.events
  for each row execute function public.touch_updated_at();

alter table public.events enable row level security;
create policy events_public_read on public.events for select using (true);
create policy events_operator_write on public.events for all using (public.is_operator()) with check (public.is_operator());

-- ---------------------------------------------------------------------------
-- Public content: tracks, schedule, FAQ, announcements
-- ---------------------------------------------------------------------------

create table if not exists public.tracks (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  title text not null,
  summary text,
  description text,
  icon text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists tracks_event_idx on public.tracks (event_id, sort_order);

create table if not exists public.schedule_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz,
  title text not null,
  description text,
  location text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists schedule_items_event_idx on public.schedule_items (event_id, starts_at, sort_order);

create table if not exists public.faq_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists faq_items_event_idx on public.faq_items (event_id, sort_order);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  title text not null,
  body text,
  published boolean not null default false,
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists announcements_event_idx on public.announcements (event_id, created_at desc);

alter table public.tracks enable row level security;
alter table public.schedule_items enable row level security;
alter table public.faq_items enable row level security;
alter table public.announcements enable row level security;

create policy tracks_public_read on public.tracks for select using (true);
create policy tracks_operator_write on public.tracks for all using (public.is_operator()) with check (public.is_operator());

create policy schedule_public_read on public.schedule_items for select using (true);
create policy schedule_operator_write on public.schedule_items for all using (public.is_operator()) with check (public.is_operator());

create policy faq_public_read on public.faq_items for select using (true);
create policy faq_operator_write on public.faq_items for all using (public.is_operator()) with check (public.is_operator());

create policy announcements_public_read on public.announcements for select using (published or public.is_operator());
create policy announcements_operator_write on public.announcements for all using (public.is_operator()) with check (public.is_operator());

-- ---------------------------------------------------------------------------
-- Teams and members (PII — operators only)
-- ---------------------------------------------------------------------------

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  code text not null unique default upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6)),
  name text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'waitlisted', 'rejected', 'withdrawn')),
  track_id uuid references public.tracks(id) on delete set null,
  school text,
  project_idea text,
  experience_level text check (experience_level in ('beginner', 'intermediate', 'advanced')),
  table_number text,
  notes text,
  checked_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists teams_event_name_unique on public.teams (event_id, lower(name));
create index if not exists teams_event_status_idx on public.teams (event_id, status);

create trigger teams_touch before update on public.teams
  for each row execute function public.touch_updated_at();

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  grade text,
  school text,
  is_captain boolean not null default false,
  tshirt_size text,
  dietary_notes text,
  guardian_name text,
  guardian_email text,
  guardian_phone text,
  checked_in_at timestamptz,
  created_at timestamptz not null default now()
);
-- One person, one team per event.
create unique index if not exists team_members_event_email_unique on public.team_members (event_id, lower(email));
create index if not exists team_members_team_idx on public.team_members (team_id);

alter table public.teams enable row level security;
alter table public.team_members enable row level security;

create policy teams_operator_all on public.teams for all using (public.is_operator()) with check (public.is_operator());
create policy team_members_operator_all on public.team_members for all using (public.is_operator()) with check (public.is_operator());

-- ---------------------------------------------------------------------------
-- Public RPCs
-- ---------------------------------------------------------------------------

-- Registers a team and its members atomically. Returns the team code.
-- p_team:    {"name", "school", "project_idea", "experience_level", "track_id"}
-- p_members: [{"full_name", "email", "phone", "grade", "school", "is_captain",
--              "tshirt_size", "dietary_notes", "guardian_name",
--              "guardian_email", "guardian_phone"}, ...]
create or replace function public.register_team(p_event_slug text, p_team jsonb, p_members jsonb)
returns table (team_code text, team_status text)
language plpgsql security definer set search_path = public as $$
declare
  v_event public.events%rowtype;
  v_count integer;
  v_team_id uuid;
  v_code text;
  v_status text;
  v_active integer;
  v_member jsonb;
  v_email text;
  v_captains integer;
begin
  select * into v_event from public.events where slug = p_event_slug;
  if not found then
    raise exception 'EVENT_NOT_FOUND' using errcode = 'P0001';
  end if;

  if v_event.registration_status not in ('open', 'waitlist') then
    raise exception 'REGISTRATION_CLOSED' using errcode = 'P0001';
  end if;

  if coalesce(trim(p_team->>'name'), '') = '' then
    raise exception 'TEAM_NAME_REQUIRED' using errcode = 'P0001';
  end if;

  if jsonb_typeof(p_members) <> 'array' then
    raise exception 'MEMBERS_REQUIRED' using errcode = 'P0001';
  end if;

  v_count := jsonb_array_length(p_members);
  if v_count < v_event.min_team_size or v_count > v_event.max_team_size then
    raise exception 'TEAM_SIZE_OUT_OF_RANGE' using errcode = 'P0001';
  end if;

  select count(*) into v_captains from jsonb_array_elements(p_members) m
    where coalesce((m->>'is_captain')::boolean, false);
  if v_captains <> 1 then
    raise exception 'EXACTLY_ONE_CAPTAIN' using errcode = 'P0001';
  end if;

  for v_member in select * from jsonb_array_elements(p_members) loop
    v_email := lower(trim(coalesce(v_member->>'email', '')));
    if coalesce(trim(v_member->>'full_name'), '') = '' or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
      raise exception 'MEMBER_INVALID' using errcode = 'P0001';
    end if;
    if exists (select 1 from public.team_members where event_id = v_event.id and lower(email) = v_email) then
      raise exception 'EMAIL_ALREADY_REGISTERED:%', v_email using errcode = 'P0001';
    end if;
  end loop;

  if (select count(distinct lower(trim(m->>'email'))) from jsonb_array_elements(p_members) m) <> v_count then
    raise exception 'DUPLICATE_MEMBER_EMAIL' using errcode = 'P0001';
  end if;

  if exists (select 1 from public.teams where event_id = v_event.id and lower(name) = lower(trim(p_team->>'name'))) then
    raise exception 'TEAM_NAME_TAKEN' using errcode = 'P0001';
  end if;

  select count(*) into v_active from public.teams
    where event_id = v_event.id and status in ('pending', 'approved');

  v_status := case
    when v_event.registration_status = 'waitlist' then 'waitlisted'
    when v_event.max_teams is not null and v_active >= v_event.max_teams then 'waitlisted'
    else 'pending'
  end;

  insert into public.teams (event_id, name, school, project_idea, experience_level, track_id, status)
  values (
    v_event.id,
    trim(p_team->>'name'),
    nullif(trim(p_team->>'school'), ''),
    nullif(trim(p_team->>'project_idea'), ''),
    nullif(p_team->>'experience_level', ''),
    (select t.id from public.tracks t where t.event_id = v_event.id and t.id::text = p_team->>'track_id'),
    v_status
  )
  returning id, code into v_team_id, v_code;

  insert into public.team_members (
    team_id, event_id, full_name, email, phone, grade, school, is_captain,
    tshirt_size, dietary_notes, guardian_name, guardian_email, guardian_phone
  )
  select
    v_team_id, v_event.id,
    trim(m->>'full_name'),
    lower(trim(m->>'email')),
    nullif(trim(m->>'phone'), ''),
    nullif(trim(m->>'grade'), ''),
    nullif(trim(m->>'school'), ''),
    coalesce((m->>'is_captain')::boolean, false),
    nullif(m->>'tshirt_size', ''),
    nullif(trim(m->>'dietary_notes'), ''),
    nullif(trim(m->>'guardian_name'), ''),
    nullif(lower(trim(m->>'guardian_email')), ''),
    nullif(trim(m->>'guardian_phone'), '')
  from jsonb_array_elements(p_members) m;

  return query select v_code, v_status;
end $$;

-- Aggregate counts only — no PII — for "spots left" on the public site.
create or replace function public.event_public_stats(p_event_slug text)
returns table (teams_registered integer, hackers_registered integer, spots_left integer)
language sql stable security definer set search_path = public as $$
  select
    (select count(*)::int from public.teams t where t.event_id = e.id and t.status in ('pending', 'approved')),
    (select count(*)::int from public.team_members m join public.teams t on t.id = m.team_id
       where t.event_id = e.id and t.status in ('pending', 'approved')),
    case when e.max_teams is null then null
         else greatest(0, e.max_teams - (select count(*)::int from public.teams t
                where t.event_id = e.id and t.status in ('pending', 'approved')))
    end
  from public.events e where e.slug = p_event_slug;
$$;

revoke all on function public.register_team(text, jsonb, jsonb) from public;
grant execute on function public.register_team(text, jsonb, jsonb) to anon, authenticated;
grant execute on function public.event_public_stats(text) to anon, authenticated;
grant execute on function public.is_operator() to anon, authenticated;
grant execute on function public.is_owner() to authenticated;

-- ---------------------------------------------------------------------------
-- Seed: Impact Miami 2.0 (facts from the official flyer only)
-- ---------------------------------------------------------------------------

insert into public.events (
  slug, name, edition, tagline, description, starts_at, ends_at,
  venue_name, venue_detail, venue_address, venue_map_url,
  partner_name, prize_summary, prize_detail, contact_email,
  registration_status, min_team_size, max_team_size, is_current
) values (
  'impact-miami-2',
  'Impact Miami',
  '2.0',
  'A one-day youth hackathon building tech for Miami.',
  'Young Coders Initiative presents Impact Miami 2.0, a one-day hackathon where student teams design, build, and pitch projects that make a real difference for Miami communities.',
  '2026-10-25 09:00:00-04',
  '2026-10-25 17:30:00-04',
  'The Cushman School',
  'Middle School',
  '592 NE 60th Street, Miami, FL 33137',
  'https://www.google.com/maps/search/?api=1&query=592+NE+60th+Street+Miami+FL+33137',
  'Big Red Education',
  'Huge cash prize pool',
  'Plus awards for winners.',
  'contact@youngcodersmiami.org',
  'coming_soon',
  1,
  4,
  true
) on conflict (slug) do nothing;

insert into public.schedule_items (event_id, starts_at, ends_at, title, description, location, sort_order)
select id, '2026-10-25 09:00:00-04', '2026-10-25 17:30:00-04', 'Hack day',
  'Doors open at 9:00 AM; awards wrap by 5:30 PM. The detailed run of show is posted here before the event.',
  'The Cushman School, Middle School', 0
from public.events where slug = 'impact-miami-2'
  and not exists (select 1 from public.schedule_items s join public.events e on e.id = s.event_id where e.slug = 'impact-miami-2');

insert into public.faq_items (event_id, question, answer, sort_order)
select e.id, q.question, q.answer, q.sort_order
from public.events e
cross join (values
  ('When and where is Impact Miami 2.0?', 'Sunday, October 25, 2026, from 9:00 AM to 5:30 PM at The Cushman School (Middle School), 592 NE 60th Street, Miami, FL 33137.', 10),
  ('How do I register?', 'Registration is coming soon. When it opens, the Register button on this site goes live, and one teammate registers the whole team.', 20),
  ('What can we win?', 'There is a cash prize pool, plus awards for winning teams.', 30),
  ('Who is running it?', 'Impact Miami 2.0 is presented by the Young Coders Initiative in partnership with Big Red Education.', 40),
  ('Where can I see the last hackathon?', 'The Spring 2026 site is archived at spring2026.youngcodersimpact.com.', 50)
) as q(question, answer, sort_order)
where e.slug = 'impact-miami-2'
  and not exists (select 1 from public.faq_items f where f.event_id = e.id);

-- ---------------------------------------------------------------------------
-- Bootstrap your first owner (run once, by hand, after they sign up):
--
--   insert into public.operators (user_id, email, role)
--   select id, email, 'owner' from auth.users where email = 'you@example.com';
-- ---------------------------------------------------------------------------
