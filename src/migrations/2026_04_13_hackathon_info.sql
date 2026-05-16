create extension if not exists "pgcrypto";

create table if not exists hackathon_info (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subtitle text,
  description text,
  location text,
  start_date date,
  end_date date,
  created_at timestamptz not null default now()
);

alter table hackathon_info enable row level security;
create policy hackathon_info_select_all on hackathon_info for select using (true);
create policy hackathon_info_insert_all on hackathon_info for insert with check (true);

insert into hackathon_info (name, subtitle, description, location, start_date, end_date) values
  (
    'Young Coders Miami',
    'A one-day civic hackathon bringing youth technologists together in Miami.',
    'Young Coders Miami is a community-first hackathon that channels youth ingenuity into tech for public good. Teams design, prototype, and pitch high-impact solutions for Miami communities across environmental resilience and public health challenges.',
    'The Cushman School, Play to Learn – 592 NE 60th St, Miami, FL',
    '2026-07-01',
    '2026-07-01'
  );
