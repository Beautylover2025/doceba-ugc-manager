import { redirect } from 'next/navigation'
import { serverClient } from '@/lib/supabaseServer'

/**
 * Stellt sicher, dass ein Nutzer eingeloggt ist.
 * Wenn nicht, erfolgt ein Redirect zur Login-Seite.
 */
export async function requireUser() {
  const supabase = serverClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return user
}

/**
 * Stellt sicher, dass ein Nutzer Admin-Rechte hat.
 * Falls nicht eingeloggt, Weiterleitung zum Login.
 * Falls kein Admin, Weiterleitung zum Creator-Dashboard.
 *
 * Debug-Version: Schreibt User-ID, Profil und Fehler ins Log.
 */
export async function requireAdmin() {
  const supabase = serverClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.log('ADMIN_CHECK: Kein User – redirect /login')
    redirect('/login')
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Debug-Log: Zeigt User-ID, Profil und evtl. Fehler an
  console.log('ADMIN_CHECK:', {
    user: user.id,
    profile,
    error
  })

  if (!profile || profile.role !== 'admin') {
    redirect('/app')
  }

  return user
}
