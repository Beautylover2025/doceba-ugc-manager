'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Supabase-Client für Client Components.
 * Setzt/aktualisiert die Auth-Cookies automatisch (über auth-helpers),
 * sodass der Server (requireAdmin) die Session sieht.
 */
export const supabase: SupabaseClient = createClientComponentClient()
