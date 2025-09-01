import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabaseServer'

export async function GET(req: NextRequest){
  const path = req.nextUrl.searchParams.get('path')
  if(!path) return NextResponse.json({ error: 'path required' }, { status: 400 })

  const supabase = serverClient()
  const { data, error } = await supabase
    .storage
    .from('ugc-uploads')
    .createSignedUrl(path, 60 * 5) // 5 Minuten gültig

  if(error || !data) {
    return NextResponse.json({ error: error?.message ?? 'signed url error' }, { status: 400 })
  }

  // Umleiten zur signierten URL
  return NextResponse.redirect(data.signedUrl)
}
