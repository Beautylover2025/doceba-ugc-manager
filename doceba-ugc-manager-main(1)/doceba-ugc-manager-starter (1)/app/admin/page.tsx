export const dynamic = 'force-dynamic';

import { requireAdmin } from '../../lib/auth';
import { serverClient } from '../../lib/supabaseServer';

type Row = {
  id: string;
  creator_id: string;
  program_id: string;
  week_index: number | null;
  status: string | null;
  created_at: string;
  before_path: string | null;
  after_path: string | null;
};

export default async function AdminDashboard() {
  await requireAdmin();

  const supabase = serverClient();

  const { data: rows } = await supabase
    .from('uploads')
    .select('id, creator_id, program_id, week_index, status, created_at, before_path, after_path')
    .order('created_at', { ascending: false })
    .limit(200);

  const list = rows ?? [];

  async function signed(path?: string | null) {
    if (!path) return null;
    const { data, error } = await supabase
      .storage
      .from('ugc-uploads')
      .createSignedUrl(path, 60); // 60s gültig
    if (error) return null;
    return data?.signedUrl ?? null;
  }

  // Signed URLs parallel laden
  const withUrls = await Promise.all(
    list.map(async (r) => ({
      ...r,
      beforeUrl: await signed(r.before_path),
      afterUrl: await signed(r.after_path),
    }))
  );

  const total = withUrls.length;
  const missing = withUrls.filter((r) => (r.status ?? '') === 'missing').length;

  return (
    <main style={{ padding: 16 }}>
      <h1>Admin-Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, maxWidth: 1000 }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Uploads gesamt</div>
          <div style={{ fontSize: 20, fontWeight: 600 }}>{total}</div>
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Noch fehlend</div>
          <div style={{ fontSize: 20, fontWeight: 600 }}>{missing}</div>
        </div>
      </div>

      <div style={{ marginTop: 24, overflow: 'auto', border: '1px solid #e5e7eb', borderRadius: 12 }}>
        <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
          <thead style={{ position: 'sticky', top: 0, background: '#f9fafb' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: 8 }}>Creator</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Programm</th>
              <th style={{ padding: 8 }}>Woche</th>
              <th style={{ padding: 8 }}>Status</th>
              <th style={{ padding: 8 }}>Vorher</th>
              <th style={{ padding: 8 }}>Nachher</th>
              <th style={{ padding: 8 }}>Erstellt</th>
            </tr>
          </thead>
          <tbody>
            {withUrls.map((r) => (
              <tr key={r.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                <td style={{ padding: 8 }}>{r.creator_id.slice(0, 8)}</td>
                <td style={{ padding: 8 }}>{r.program_id.slice(0, 8)}</td>
                <td style={{ padding: 8, textAlign: 'center' }}>{r.week_index ?? '-'}</td>
                <td style={{ padding: 8 }}>
                  <span style={{ fontSize: 12, background: '#f3f4f6', padding: '2px 6px', borderRadius: 999 }}>
                    {r.status ?? '-'}
                  </span>
                </td>
                <td style={{ padding: 8 }}>
                  {r.beforeUrl ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <img
                        src={r.beforeUrl}
                        alt="Vorher"
                        width={64}
                        height={64}
                        style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb' }}
                      />
                      <a href={r.beforeUrl} download>
                        Download
                      </a>
                    </div>
                  ) : (
                    'Kein Bild'
                  )}
                </td>
                <td style={{ padding: 8 }}>
                  {r.afterUrl ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <img
                        src={r.afterUrl}
                        alt="Nachher"
                        width={64}
                        height={64}
                        style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb' }}
                      />
                      <a href={r.afterUrl} download>
                        Download
                      </a>
                    </div>
                  ) : (
                    'Kein Bild'
                  )}
                </td>
                <td style={{ padding: 8 }}>
                  {new Date(r.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
