import { redirect } from 'next/navigation'
import { serverClient } from './supabaseServer'   // ← relativer Import!

/**
 * Stellt sicher, dass ein Nutzer eingeloggt ist.
 */
export async function requireUser() {
  const supabase = serverClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return user
}

/**
 * Stellt sicher, dass ein Nutzer Admin-Rechte hat.
 * Kein Admin → Redirect zum Creator-Dashboard.
 */
export async function requireAdmin() {
  const supabase = serverClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/app')
  return user
}
