-- Legt das Default-Programm an/aktualisiert es (funktioniert für uuid- und text-id)
do $$
declare
  prog_is_uuid boolean;
  def_uuid     uuid := '00000000-0000-0000-0000-000000000001';
  def_text     text := 'default';
  def_title    text := 'Standard Programm';
  def_slug     text := 'default';
begin
  select (data_type='uuid') into prog_is_uuid
    from information_schema.columns
   where table_schema='public' and table_name='programs' and column_name='id';

  if prog_is_uuid then
    insert into public.programs (id, title, slug, starts_at, weeks, version)
    values (def_uuid, def_title, def_slug, now()::date, 12, 'v1')
    on conflict (id) do update
      set title     = coalesce(public.programs.title    , excluded.title),
          slug      = coalesce(public.programs.slug     , excluded.slug),
          starts_at = coalesce(public.programs.starts_at, excluded.starts_at),
          weeks     = coalesce(public.programs.weeks    , excluded.weeks),
          version   = coalesce(public.programs.version  , excluded.version);
  else
    insert into public.programs (id, title, slug, starts_at, weeks, version)
    values (def_text, def_title, def_slug, now()::date, 12, 'v1')
    on conflict (id) do update
      set title     = coalesce(public.programs.title    , excluded.title),
          slug      = coalesce(public.programs.slug     , excluded.slug),
          starts_at = coalesce(public.programs.starts_at, excluded.starts_at),
          weeks     = coalesce(public.programs.weeks    , excluded.weeks),
          version   = coalesce(public.programs.version  , excluded.version);
  end if;
end $$;

-- (Optional) Standard-Startdatum bei älteren Profilen
update public.profiles
   set program_default_start = coalesce(program_default_start, now()::date);

select pg_notify('pgrst','reload schema');
