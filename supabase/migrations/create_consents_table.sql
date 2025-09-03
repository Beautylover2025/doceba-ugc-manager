-- Migration: Create consents table
-- Datum: $(date)
-- Beschreibung: Erstellt die consents Tabelle für die Einwilligung der Creator

BEGIN;

-- 1. Erstelle consents Tabelle
CREATE TABLE IF NOT EXISTS public.consents (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    version text NOT NULL DEFAULT 'v1',
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    
    -- Eindeutige Einwilligung pro Creator und Version
    UNIQUE(creator_id, version)
);

-- 2. Erstelle Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_consents_creator_id ON public.consents(creator_id);

-- 3. RLS (Row Level Security) aktivieren
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies erstellen
-- Creator können nur ihre eigenen Einwilligungen sehen/erstellen
CREATE POLICY "consents_select_own" ON public.consents
    FOR SELECT 
    USING (creator_id = auth.uid());

CREATE POLICY "consents_insert_own" ON public.consents
    FOR INSERT 
    WITH CHECK (creator_id = auth.uid());

CREATE POLICY "consents_update_own" ON public.consents
    FOR UPDATE 
    USING (creator_id = auth.uid())
    WITH CHECK (creator_id = auth.uid());

-- 5. Rechte für authenticated User
GRANT SELECT, INSERT, UPDATE ON public.consents TO authenticated;

-- 6. Trigger für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_consents_updated_at 
    BEFORE UPDATE ON public.consents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;
