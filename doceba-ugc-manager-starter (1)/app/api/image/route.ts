import { NextResponse } from 'next/server';
import { serverClient } from '../../../lib/supabaseServer';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const path = url.searchParams.get('path');
  if (!path) return new NextResponse('Missing path', { status: 400 });

  const supabase = serverClient();
  const { data, error } = await supabase
    .storage
    .from('ugc-uploads')
    .createSignedUrl(path, 60);

  if (error || !data?.signedUrl) {
    return new NextResponse('Not found', { status: 404 });
  }

  const res = await fetch(data.signedUrl);
  const buf = await res.arrayBuffer();
  return new NextResponse(buf, {
    status: res.status,
    headers: {
      'content-type': res.headers.get('content-type') || 'application/octet-stream',
      'cache-control': 'private, max-age=60',
    },
  });
}
