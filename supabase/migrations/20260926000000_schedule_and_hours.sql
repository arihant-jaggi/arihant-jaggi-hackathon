-- Impact Miami 2.0: event hours are 9:30 AM – 5:30 PM, and the run of show
-- follows the Spring 2026 format, starting at 9:30 with longer pitch time.
-- Safe to re-run: it replaces this event's schedule and hours each time.

-- Short italic note shown under a schedule block ("Grab your badge…").
alter table public.schedule_items add column if not exists highlight text;

update public.events
set starts_at = '2026-10-25 09:30:00-04',
    ends_at   = '2026-10-25 17:30:00-04'
where slug = 'impact-miami-2';

delete from public.schedule_items
where event_id = (select id from public.events where slug = 'impact-miami-2');

insert into public.schedule_items (event_id, starts_at, ends_at, title, description, location, highlight, sort_order)
select e.id, s.starts_at::timestamptz, s.ends_at::timestamptz, s.title, s.description, 'The Cushman School, Middle School', s.highlight, s.sort_order
from public.events e
cross join (values
  ('2026-10-25 09:30:00-04', '2026-10-25 10:00:00-04',
   'Introduction and Commencement',
   'Welcome to the hackathon. Opening remarks, formal introduction of the event, and a walkthrough of the challenge prompt, rules, and expectations for the day.',
   'Grab your badge, connect to WiFi, and settle in before we kick things off.', 10),
  ('2026-10-25 10:00:00-04', '2026-10-25 12:30:00-04',
   'Project Building — Morning Session',
   'Teams get to work building their solutions. Use this time to design, develop, and iterate. Mentors will be available to assist regarding technical and device issues.',
   'First block of build time before Lunch. Hit the ground running!', 20),
  ('2026-10-25 12:30:00-04', '2026-10-25 13:00:00-04',
   'Lunch Break (OPTIONAL)',
   'Take a break, recharge, and connect with other teams. Lunch is provided for all participants.',
   'Pizza provided for all participants.', 30),
  ('2026-10-25 13:00:00-04', '2026-10-25 15:30:00-04',
   'Project Building & Pitch Creation — Afternoon Session',
   'Back to building. Final stretch before presentations begin. Use this time to polish your demo, finalize your pitch deck, and prepare your story.',
   'Two and a half hours left to build. Start thinking about your pitch and finalizing pitch decks.', 40),
  ('2026-10-25 15:30:00-04', '2026-10-25 16:45:00-04',
   'Pitch Presentations',
   'Teams present their projects to the judging panel. Each team will have a 5 minute window to pitch followed by 2 minutes of Q&A from the judges.',
   'Each team has 5 minutes to present followed by 2 minutes of Q&A from the judges. Your pitch should cover the problem you identified, who it affects, a walkthrough of your solution, the tech you used, and your vision for where it goes next. Transitions between teams are kept to 2 minutes so be ready before your slot. The 6 minute presentation window is a hard cutoff.', 50),
  ('2026-10-25 16:45:00-04', '2026-10-25 17:30:00-04',
   'Final Judging and Awards',
   'Judges deliberate and final scores are tallied. Winners are announced and recognized. Closing remarks to follow.',
   'Winners announced live. Stick around for the closing ceremony with awards provided to winning recipients.', 60)
) as s(starts_at, ends_at, title, description, highlight, sort_order)
where e.slug = 'impact-miami-2';

update public.faq_items
set answer = 'Sunday, October 25, 2026, from 9:30 AM to 5:30 PM at The Cushman School (Middle School), 592 NE 60th Street, Miami, FL 33137.'
where question = 'When and where is Impact Miami 2.0?'
  and event_id = (select id from public.events where slug = 'impact-miami-2');
