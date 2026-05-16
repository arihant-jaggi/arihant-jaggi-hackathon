create extension if not exists "pgcrypto";

create table if not exists challenges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  tagline text,
  description text not null,
  context text,
  solution_ideas text[],
  focus_areas text[],
  category text,
  icon text,
  created_at timestamptz not null default now()
);

alter table challenges enable row level security;
create policy challenges_select_all on challenges for select using (true);
create policy challenges_insert_all on challenges for insert with check (true);

insert into challenges (slug, title, tagline, description, context, solution_ideas, focus_areas, category, icon) values
  (
    'clean-water-living-bay',
    'Clean Water, Living Bay',
    'Detect, understand, and reduce water pollution before it turns into algae blooms or ecosystem damage.',
    'Build technology that helps Miami communities detect, understand, and reduce water pollution before it turns into algae blooms, fish kills, or long-term ecosystem damage.',
    'Projects could focus on community reporting, nutrient monitoring, early-warning systems, public dashboards, or tools that help residents, schools, and local agencies take action around water quality in canals, neighborhoods, and Biscayne Bay. Miami-Dade encourages reporting of algae blooms and fish kills, and NOAA/county sources describe nutrient pollution and rising indicators as contributors to eutrophication.',
    '{"Community water quality reporting tools","Nutrient monitoring dashboards","Algae bloom early-warning systems","Public data visualization for Biscayne Bay"}',
    '{"IoT","AI","Data Analytics","Environmental","Climate"}',
    'Environmental',
    'Droplets'
  ),
  (
    'flood-ready-neighborhoods',
    'Flood-Ready Neighborhoods',
    'Help residents, businesses, and community groups plan for storms, flooding, and rising seas.',
    'Build technology that helps residents, small businesses, and community groups prepare for and respond to street flooding, king tides, stormwater issues, and sea level rise.',
    'Ideas could include hyperlocal flood alerts, safer route planning, block-by-block risk maps, resilience planning tools, or systems that make neighborhood flooding easier to report and visualize. Miami-Dade shares official resources around sea level rise, flooding, and neighborhood vulnerability, including tidal vulnerability viewers and FEMA maps.',
     '{"Hyperlocal flood alert systems","Safer route planning during floods","Block-by-block risk mapping","Neighborhood flood reporting"}',
     '{"GIS","Data Analytics","Community Engagement"}',
     'Climate',
     'Waves'
   ),
  (
    'heat-safe-miami',
    'Heat-Safe Miami',
    'Help people stay safe, connected, and healthy during extreme heat events.',
    'Build technology that helps people stay safe, connected, and healthy during extreme heat, especially outdoor workers, older adults, families, and other vulnerable residents. Projects could explore cooling access maps, hydration alerts, shade-first walking routes, multilingual outreach, workplace safety tools, or neighborhood heat resource platforms.',
    'Miami-Dade runs an official Heat Season from May 1 to October 31 and invests in heat support for small businesses, highlighting the importance of keeping vulnerable residents cool and hydrated.',
    '{"Cooling access & shade maps","Hydration alert systems","Multilingual heat safety outreach","Workplace safety tools for outdoor workers"}',
    '{"Sensors","UX","Public Health","Mobile"}',
    'Public Health',
    'Flame'
  );

create table if not exists site_details (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  value text not null,
  icon text,
  created_at timestamptz not null default now()
);

alter table site_details enable row level security;
create policy site_details_select_all on site_details for select using (true);
create policy site_details_insert_all on site_details for insert with check (true);

insert into site_details (label, value, icon) values
  ('Venue', 'The Cushman School, Play to Learn', 'MapPin'),
  ('Date', 'July 1, 2026', 'Calendar'),
  ('Duration', '6–8 Hours', 'Clock'),
  ('Team Size', '2–5 Members', 'Users');

create table if not exists site_highlights (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  icon text,
  created_at timestamptz not null default now()
);

alter table site_highlights enable row level security;
create policy site_highlights_select_all on site_highlights for select using (true);
create policy site_highlights_insert_all on site_highlights for insert with check (true);

insert into site_highlights (title, description, icon) values
  (
    'Real Impact',
    'Your solutions address actual problems faced by Miami communities today.',
    'Zap'
  ),
  (
    'Network',
    'Connect with civic leaders, engineers, and changemakers.',
    'Globe'
  ),
  (
    'Learn & Grow',
    'Gain hands-on experience with cutting-edge tech for social good.',
    'GraduationCap'
  );

create table if not exists skills (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

alter table skills enable row level security;
create policy skills_select_all on skills for select using (true);
create policy skills_insert_all on skills for insert with check (true);

insert into skills (name) values
  ('Frontend'),
  ('Backend'),
  ('AI/ML'),
  ('Data Science'),
  ('IoT'),
  ('Design'),
  ('Mobile'),
  ('DevOps'),
  ('Other');

create table if not exists project_submissions (
  id uuid primary key default gen_random_uuid(),
  team_name text not null,
  project_title text not null,
  problem_slug text,
  summary text,
  github text,
  demo text,
  created_at timestamptz not null default now()
);

alter table project_submissions enable row level security;
create policy project_submissions_select_all on project_submissions for select using (true);
create policy project_submissions_insert_all on project_submissions for insert with check (true);

create table if not exists environments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  summary text,
  description text,
  notable_tags text[],
  resources text,
  created_at timestamptz not null default now()
);

alter table environments enable row level security;
create policy environments_select_all on environments for select using (true);
create policy environments_insert_all on environments for insert with check (true);

insert into environments (name, summary, description, notable_tags, resources) values
  (
    'Environmental',
    'Solutions that protect waterways and natural ecosystems.',
    'Contributors can build community reporting, sensor-driven monitoring, and analytics experiences that translate data into action to prevent algae blooms and fish kills.',
    '{"IoT","Data Analytics","Sensors","Public Dashboards"}',
    'Miami-Dade water quality dashboards, NOAA nutrient indicators, and local algae bloom reporting channels.'
  ),
  (
    'Resilience',
    'Tools that help neighborhoods respond to flooding and climate stress.',
    'Focus on real-time alerts, safer routing, neighborhood reporting, and data visualization to keep communities safer during king tides and storm events.',
    '{"Flood Monitoring","GIS","Mobile Alerts","Community Ops"}',
    'Miami-Dade Sea Level Rise Viewer, FEMA Flood Maps, and local resilience planning resources.'
  );

create table if not exists event_schedule (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start_at timestamptz,
  end_at timestamptz,
  location text,
  highlight text,
  created_at timestamptz not null default now()
);

alter table event_schedule enable row level security;
create policy schedule_select_all on event_schedule for select using (true);
create policy schedule_insert_all on event_schedule for insert with check (true);

insert into event_schedule (title, description, start_at, end_at, location, highlight) values
  (
    'Registration & Breakfast',
    'Grab your badge, hit the WiFi, and settle into your workspace before the opening remarks.',
    '2026-07-01T08:00:00Z',
    '2026-07-01T09:00:00Z',
    'The Cushman School, Play to Learn Lobby',
    'High-Speed WiFi, power outlets, and snacks provided.'
  ),
  (
    'Opening Ceremony & Kickoff',
    'Introductory remarks, rules review, and team spotlight before hacking begins.',
    '2026-07-01T09:15:00Z',
    '2026-07-01T10:00:00Z',
    'Play to Learn Auditorium',
    'Leaders share what to expect, followed by a challenge briefing.'
  );

create table if not exists venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  description text,
  map_url text,
  map_embed_url text,
  amenities text[],
  parking_details text,
  what_to_bring text,
  created_at timestamptz not null default now()
);

alter table venues enable row level security;
create policy venues_select_all on venues for select using (true);
create policy venues_insert_all on venues for insert with check (true);

insert into venues (name, address, description, map_url, map_embed_url, amenities, parking_details, what_to_bring) values
  (
    'The Cushman School, Play to Learn',
    '592 NE 60th St, Miami, FL',
    'Power outlets, WiFi, and flexible workstations in a bright, educational setting.',
    'https://www.google.com/maps/place/592+NE+60th+St,+Miami,+FL',
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3591.5!2d-80.19!3d25.83!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88d9b1743de9ef15%3A0x6e1e5e1f1e1e1e!2s592+NE+60th+St%2C+Miami%2C+FL!5e0!3m2!1sen!2sus!4v1',
    '{"High-Speed WiFi","Workstations","Power Outlets","Food & Beverages"}',
    'On-site parking is available for participants.',
    'Your own laptop, charger, and any hardware you plan to use. We provide power outlets, WiFi, and workspace.'
  );

create table if not exists judges_mentors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  title text,
  role text,
  description text,
  type text,
  created_at timestamptz not null default now()
);

alter table judges_mentors enable row level security;
create policy judges_select_all on judges_mentors for select using (true);
create policy judges_insert_all on judges_mentors for insert with check (true);

insert into judges_mentors (name, title, role, description, type) values
  (
    'Judge TBA',
    'Lead Judge',
    'Lead Judge',
    'Details coming soon. Check back closer to the event for our full judging panel.',
    'judge'
  ),
  (
    'Mentor TBA',
    'Technical Mentor',
    'Technical Mentor',
    'Details coming soon. We''re assembling an amazing team of mentors to guide you.',
    'mentor'
  );

create table if not exists faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  created_at timestamptz not null default now()
);

alter table faqs enable row level security;
create policy faqs_select_all on faqs for select using (true);
create policy faqs_insert_all on faqs for insert with check (true);

insert into faqs (question, answer) values
  (
    'How can I ask a question before registering?',
    'Email us at contact@youngcodersmiami.org or use the Contact Us form. Our team typically replies within 24 hours.'
  ),
  (
    'What should I bring to the hackathon?',
    'Bring your own laptop, charger, and any hardware you plan to use. Power, WiFi, and snacks are provided on-site.'
  );

create table if not exists contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  subject text,
  message text,
  created_at timestamptz not null default now()
);

alter table contact_submissions enable row level security;
create policy contact_submissions_select_all on contact_submissions for select using (true);
create policy contact_submissions_insert_all on contact_submissions for insert with check (true);

create table if not exists contact_details (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  email text,
  phone text,
  platform text,
  url text,
  details text,
  created_at timestamptz not null default now()
);

alter table contact_details enable row level security;
create policy details_select_all on contact_details for select using (true);
create policy details_insert_all on contact_details for insert with check (true);

insert into contact_details (label, email, phone, platform, url, details) values
  (
    'Primary',
    'contact@youngcodersmiami.org',
    null,
    'email',
    'mailto:contact@youngcodersmiami.org',
    'General inbox for questions, registration, and partnership inquiries.'
  ),
  (
    'Venue',
    null,
    null,
    'location',
    'https://www.google.com/maps/place/592+NE+60th+St,+Miami,+FL',
    'The Cushman School, Play to Learn — 592 NE 60th St, Miami, FL.'
  ),
  (
    'Instagram',
    null,
    null,
    'social',
    'https://instagram.com/youngcodersmiami',
    'Follow us for event updates and behind-the-scenes content.'
  ),
  (
    'LinkedIn',
    null,
    null,
    'social',
    'https://linkedin.com/company/youngcodersmiami',
    'Connect with the organizers and mentor network.'
  ),
  (
    'Twitter',
    null,
    null,
    'social',
    'https://twitter.com/youngcodersmia',
    'Quick status updates and announcements from the team.'
  );
