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

type CreatorProgram = {
  creator_id: string
  program_id: string
  start_date: string | null
  programs: {
    weeks: number | null
  } | null
}

export default async function AdminDashboard() {
  await requireAdmin()
  const supabase = serverClient()

  // Uploads inkl. Bildpfade
  const { data: uploads } = await supabase
    .from('uploads')
    .select(
      'id, creator_id, program_id, week_index, status, created_at, before_path, after_path'
    )
    .order('created_at', { ascending: false })
    .limit(200)
  const rows = (uploads ?? []) as UploadRow[]

  // KPI: Creator gesamt
  const { count: creatorsCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // KPI: Uploads gesamt
  const { count: uploadsCount } = await supabase
    .from('uploads')
    .select('*', { count: 'exact', head: true })

  // KPI: Fehlende Uploads (aktuelle Woche)
  const { data: cpsRaw } = await supabase
    .from('creator_programs')
    .select('creator_id, program_id, start_date, programs(weeks)')
  const { data: allUploads } = await supabase
    .from('uploads')
    .select('creator_id, program_id, week_index')

  // Normalisieren, falls programs als Array zurückkommt
  const cps: CreatorProgram[] = (cpsRaw ?? []).map((cp: any) => {
    const programs = Array.isArray(cp.programs)
      ? { weeks: cp.programs[0]?.weeks ?? null }
      : { weeks: cp.programs?.weeks ?? null }
    return {
      creator_id: cp.creator_id as string,
      program_id: cp.program_id as string,
      start_date: (cp.start_date as string) ?? null,
      programs,
    }
  })

  function currentWeekFor(cp: CreatorProgram) {
    const weeks = cp.programs?.weeks ?? 8
    if (!cp.start_date) return 1
    const start = new Date(cp.start_date).getTime()
    const diffDays = Math.floor((Date.now() - start) / (24 * 60 * 60 * 1000))
    const w = Math.floor(diffDays / 7) + 1
    return Math.min(Math.max(w, 1), weeks)
  }

  let missingThisWeek = 0
  if (cps && allUploads) {
    for (const cp of cps) {
      const cw = currentWeekFor(cp)
      const found = (allUploads ?? []).some(
        (u) =>
          u.creator_id === cp.creator_id &&
          u.program_id === cp.program_id &&
          u.week_index === cw
      )
      if (!found) missingThisWeek++
    }
  }

  // Für Bilder/Downloads nutzen wir die interne API-Route /api/image
  // und übergeben nur den Pfad. Damit vermeiden wir %20/Leerzeichen-Probleme.
  function proxyUrl(path?: string | null) {
    if (!path) return null
    const clean = path.trim()
    return `/api/image?path=${encodeURIComponent(clean)}`
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-semibold">Admin-Dashboard</h1>

      {/* KPI-Kacheln */}
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-2xl border bg-white p-4">
          <div className="text-sm text-gray-600">Creator gesamt</div>
          <div className="text-2xl font-semibold">{creatorsCount ?? 0}</div>
        </div>
        <div className="rounded-2xl border bg-white p-4">
          <div className="text-sm text-gray-600">Uploads gesamt</div>
          <div className="text-2xl font-semibold">{uploadsCount ?? 0}</div>
        </div>
        <div className="rounded-2xl border bg-white p-4">
          <div className="text-sm text-gray-600">
            Fehlende Uploads (aktuelle Woche)
          </div>
          <div className="text-2xl font-semibold">{missingThisWeek}</div>
        </div>
      </div>

      {/* Tabelle mit Thumbnails + Downloadlink (via /api/image) */}
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
            {rows.map((r) => {
              const before = proxyUrl(r.before_path)
              const after = proxyUrl(r.after_path)

              return (
                <tr key={r.id} className="border-t align-top">
                  <td className="p-2">{r.creator_id.slice(0, 8)}</td>
                  <td className="p-2">{r.program_id.slice(0, 8)}</td>
                  <td className="p-2 text-center">{r.week_index}</td>
                  <td className="p-2">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                      {r.status}
                    </span>
                  </td>

                  {/* Vorher-Bild */}
                  <td className="p-2">
                    {before ? (
                      <div>
                        <img
                          src={before}
                          alt="Vorher"
                          className="h-24 w-24 rounded object-cover"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                        <a
                          href={before}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 block text-xs text-blue-600 underline"
                        >
                          Download
                        </a>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Kein Bild</span>
                    )}
                  </td>

                  {/* Nachher-Bild */}
                  <td className="p-2">
                    {after ? (
                      <div>
                        <img
                          src={after}
                          alt="Nachher"
                          className="h-24 w-24 rounded object-cover"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                        <a
                          href={after}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 block text-xs text-blue-600 underline"
                        >
                          Download
                        </a>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Kein Bild</span>
                    )}
                  </td>

                  <td className="p-2">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </main>
  )
}

