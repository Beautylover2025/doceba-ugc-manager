-- Migration: Create accept_consent RPC function
-- Datum: $(date)
-- Beschreibung: Erstellt die accept_consent RPC Funktion für die Einwilligung der Creator

BEGIN;

-- 1. Erstelle accept_consent RPC Funktion
CREATE OR REPLACE FUNCTION public.accept_consent(p_version text DEFAULT 'v1')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Prüfe ob User authentifiziert ist
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;

    -- Füge Einwilligung hinzu (ON CONFLICT ignoriert Duplikate)
    INSERT INTO public.consents (creator_id, version)
    VALUES (auth.uid(), p_version)
    ON CONFLICT (creator_id, version) 
    DO UPDATE SET 
        updated_at = now();
END;
$$;

-- 2. Rechte für authenticated User
GRANT EXECUTE ON FUNCTION public.accept_consent(text) TO authenticated;

COMMIT;
