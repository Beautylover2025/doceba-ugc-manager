-- Stellt die Struktur von "programs" sicher (idempotent)
alter table public.programs
  add column if not exists title     text,
  add column if not exists slug      text,
  add column if not exists starts_at date,
  add column if not exists weeks     integer,
  add column if not exists version   text;

alter table public.programs
  alter column weeks   set default 12,
  alter column version set default 'v1';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'programs_slug_key') then
    alter table public.programs add constraint programs_slug_key unique (slug);
  end if;
end $$;

select pg_notify('pgrst','reload schema');
