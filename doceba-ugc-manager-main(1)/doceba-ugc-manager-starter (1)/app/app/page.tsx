import Link from 'next/link'

export default function CreatorDashboard() {
  return (
    <main className="container">
      <h1 className="header">Creator-Dashboard</h1>
      <p className="subtle">Willkommen im Doceba-Labor. Lade deine wöchentlichen Vorher/Nachher-Bilder hoch.</p>

      <div className="grid grid-2" style={{marginTop:'.75rem'}}>
        <Link href="/app/upload/1" className="card">
          <div className="kpi">
            <span className="label">Woche 1</span>
            <span className="value">Vorher/Nachher + Notiz</span>
          </div>
        </Link>

        <Link href="/app/learn" className="card">
          <div className="kpi">
            <span className="label">Lernbereich</span>
            <span className="value">Best Practices & Hinweise</span>
          </div>
        </Link>
      </div>

      <p style={{marginTop:'1rem'}}>
        Admin?&nbsp;<a href="/admin">Zum Admin-Dashboard</a>
      </p>
    </main>
  )
}
