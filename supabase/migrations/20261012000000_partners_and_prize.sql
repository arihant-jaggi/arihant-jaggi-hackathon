-- Impact Miami 2.0: Founders Future joins as a partner; the cash prize pool
-- is $1,500 so far. Optional: the site already shows these while the
-- database holds the old wording. Safe to re-run.

update public.events
set partner_name  = 'Big Red Education and Founders Future',
    prize_summary = '$1,500 cash prize pool',
    prize_detail  = 'And counting. Plus awards for winners.'
where slug = 'impact-miami-2';

update public.faq_items
set answer = 'A $1,500 cash prize pool so far, plus awards for winning teams.'
where question = 'What can we win?'
  and event_id = (select id from public.events where slug = 'impact-miami-2');

update public.faq_items
set answer = 'Impact Miami 2.0 is presented by the Young Coders Initiative in partnership with Big Red Education and Founders Future.'
where question = 'Who is running it?'
  and event_id = (select id from public.events where slug = 'impact-miami-2');
