// app/consent/page.tsx
export default function ConsentPage() {
  return (
    <main className="min-h-screen bg-gradient-subtle">
      <div className="w-full max-w-3xl mx-auto px-4 py-10">
        <div className="rounded-2xl border bg-card shadow-card p-6">
          <h1 className="text-2xl font-semibold mb-4">Einwilligung & Nutzungsbedingungen</h1>
          <p className="text-sm text-muted-foreground">
            Hier stehen eure Einwilligungs- und Nutzungsbedingungen. Erklärt kurz,
            wofür die Fotos verwendet werden, wie lange sie gespeichert werden
            und wie Creator die Einwilligung widerrufen können.
          </p>

          <div className="mt-6 p-4 rounded-xl bg-primary-subtle border">
            <p className="text-sm">
              Tipp: Die Einwilligung wird im MVP lokal im Browser gespeichert.
              Später speichern wir sie in der Datenbank pro Creator.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
