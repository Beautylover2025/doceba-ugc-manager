import Link from 'next/link';

export default function CreatorDashboard() {
  return (
    <main className="grid min-h-[80vh] place-items-center p-6">
      <div className="w-full max-w-2xl rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Creator‑Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Willkommen im Doceba‑Labor. Lade deine wöchentlichen Vorher/Nachher‑Bilder hoch.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link href="/app/upload/1" className="rounded-xl border p-4 hover:bg-gray-50">
            <div className="text-lg font-medium">Woche 1 hochladen</div>
            <div className="text-sm text-gray-600">Vorher/Nachher + Notiz</div>
          </Link>
          <Link href="/app/learn" className="rounded-xl border p-4 hover:bg-gray-50">
            <div className="text-lg font-medium">Lernbereich</div>
            <div className="text-sm text-gray-600">Best Practices & Hinweise</div>
          </Link>
        </div>
        <p className="mt-6 text-sm text-gray-600">
          Admin? <a className="text-blue-600 underline" href="/admin">Zum Admin‑Dashboard</a>
        </p>
      </div>
    </main>
  );
}
