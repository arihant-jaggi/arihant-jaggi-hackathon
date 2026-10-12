-- Impact Miami 2.0: keep challenge tracks (the prompts) secret until an
-- operator releases them from /ops -> Content -> Tracks.
--
-- Run this BEFORE adding any prompt text: until it runs, tracks are
-- readable by anyone with the public site key.
--
-- This repo is public, so the prompt text itself never lives here. It is
-- entered in /ops or pasted into the SQL editor.

alter table public.events add column if not exists prompts_released boolean not null default false;
alter table public.events add column if not exists prompts_released_at timestamptz;

-- Public can read tracks only once their event's prompts are released;
-- operators can always read them.
drop policy if exists tracks_public_read on public.tracks;
create policy tracks_public_read on public.tracks for select using (
  public.is_operator()
  or exists (
    select 1 from public.events e
    where e.id = tracks.event_id and e.prompts_released
  )
);
