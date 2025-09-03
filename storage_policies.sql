-- Storage Policies für ugc Bucket
-- Diese Policies stellen sicher, dass Benutzer nur auf ihre eigenen Dateien zugreifen können
-- Pfad-Format: creator/{user_id}/week-{week}/...

-- 1. Policy für INSERT (Upload)
CREATE POLICY "ugc_insert_own_prefix" ON storage.objects
FOR INSERT 
WITH CHECK (
  bucket_id = 'ugc'
  AND split_part(name, '/', 1) = 'creator'
  AND split_part(name, '/', 2) = auth.uid()::text
);

-- 2. Policy für SELECT (Download/List)
CREATE POLICY "ugc_select_own_prefix" ON storage.objects
FOR SELECT 
USING (
  bucket_id = 'ugc'
  AND split_part(name, '/', 1) = 'creator'
  AND split_part(name, '/', 2) = auth.uid()::text
);

-- 3. Policy für UPDATE (Überschreiben)
CREATE POLICY "ugc_update_own_prefix" ON storage.objects
FOR UPDATE 
USING (
  bucket_id = 'ugc'
  AND split_part(name, '/', 1) = 'creator'
  AND split_part(name, '/', 2) = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'ugc'
  AND split_part(name, '/', 1) = 'creator'
  AND split_part(name, '/', 2) = auth.uid()::text
);

-- 4. Policy für DELETE (Löschen)
CREATE POLICY "ugc_delete_own_prefix" ON storage.objects
FOR DELETE 
USING (
  bucket_id = 'ugc'
  AND split_part(name, '/', 1) = 'creator'
  AND split_part(name, '/', 2) = auth.uid()::text
);

-- Falls Policies bereits existieren, können Sie sie mit DROP POLICY entfernen:
-- DROP POLICY IF EXISTS "ugc_insert_own_prefix" ON storage.objects;
-- DROP POLICY IF EXISTS "ugc_select_own_prefix" ON storage.objects;
-- DROP POLICY IF EXISTS "ugc_update_own_prefix" ON storage.objects;
-- DROP POLICY IF EXISTS "ugc_delete_own_prefix" ON storage.objects;
