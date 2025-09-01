import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

/**
 * Erstellt einen Supabase-Client für Server-Komponenten.
 * Wird in Server Actions wie dem Admin-Dashboard benutzt.
 */
export const serverClient = () => createServerComponentClient({ cookies });
