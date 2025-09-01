import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabaseServer'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path')
  const filename = searchParams.get('filename') ?? (path?.split('/').pop() ?? 'download.bin')

  if (!path) return NextResponse.json({ error: 'Missing path' }, { status: 400 })

  const supabase = serverClient()
  const { data, error } = await supabase.storage.from('ugc-uploads').createSignedUrl(path, 60)
  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: error?.message || 'sign failed' }, { status: 500 })
  }

  const fetchRes = await fetch(data.signedUrl)
  if (!fetchRes.ok) {
    return NextResponse.json({ error: 'fetch failed' }, { status: 500 })
  }

  const contentType = fetchRes.headers.get('Content-Type') ?? 'application/octet-stream'
  const blob = await fetchRes.blob()

  return new Response(blob.stream(), {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  })
}
