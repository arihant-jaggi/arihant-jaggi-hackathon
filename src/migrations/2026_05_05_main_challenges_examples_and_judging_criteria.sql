-- Add "main/highlighted" toggle to challenges
alter table if exists challenges
  add column if not exists is_main boolean not null default false;

-- Example / inspiration items for challenges
create table if not exists challenge_examples (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenges(id) on delete cascade,
  title text not null,
  description text,
  link text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists challenge_examples_challenge_id_idx on challenge_examples(challenge_id);
create index if not exists challenge_examples_sort_idx on challenge_examples(challenge_id, sort_order, created_at);

alter table challenge_examples enable row level security;
create policy challenge_examples_select_all on challenge_examples for select using (true);
create policy challenge_examples_insert_all on challenge_examples for insert with check (true);
create policy challenge_examples_update_all on challenge_examples for update using (true) with check (true);
create policy challenge_examples_delete_all on challenge_examples for delete using (true);

-- Judging criteria content (admin-managed)
create table if not exists judging_criteria (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  points integer not null default 0,
  what_to_assess text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists judging_criteria_sort_idx on judging_criteria(sort_order, created_at);

alter table judging_criteria enable row level security;
create policy judging_criteria_select_all on judging_criteria for select using (true);
create policy judging_criteria_insert_all on judging_criteria for insert with check (true);
create policy judging_criteria_update_all on judging_criteria for update using (true) with check (true);
create policy judging_criteria_delete_all on judging_criteria for delete using (true);

-- Seed criteria (idempotent via title uniqueness)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'judging_criteria_title_unique') then
    alter table judging_criteria add constraint judging_criteria_title_unique unique (title);
  end if;
end $$;

insert into judging_criteria (title, points, what_to_assess, sort_order)
values
  (
    'Community Impact & Social Responsibility',
    25,
    'Solution addresses a real, pressing problem affecting Miami residents or vulnerable communities.\nSolution demonstrates clear and intentional benefit to populations that are underserved, marginalized, or disproportionately affected.\nSolution specifies who it serves, why that population was chosen, and what meaningful difference it makes in their lives.',
    10
  ),
  (
    'Scalability & Real-World Viability',
    15,
    'Solution has a realistic path beyond the hackathon through adoption by community organizations, city agencies, schools, or independent deployment.\nTeam has considered sustainability, potential users, and how the solution could grow or be maintained over time.',
    20
  ),
  (
    'Technical Execution',
    15,
    'Solution is functional and works as described during the presentation.\nAppropriate technologies, APIs, datasets, or tools are used effectively.\nImplementation reflects genuine technical effort within the hackathon timeframe.',
    30
  ),
  (
    'Technical Depth',
    15,
    'Team demonstrates strong understanding of what they built.\nSolution reflects meaningful complexity, thoughtful architecture, or impressive engineering given the constraints of the event.',
    40
  ),
  (
    'Originality & Novelty',
    10,
    'Idea and approach are creative, distinct, and not a direct replica of an existing tool or platform.\nSolution tackles the problem in a way that is inventive or uniquely suited to the Miami context.',
    50
  ),
  (
    'Vision & Entrepreneurial Thinking',
    10,
    'Team demonstrates a compelling vision for where this project goes next.\nConsideration has been given to users, adoption, potential partnerships, or long-term sustainability beyond the event.',
    60
  ),
  (
    'Presentation & Storytelling',
    10,
    'Team clearly communicates the problem, solution, and design logic behind their project.\nPitch is structured, engaging, and accessible to a non-technical audience.\nPresenters demonstrate awareness of the broader context and implications of their work.',
    70
  )
on conflict (title) do update set
  points = excluded.points,
  what_to_assess = excluded.what_to_assess,
  sort_order = excluded.sort_order;

