export default function UploadWeekPage({ params }: { params: { week: string } }) {
  return (
    <main className="container">
      <h1 className="header">Upload – Woche {params.week}</h1>
      <p className="subtle">Platzhalter. Upload-Form folgt.</p>
    </main>
  )
}
