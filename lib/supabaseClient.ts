'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Kein expliziter Type! Inferenz passt hier perfekt.
export const supabase = createClientComponentClient()
