// app/admin/page.tsx
export const dynamic = 'force-dynamic';

import { requireAdmin } from '@/lib/auth';
import { serverClient } from '@/lib/supabaseServer';
import { KPICard } from '@/components/KPICard';
import { UploadTable } from '@/components/UploadTable';
import type { KPI, UploadRow, UploadStatus } from '@/types/admin';

export default async function AdminDashboard() {
  await requireAdmin();
  const supabase = serverClient();

  const [uploadsCountRes, creatorCountRes, uploadsRes, cpsRes] = await Promise.all([
    supabase.from('uploads').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'creator'),
    supabase
      .from('uploads')
      .select('id, creator_id, program_id, week_index, status, created_at')
      .order('created_at', { ascending: false })
      .limit(200),
    supabase
      .from('creator_programs')
      .select('creator_id, program_id, start_date, programs(weeks)'),
  ]);

  const uploads = uploadsRes.data ?? [];
  const cps = (cpsRes.data ?? []) as {
    creator_id: string;
    program_id: string;
    start_date: string;
    programs?: { weeks: number | null }[];
  }[];

  function currentWeekFor(cp: { start_date: string; programs?: { weeks: number | null }[] }) {
    const start = new Date(cp.start_date);
    const ms = Date.now() - start.getTime();
    const elapsedWeeks = Math.floor(ms / (1000 * 60 * 60 * 24 * 7)) + 1;
    const maxWeeks = cp.programs?.[0]?.weeks ?? 12;
    return Math.max(1, Math.min(elapsedWeeks, maxWeeks));
  }

  let missingThisWeek = 0;
  if (cps.length && uploads.length >= 0) {
    const present = new Set(
      uploads.map((u) => `${u.creator_id}|${u.program_id}|${u.week_index}`)
    );
    for (const cp of cps) {
      const cw = currentWeekFor(cp);
      const key = `${cp.creator_id}|${cp.program_id}|${cw}`;
      if (!present.has(key)) missingThisWeek++;
    }
  }

  // helper: probiere mehrere Dateiendungen, bis eine signierte URL vorhanden ist
  async function signFirst(paths: string[]) {
    for (const p of paths) {
      const { data } = await supabase
        .storage
        .from('ugc-uploads')
        .createSignedUrl(p, 60 * 60);
      if (data?.signedUrl) return data.signedUrl;
    }
    return null;
  }

  const rows: UploadRow[] = [];
  for (const r of uploads) {
    const base = `creator/${r.creator_id}/program/${r.program_id}/week-${r.week_index}`;
    const [beforeUrl, afterUrl] = await Promise.all([
      signFirst([`${base}/before.jpg`, `${base}/before.jpeg`, `${base}/before.png`]),
      signFirst([`${base}/after.jpg`, `${base}/after.jpeg`, `${base}/after.png`]),
    ]);

    rows.push({
      id: r.id,
      creatorId: r.creator_id,
      programId: r.program_id,
      week: r.week_index,
      status: (r.status as UploadStatus) || 'submitted',
      createdAt: r.created_at,
      before: { thumbUrl: beforeUrl, downloadHref: beforeUrl },
      after:  { thumbUrl: afterUrl,  downloadHref: afterUrl  },
    });
  }

  const kpis: KPI[] = [
    { title: 'Creator gesamt', value: creatorCountRes.count ?? 0, variant: 'primary' },
    { title: 'Uploads gesamt', value: uploadsCountRes.count ?? 0, variant: 'success' },
    { title: 'Fehlende Uploads (diese Woche)', value: missingThisWeek, variant: 'warning' },
  ];

  return (
    <main className="mx-auto max-w-7xl p-6 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Upload-Verwaltung</h1>
        <p className="text-gray-500">Übersicht über alle Creator-Uploads und deren Status</p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((k, i) => <KPICard key={i} {...k} />)}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Upload-Übersicht</h2>
        <UploadTable uploads={rows} />
      </section>
    </main>
  );
}
