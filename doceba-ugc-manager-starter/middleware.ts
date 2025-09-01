import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Hält die Supabase-Auth-Cookies bei jeder Request aktuell (SSR/Edge).
 * Ohne das sieht der Server (requireAdmin) oft keine Session.
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  await supabase.auth.getSession() // refresh cookie, wenn nötig
  return res
}

// Auf alle Seiten anwenden, außer Next-Assets/Favicon.
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
