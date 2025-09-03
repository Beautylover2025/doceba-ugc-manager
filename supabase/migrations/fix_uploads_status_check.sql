-- Migration: Fix uploads table status column constraint
-- Datum: $(date)
-- Beschreibung: Entfernt bestehenden uploads_status_check und setzt korrekten Constraint für ('partial','complete')

BEGIN;

-- 1. Entferne bestehenden uploads_status_check Constraint (falls vorhanden)
DO $$ 
BEGIN
    -- Prüfe ob Constraint existiert und entferne ihn
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'uploads_status_check' 
        AND table_name = 'uploads' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.uploads DROP CONSTRAINT uploads_status_check;
        RAISE NOTICE 'Bestehender uploads_status_check Constraint entfernt';
    ELSE
        RAISE NOTICE 'Kein uploads_status_check Constraint gefunden';
    END IF;
END $$;

-- 2. Setze Spalte status auf TEXT mit Default 'partial'
ALTER TABLE public.uploads 
ALTER COLUMN status SET DEFAULT 'partial';

-- 3. Erstelle neuen uploads_status_check Constraint mit korrekten Werten
ALTER TABLE public.uploads 
ADD CONSTRAINT uploads_status_check 
CHECK (status IN ('partial', 'complete'));

-- 4. Optional: Update bestehende NULL-Werte auf 'partial'
UPDATE public.uploads 
SET status = 'partial' 
WHERE status IS NULL;

-- 5. Setze Spalte als NOT NULL (falls sie es noch nicht ist)
DO $$
BEGIN
    -- Prüfe ob Spalte bereits NOT NULL ist
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'uploads' 
        AND column_name = 'status' 
        AND table_schema = 'public'
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE public.uploads ALTER COLUMN status SET NOT NULL;
        RAISE NOTICE 'Spalte status auf NOT NULL gesetzt';
    ELSE
        RAISE NOTICE 'Spalte status ist bereits NOT NULL';
    END IF;
END $$;

-- 6. Zeige aktuelle Tabellenstruktur an
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'uploads' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. Zeige Constraints an
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'uploads' 
AND tc.table_schema = 'public'
AND tc.constraint_type = 'CHECK';

COMMIT;

-- Erfolgsmeldung
DO $$
BEGIN
    RAISE NOTICE 'Migration erfolgreich abgeschlossen: uploads_status_check auf (''partial'',''complete'') gesetzt';
END $$;
