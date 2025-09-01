import { serverClient } from '@/lib/supabaseServer'
import { requireAdmin } from '@/lib/auth'

export default async function AdminDashboard(){
  await requireAdmin()
  const supabase = serverClient()
  const { data: rows } = await supabase
    .from('uploads')
    .select('id, creator_id, program_id, week_index, status, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  const total   = rows?.length ?? 0
  const missing = rows?.filter(r => r.status === 'missing').length ?? 0

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
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="p-2 text-left">Creator</th>
              <th className="p-2 text-left">Programm</th>
              <th className="p-2">Woche</th>
              <th className="p-2">Status</th>
              <th className="p-2">Erstellt</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map(r => (
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.creator_id.slice(0,8)}</td>
                <td className="p-2">{r.program_id.slice(0,8)}</td>
                <td className="p-2 text-center">{r.week_index}</td>
                <td className="p-2"><span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{r.status}</span></td>
                <td className="p-2">{new Date(r.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
