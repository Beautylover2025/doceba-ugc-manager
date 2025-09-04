-- Erzeugt die View (genau 1 Zeile je Creator)
drop view if exists public.v_compliance cascade;

create view public.v_compliance
(creator_id, current_week, weeks_done) as
select
  p.id as creator_id,
  greatest(
    1,
    1 + floor( ( (now()::date - coalesce(p.program_default_start::date, now()::date)) / 7.0 ) )
  )::int as current_week,
  coalesce(
    count(distinct case when u.status = 'complete' then u.week_index end),
    0
  )::int as weeks_done
from public.profiles p
left join public.uploads u
  on u.creator_id = p.id
where p.id = auth.uid()
group by p.id, p.program_default_start;

grant select on public.v_compliance to authenticated;

select pg_notify('pgrst','reload schema');
