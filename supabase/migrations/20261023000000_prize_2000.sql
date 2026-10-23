-- Impact Miami 2.0: the cash prize pool is $2,000. Optional: the site
-- already shows this while the database holds the older wording.

update public.events
set prize_summary = '$2,000 cash prize pool',
    prize_detail  = 'And counting. Plus awards for winners.'
where slug = 'impact-miami-2';

update public.faq_items
set answer = 'A $2,000 cash prize pool, plus awards for winning teams.'
where question = 'What can we win?'
  and event_id = (select id from public.events where slug = 'impact-miami-2');
