-- Stellt started_at in creator_programs sicher (idempotent)
alter table public.creator_programs
  add column if not exists started_at date;

update public.creator_programs
   set started_at = coalesce(started_at, now()::date);

select pg_notify('pgrst','reload schema');
