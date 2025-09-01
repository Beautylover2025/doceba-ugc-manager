export const dynamic = 'force-dynamic'

import { requireAdmin } from '@/lib/auth'
import { serverClient } from '@/lib/supabaseServer'

type UploadRow = {
  id: string
  creator_id: string
  program_id: string
  week_index: number | null
  status: string | null
  created_at: string
  before_path: string | null
  after_path: string | null
}

async function signedUrl(path: string | null) {
  if (!path) return null
  const supabase = serverClient()
  const { data } = await supabase.storage.from('ugc-uploads').createSignedUrl(path, 180)
  return data?.signedUrl ?? null
}

export default async function AdminDashboard() {
  await requireAdmin()
  const supabase = serverClient()

  const { data: uploads } = await supabase
    .from('uploads')
    .select('id, creator_id, program_id, week_index, status, created_at, before_path, after_path')
    .order('created_at', { ascending: false })
    .limit(200)

  const total = uploads?.length ?? 0
  const missing = (uploads ?? []).filter(u => (u.before_path == null || u.after_path == null)).length

  const rows = await Promise.all(
    (uploads ?? []).map(async (u) => ({
      ...u,
      beforeUrl: await signedUrl(u.before_path),
      afterUrl: await signedUrl(u.after_path)
    }))
  )

  return (
    <main className="container">
      <h1 className="header">Admin-Dashboard</h1>

      <div className="grid grid-4" style={{marginTop:'.5rem'}}>
        <div className="card kpi"><span className="label">Uploads gesamt</span><span className="value">{total}</span></div>
        <div className="card kpi"><span className="label">Fehlende Bilder</span><span className="value">{missing}</span></div>
      </div>

      <div className="card" style={{marginTop:'1rem', overflow:'auto'}}>
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th>Creator</th>
              <th>Programm</th>
              <th>Woche</th>
              <th>Status</th>
              <th>Vorher</th>
              <th>Nachher</th>
              <th>Erstellt</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.creator_id.slice(0,8)}</td>
                <td>{r.program_id.slice(0,8)}</td>
                <td>{r.week_index ?? '-'}</td>
                <td><span className="badge">{r.status ?? '—'}</span></td>
                <td>
                  {r.beforeUrl
                    ? <div style={{display:'flex', alignItems:'center', gap:'.5rem'}}>
                        <img src={r.beforeUrl} alt="Vorher" className="img-thumb" />
                        <a className="btn" href={`/api/image?path=${encodeURIComponent(r.before_path!)}&filename=${encodeURIComponent(`before-${r.creator_id}-w${r.week_index ?? ''}.jpg`)}`}>Download</a>
                      </div>
                    : <span className="subtle">Kein Bild</span>
                  }
                </td>
                <td>
                  {r.afterUrl
                    ? <div style={{display:'flex', alignItems:'center', gap:'.5rem'}}>
                        <img src={r.afterUrl} alt="Nachher" className="img-thumb" />
                        <a className="btn" href={`/api/image?path=${encodeURIComponent(r.after_path!)}&filename=${encodeURIComponent(`after-${r.creator_id}-w${r.week_index ?? ''}.jpg`)}`}>Download</a>
                      </div>
                    : <span className="subtle">Kein Bild</span>
                  }
                </td>
                <td>{new Date(r.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
