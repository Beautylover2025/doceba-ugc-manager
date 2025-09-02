// app/admin/page.tsx
export const dynamic = 'force-dynamic'

import { requireAdmin } from '@/lib/auth'
import { serverClient } from '@/lib/supabaseServer'
import Link from 'next/link'

// --------- kleine Helfer ----------
function clsx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ')
}
function fmtDate(iso?: string | null) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}
const pillStyles: Record<string, string> = {
  approved: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
  submitted: 'bg-blue-100 text-blue-700 ring-blue-600/20',
  needs_changes: 'bg-amber-100 text-amber-700 ring-amber-600/20',
  rejected: 'bg-rose-100 text-rose-700 ring-rose-600/20',
  partial: 'bg-gray-100 text-gray-700 ring-gray-600/20',
  missing: 'bg-zinc-100 text-zinc-700 ring-zinc-600/20',
}

type UploadRow = {
  id: string
  creator_id: string
  program_id: string
  week_index: number
  status: string | null
  created_at: string
  before_path: string | null
  after_path: string | null
}

// Fallback-Icons (ohne Dependencies), fest dimensioniert
function UsersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      style={{ width: 24, height: 24 }}
      className="shrink-0"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
function UploadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      style={{ width: 24, height: 24 }}
      className="shrink-0"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}
function AlertIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      style={{ width: 24, height: 24 }}
      className="shrink-0"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

// --------- UI-Bausteine (inline, keine extra Files) ----------
function KPICard(props: { title: string; value: string | number; variant?: 'primary' | 'success' | 'warning'; icon: React.ReactNode }) {
  const border =
    props.variant === 'success'
      ? 'border-emerald-200'
      : props.variant === 'warning'
      ? 'border-amber-200'
      : 'border-blue-200'
  const badge =
    props.variant === 'success'
      ? 'text-emerald-700'
      : props.variant === 'warning'
      ? 'text-amber-700'
      : 'text-blue-700'
  return (
    <div className={clsx('rounded-2xl border bg-white p-5 shadow-sm', border)}>
      <div className="flex items-center gap-3">
        <div className={clsx('rounded-xl bg-gray-100 p-2', badge)}>{props.icon}</div>
        <div className="min-w-0">
          <div className="text-sm text-gray-500">{props.title}</div>
          <div className="truncate text-2xl font-semibold">{props.value}</div>
        </div>
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: string | null }) {
  const key = (status ?? 'partial').toLowerCase()
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        pillStyles[key] ?? pillStyles['partial'],
      )}
    >
      {status ?? '—'}
    </span>
  )
}

function Thumb({
  path,
  alt,
}: {
  path: string | null
  alt: string
}) {
  if (!path) return <span className="text-gray-400">Kein Bild</span>
  const src = `/api/image?path=${encodeURIComponent(path)}`
  const dl = `/api/image?path=${encodeURIComponent(path)}&download=1`
  return (
    <div className="flex items-center gap-3">
      {/* Feste Größe damit nichts „explodiert“ – selbst ohne Tailwind */}
      <img
        src={src}
        alt={alt}
        style={{ width: 64, height: 64 }}
        className="h-16 w-16 rounded-md border object-cover"
      />
      <a
        href={dl}
        className="text-sm font-medium text-blue-600 hover:underline"
        target="_blank"
        rel="noreferrer"
      >
        Download
      </a>
    </div>
  )
}

// --------- PAGE ----------
export default async function AdminPage() {
  await requireAdmin()

  const supabase = serverClient()

  // KPI-Zahlen
  const [{ count: creatorCount }, { count: uploadCount }, { count: missingCount }] = await Promise.all([
    supabase.from('profiles').select('id', { head: true, count: 'exact' }).eq('role', 'creator'),
    supabase.from('uploads').select('id', { head: true, count: 'exact' }),
    supabase.from('uploads').select('id', { head: true, count: 'exact' }).eq('status', 'missing'),
  ])

  // Tabellendaten
  const { data: rows } = await supabase
    .from('uploads')
    .select('id, creator_id, program_id, week_index, status, created_at, before_path, after_path')
    .order('created_at', { ascending: false })
    .limit(200)

  return (
    <main className="mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Upload-Verwaltung</h1>
        <p className="text-gray-500">Übersicht über alle Creator-Uploads und deren Status.</p>
      </div>

      {/* KPIs */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <KPICard title="Creator gesamt" value={creatorCount ?? 0} variant="primary" icon={<UsersIcon />} />
        <KPICard title="Uploads gesamt" value={uploadCount ?? 0} variant="success" icon={<UploadIcon />} />
        <KPICard title="Fehlende Uploads" value={missingCount ?? 0} variant="warning" icon={<AlertIcon />} />
      </div>

      {/* Tabelle */}
      <div className="mt-8 overflow-auto rounded-2xl border bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-gray-50 text-left">
            <tr className="text-gray-600">
              <th className="p-3 font-medium">Creator-ID</th>
              <th className="p-3 font-medium">Programm-ID</th>
              <th className="p-3 font-medium">Woche</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Vorher-Bild</th>
              <th className="p-3 font-medium">Nachher-Bild</th>
              <th className="p-3 font-medium">Erstellt</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((r: UploadRow) => (
              <tr key={r.id} className="border-t">
                <td className="p-3 font-mono text-gray-900">{r.creator_id?.slice(0, 8)}</td>
                <td className="p-3 font-mono text-gray-900">{r.program_id?.slice(0, 8)}</td>
                <td className="p-3 text-center">{r.week_index ?? '—'}</td>
                <td className="p-3"><StatusPill status={r.status} /></td>
                <td className="p-3">
                  <Thumb path={r.before_path} alt={`Vorher ${r.creator_id} W${r.week_index}`} />
                </td>
                <td className="p-3">
                  <Thumb path={r.after_path} alt={`Nachher ${r.creator_id} W${r.week_index}`} />
                </td>
                <td className="p-3 text-gray-600">{fmtDate(r.created_at)}</td>
              </tr>
            ))}
            {(!rows || rows.length === 0) && (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={7}>
                  Noch keine Uploads vorhanden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Zurück zum Creator-Bereich (optional) */}
      <div className="mt-6 text-right">
        <Link href="/app" className="text-sm font-medium text-blue-600 hover:underline">
          Zum Creator-Dashboard
        </Link>
      </div>
    </main>
  )
}
