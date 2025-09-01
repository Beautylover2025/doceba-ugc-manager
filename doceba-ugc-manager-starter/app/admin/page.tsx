export const dynamic = 'force-dynamic'

import { serverClient } from '@/lib/supabaseServer'
import { requireAdmin } from '@/lib/auth'

type UploadRow = {
  id: string
  creator_id: string
  program_id: string
  week_index: number
  status: string
  created_at: string
  before_path?: string | null
  after_path?: string | null
}

export default async function AdminDashboard() {
  // Admin-Gate (SSR)
  await requireAdmin()

  const supabase = serverClient()

  // Uploads inkl. Bildpfade holen
  const { data: rows } = await supabase
    .from('uploads')
    .select(
      'id, creator_id, program_id, week_index, status, created_at, before_path, after_path'
    )
    .order('created_at', { ascending: false })
    .limit(200)

  const rawRows = (rows ?? []) as UploadRow[]

  // Helper: signierte URL erzeugen (5 Min gültig)
  async function signedUrl(path?: string | null) {
    if (!path) return null
    const { data, error } = await supabase.storage
      .from('ugc-uploads')
      .createSignedUrl(path, 60 * 5)
    if (error || !data) return null
    return data.signedUrl
  }

  // Für jede Zeile signierte URLs erzeugen
  const enhanced = await Promise.all(
    rawRows.map(async (r) => {
      const beforeUrl = await signedUrl(r.before_path)
      const afterUrl = await signedUrl(r.after_path)
      return { ...r, beforeUrl, afterUrl }
    })
  )

  const total = enhanced.length
  const missing = enhanced.filter((r) => r.status === 'missing').length

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-semibold">Admin-Dashboard</h1>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-2xl border bg-white p-4">
          <div className="text-sm text-gray-600">Uploads gesamt</div>
          <div className="text-2xl font-semibold">{total}</div>
        </div>
        <div className="rounded-2xl border bg-white p-4">
          <div className="text-sm text-gray-600">Noch fehlend</div>
          <div className="text-2xl font-semibold">{missing}</div>
        </div>
      </div>

      <div className="mt-6 overflow-auto rounded-2xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-gray-50">
            <tr>
              <th className="p-2 text-left">Creator</th>
              <th className="p-2 text-left">Programm</th>
              <th className="p-2 text-center">Woche</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Vorher</th>
              <th className="p-2 text-left">Nachher</th>
              <th className="p-2 text-left">Erstellt</th>
            </tr>
          </thead>
          <tbody>
            {enhanced.map((r) => (
              <tr key={r.id} className="border-t align-top">
                <td className="p-2">{r.creator_id.slice(0, 8)}</td>
                <td className="p-2">{r.program_id.slice(0, 8)}</td>
                <td className="p-2 text-center">{r.week_index}</td>
                <td className="p-2">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                    {r.status}
                  </span>
                </td>

                {/* Vorher */}
                <td className="p-2">
                  {r.beforeUrl ? (
                    <div>
                      <img
                        src={r.beforeUrl}
                        alt="Vorher"
                        className="h-24 w-24 rounded object-cover"
                      />
                      <a
                        href={r.beforeUrl}
                        target="_blank"
                        className="mt-1 block text-xs text-blue-600 underline"
                      >
                        Download
                      </a>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">Kein Bild</span>
                  )}
                </td>

                {/* Nachher */}
                <td className="p-2">
                  {r.afterUrl ? (
                    <div>
                      <img
                        src={r.afterUrl}
                        alt="Nachher"
                        className="h-24 w-24 rounded object-cover"
                      />
                      <a
                        href={r.afterUrl}
                        target="_blank"
                        className="mt-1 block text-xs text-blue-600 underline"
                      >
                        Download
                      </a>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">Kein Bild</span>
                  )}
                </td>

                <td className="p-2">{new Date(r.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}

