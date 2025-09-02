import Image from "next/image";
import Link from "next/link";
import { serverClient } from "@/lib/supabaseServer";
import { requireAdmin } from "@/lib/auth";
import { Users, Upload, AlertCircle } from "lucide-react";

export const revalidate = 0; // immer frische Daten

type Row = {
  creator_id: string;
  program_id: string | null;
  week_index: number | null;
  status: string | null;
  before_path: string | null;
  after_path: string | null;
  created_at: string | null;
};

export default async function AdminPage() {
  // Nur Admins reinlassen
  await requireAdmin();

  const supabase = serverClient();

  const { data, error } = await supabase
    .from("uploads")
    .select("creator_id, program_id, week_index, status, before_path, after_path, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    throw new Error(error.message);
  }
  const rows: Row[] = data ?? [];

  // KPIs
  const totalUploads = rows.length;
  const uniqueCreators = new Set(rows.map((r) => r.creator_id)).size;
  const missingCount =
    rows.filter((r) => (r.status ?? "").toLowerCase() !== "complete").length;

  const dt = new Intl.DateTimeFormat("de-DE", { dateStyle: "short", timeStyle: "short" });

  return (
    <main className="container-lg py-8">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Upload-Verwaltung</h1>
        <p className="mt-1 text-sm text-slate-600">
          Übersicht über alle Creator-Uploads und deren Status.
        </p>
      </header>

      {/* KPI Cards */}
      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card">
          <div className="card-pad flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-2">
              <Users className="h-5 w-5 text-slate-700" />
            </div>
            <div className="flex-1">
              <div className="text-xs uppercase text-slate-500">Creator gesamt</div>
              <div className="mt-1 text-xl font-semibold">{uniqueCreators}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-pad flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-2">
              <Upload className="h-5 w-5 text-slate-700" />
            </div>
            <div className="flex-1">
              <div className="text-xs uppercase text-slate-500">Uploads gesamt</div>
              <div className="mt-1 text-xl font-semibold">{totalUploads}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-pad flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-2">
              <AlertCircle className="h-5 w-5 text-slate-700" />
            </div>
            <div className="flex-1">
              <div className="text-xs uppercase text-slate-500">Fehlende Uploads</div>
              <div className="mt-1 text-xl font-semibold">{missingCount}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabelle */}
      <section className="card overflow-hidden">
        <div className="card-pad overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>Creator-ID</th>
                <th>Programm-ID</th>
                <th>Woche</th>
                <th>Status</th>
                <th>Vorher-Bild</th>
                <th>Nachher-Bild</th>
                <th>Erstellt</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const isComplete = (r.status ?? "").toLowerCase() === "complete";
                const beforeUrl = r.before_path
                  ? `/api/image?path=${encodeURIComponent(r.before_path)}`
                  : null;
                const afterUrl = r.after_path
                  ? `/api/image?path=${encodeURIComponent(r.after_path)}`
                  : null;

                return (
                  <tr key={`${r.creator_id}-${i}`}>
                    <td className="font-mono text-[13px]">{r.creator_id}</td>
                    <td className="font-mono text-[13px]">{r.program_id ?? "–"}</td>
                    <td>{r.week_index ?? "–"}</td>
                    <td>
                      {isComplete ? (
                        <span className="badge badge-ok">complete</span>
                      ) : (
                        <span className="badge badge-warn">{r.status ?? "unbekannt"}</span>
                      )}
                    </td>
                    <td>
                      {beforeUrl ? (
                        <div className="flex items-center gap-3">
                          {/* Thumbnail */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={beforeUrl}
                            alt="Vorher-Bild"
                            className="h-12 w-12 rounded-md object-cover ring-1 ring-black/10"
                          />
                          <Link
                            className="text-blue-600 underline-offset-2 hover:underline"
                            href={`${beforeUrl}&download=1`}
                          >
                            Download
                          </Link>
                        </div>
                      ) : (
                        <span className="badge badge-muted">Kein Bild</span>
                      )}
                    </td>
                    <td>
                      {afterUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={afterUrl}
                          alt="Nachher-Bild"
                          className="h-12 w-12 rounded-md object-cover ring-1 ring-black/10"
                        />
                      ) : (
                        <span className="badge badge-muted">Kein Bild</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap text-slate-700">
                      {r.created_at ? dt.format(new Date(r.created_at)) : "–"}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    Noch keine Uploads vorhanden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Link zurück zum Creator-Bereich */}
      <div className="container-lg mt-4 px-0">
        <Link href="/app" className="text-blue-600 underline-offset-2 hover:underline">
          Zum Creator-Dashboard
        </Link>
      </div>
    </main>
  );
}
