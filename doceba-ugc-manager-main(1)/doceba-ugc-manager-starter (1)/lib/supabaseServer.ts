import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

// Ebenfalls ohne expliziten SupabaseClient-Typ
export const serverClient = () => createServerComponentClient({ cookies })
