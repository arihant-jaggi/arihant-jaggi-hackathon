-- Impact Miami 2.0 starts at 9:00 AM, not 9:30. Moves the event start, the
-- opening block, and the FAQ hours. Changes no other data. Safe to re-run.

update public.events
set starts_at = '2026-10-25 09:00:00-04'
where slug = 'impact-miami-2';

update public.schedule_items
set starts_at = '2026-10-25 09:00:00-04'
where title = 'Introduction and Commencement'
  and event_id = (select id from public.events where slug = 'impact-miami-2');

update public.faq_items
set answer = replace(answer, '9:30 AM to 5:30 PM', '9:00 AM to 5:30 PM')
where event_id = (select id from public.events where slug = 'impact-miami-2');
