create extension if not exists "pgcrypto";

create table if not exists registrations (
  id uuid primary key default gen_random_uuid(),
  leader_name text not null,
  leader_email text not null,
  leader_phone text,
  organization text,
  team_name text,
  team_size smallint not null check (team_size between 1 and 5),
  skills text[] not null default '{}'::text[],
  problem_interest text,
  additional_member_emails text[] not null default '{}'::text[],
  agree_rules boolean not null default false,
  created_at timestamptz not null default now()
);

alter table registrations
  add constraint registration_member_email_count
  check (cardinality(additional_member_emails) = team_size - 1);

alter table registrations enable row level security;

create policy allow_select_all on registrations for select using (true);
create policy allow_insert_all on registrations for insert with check (true);
