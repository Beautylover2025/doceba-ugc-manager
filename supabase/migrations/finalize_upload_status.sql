-- finalize_upload_status: setzt uploads.status von 'partial' auf 'complete',
-- wenn alle Pflichtfelder vorhanden sind.
-- Diese Version berücksichtigt beide mögliche Schemas:
--   a) Einzel-Spalten: before_path, after_path, left_cheek_path, right_cheek_path
--   b) JSONB 'photos' mit Keys 'left-cheek' und 'right-cheek'

create or replace function public.finalize_upload_status(p_upload_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  -- Fall a) Einzel-Spalten
  update public.uploads
     set status = 'complete'
   where id = p_upload_id
     and status = 'partial'
     and before_path is not null
     and after_path  is not null
     and (
           -- wenn linke/rechte Wange Spalten existieren
           (select coalesce(
              (select true
                 from information_schema.columns
                where table_name = 'uploads' and column_name = 'left_cheek_path'
              ), false
            )) = false
         or (left_cheek_path is not null and right_cheek_path is not null)
         );

  -- Fall b) JSONB 'photos' (optional)
  update public.uploads
     set status = 'complete'
   where id = p_upload_id
     and status = 'partial'
     and exists (
       select 1
         from information_schema.columns
        where table_name = 'uploads'
          and column_name = 'photos'
     )
     and photos is not null
     and ((photos::jsonb) ? 'left-cheek')
     and ((photos::jsonb) ? 'right-cheek');
end;
$$;

-- Rechte für authenticated-User (damit Client rpc() aufrufen darf)
grant execute on function public.finalize_upload_status(uuid) to authenticated;
