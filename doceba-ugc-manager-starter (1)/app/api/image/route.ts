export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { serverClient } from '../../../lib/supabaseServer' // relativ importieren!

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path')
  if (!path) {
    return NextResponse.json({ error: 'missing path' }, { status: 400 })
  }

  const supabase = serverClient()
  const { data, error } = await supabase
    .storage
    .from('ugc-uploads')
    .createSignedUrl(path, 60)

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: error?.message ?? 'no url' }, { status: 400 })
  }

  return NextResponse.redirect(data.signedUrl)
}
