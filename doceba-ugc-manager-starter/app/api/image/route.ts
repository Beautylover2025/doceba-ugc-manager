import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabaseServer'

/**
 * GET /api/image?path=<storage-path>
 * Erzeugt serverseitig eine signierte URL (5 Min) und leitet dorthin weiter.
 * Beispiel path: "creator/<uid>/program/<pid>/week-1/before-123.jpg"
 */
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('path')
  if (!raw) {
    return NextResponse.json({ error: 'path required' }, { status: 400 })
  }

  // führende/abschließende Whitespace entfernen
  const path = raw.trim()
  const supabase = serverClient()

  const { data, error } = await supabase
    .storage
    .from('ugc-uploads')
    .createSignedUrl(path, 60 * 5)

  if (error || !data?.signedUrl) {
    return NextResponse.json(
      { error: error?.message ?? 'signed url error' },
      { status: 400 }
    )
  }

  // endgültige URL aufräumen, falls irgendwo Whitespace enthalten ist
  const target = data.signedUrl.trim()
  return NextResponse.redirect(target)
}
