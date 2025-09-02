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
  before_path: string | null
  after_path: string | null
}

/* ---------- Inline-Icons im Lovable-Stil (kein externes Paket nötig) ---------- */
function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M16 11c1.657 0 3-1.79 3-4s-1.343-4-3-4-3 1.79-3 4 1.343 4 3 4ZM8 11c1.657 0 3-1.79 3-4S9.657 3 8 3 5 4.79 5 7s1.343 4 3 4Zm8 2c-2.761 0-5 2.239-5 5v1h10v-1c0-2.761-2.239-5-5-5ZM8 13c-3.314 0-6 2.686-6 6v0.5C2 20.776 2.224 21 2.5 21h7" />
    </svg>
  )
}
function UploadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0 4 4m-4-4-4 4M4 20h16" />
    </svg>
  )
}
function AlertIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    </svg>
  )
}

/* ---------- Helfer ---------- */
function statusClasses(status: string) {
  const map: Record<string, string> = {
    missing: 'bg-amber-100 text-amber-800 ring-amber-200',
    submitted: 'bg-sky-100 text-sky-800 ring-sky-200',
    partial: 'bg-indigo-100 text-indigo-800 ring-indigo-200',
    needs_changes: 'bg-yellow-100 text-yellow-800 ring-yellow-200',
    approved: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
    complete: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
    rejected: 'bg-rose-100 text-rose-800 ring-rose-200',
  }
  return (map[status] ?? 'bg-gray-100 text-gray-700 ring-gray-200') + ' ring-1'
}

function imgSrc(path: string | null) {
  if (!path) return null
  return `/api/image?path=${encodeURIComponent(path)}`
}
function downloadHref(path: string | null) {
  if (!path) return '#'
  return `/api/image?path=${encodeURIComponent(path)}&download=1`
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

/* ---------- Lovable-Style KPI Card ---------- */
function KPICard({
  title,
  value,
  icon,
  variant,
}: {
  title: string
  value: number
  icon: 'users' | 'upload' | 'alert'
  variant?: 'primary' | 'success' | 'warning'
}) {
  const Icon =
    icon === 'users' ? UsersIcon : icon === 'upload' ? UploadIcon : AlertIcon

  const theme =
    variant === 'success'
      ? { ring: 'ring-emerald-200', tone: 'text-emerald-600', bg: 'bg-emerald-50' }
      : variant === 'warning'
      ? { ring: 'ring-amber-200', tone: 'text-amber-600', bg: 'bg-amber-50' }
      : { ring: 'ring-blue-200', tone: 'text-blue-600', bg: 'bg-blue-50' }

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-4">
        <div className={`rounded-2xl ${theme.bg} ${theme.ring} p-3`}>
          <Icon className={`h-6 w-6 ${theme.tone}`} />
        </div>
        <div>
          <div className="text-sm text-gray-600">{title}</div>
          <div className="mt-0.5 text-3xl font-semibold">{value}</div>
        </div>
      </div>
    </div>
  )
}

/* ---------- Lovable-Style Upload Table ---------- */
function UploadTable({ uploads }: { uploads: UploadRow[] }) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <div className="px-5 pt-5">
        <h2 className="text-lg font-semibold text-gray-900">Upload-Übersicht</h2>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-5 py-3 font-medium">Creator-ID</th>
              <th className="px-5 py-3 font-medium">Programm-ID</th>
              <th className="px-5 py-3 font-medium">Woche</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Vorher-Bild</th>
              <th className="px-5 py-3 font-medium">Nachher-Bild</th>
              <th className="px-5 py-3 font-medium">Erstellt</th>
            </tr>
          </thead>
          <tbody>
            {uploads.map((r) => {
              const before = imgSrc(r.before_path)
              const after = imgSrc(r.after_path)
              return (
                <tr key={r.id} className="border-t">
                  <td className="px-5 py-4 font-medium text-gray-900">
                    {r.creator_id?.slice(0, 8)}
                  </td>
                  <td className="px-5 py-4 text-gray-700">
                    {r.program_id?.slice(0, 8)}
                  </td>
                  <td className="px-5 py-4 tabular-nums">{r.week_index}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClasses(
                        r.status
                      )}`}
                    >
                      {r.status}
                    </span>
                  </td>

                  {/* Vorher */}
                  <td className="px-5 py-4">
                    {before ? (
                      <div className="flex items-center gap-3">
                        <a
                          href={before}
                          target="_blank"
                          className="block h-16 w-16 overflow-hidden rounded-xl border"
                        >
                          <img
                            src={before}
                            alt="Vorher"
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </a>
                        <a
                          href={downloadHref(r.before_path)}
                          className="inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                          Download
                        </a>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Kein Bild</span>
                    )}
                  </td>

                  {/* Nachher */}
                  <td className="px-5 py-4">
                    {after ? (
                      <div className="flex items-center gap-3">
                        <a
                          href={after}
                          target="_blank"
                          className="block h-16 w-16 overflow-hidden rounded-xl border"
                        >
                          <img
                            src={after}
                            alt="Nachher"
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </a>
                        <a
                          href={downloadHref(r.after_path)}
                          className="inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                          Download
                        </a>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Kein Bild</span>
                    )}
                  </td>

                  <td className="px-5 py-4 text-gray-700">{formatDate(r.created_at)}</td>
                </tr>
              )
            })}

            {uploads.length === 0 && (
              <tr>
                <td className="px-5 py-10 text-center text-gray-500" colSpan={7}>
                  Keine Uploads vorhanden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ---------- Seite ---------- */
export default async function AdminPage() {
  await requireAdmin()

  const supabase = serverClient()
  const { data } = await supabase
    .from('uploads')
    .select(
      'id, creator_id, program_id, week_index, status, created_at, before_path, after_path'
    )
    .order('created_at', { ascending: false })
    .limit(200)

  const uploads = (data ?? []) as UploadRow[]

  const creators = new Set(uploads.map((u) => u.creator_id)).size
  const totalUploads = uploads.length
  const missing = uploads.filter((u) => u.status === 'missing').length

  return (
    <main className="mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Upload-Verwaltung
        </h1>
        <p className="text-gray-600">
          Übersicht über alle Creator-Uploads und deren Status.
        </p>
      </div>

      {/* KPI Cards im Lovable-Stil */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <KPICard title="Creator gesamt" value={creators} icon="users" variant="primary" />
        <KPICard title="Uploads gesamt" value={totalUploads} icon="upload" variant="success" />
        <KPICard title="Fehlende Uploads" value={missing} icon="alert" variant="warning" />
      </div>

      {/* Tabelle */}
      <div className="mt-8">
        <UploadTable uploads={uploads} />
      </div>
    </main>
  )
}
