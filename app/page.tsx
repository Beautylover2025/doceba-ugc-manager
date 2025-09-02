// app/page.tsx
export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { serverClient } from '@/lib/supabaseServer'

export default async function Index() {
  const supabase = serverClient()

  // 1) User holen
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2) Rolle aus profiles lesen
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // 3) Routing nach Rolle
  if (profile?.role === 'admin') {
    redirect('/admin')
  }

  // Fallback: Creator
  redirect('/app')
}
