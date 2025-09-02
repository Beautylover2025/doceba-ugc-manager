// /components/creator/UploadCard.tsx
"use client";
import { useState } from "react";

type PhotoSlot = { id: "front" | "leftCheek" | "rightCheek" | "forehead" | "chin"; label: string; required: boolean };
const photoSlots: PhotoSlot[] = [
  { id: "front", label: "Front", required: true },
  { id: "leftCheek", label: "Linke Wange", required: true },
  { id: "rightCheek", label: "Rechte Wange", required: true },
  { id: "forehead", label: "Stirn", required: true },
  { id: "chin", label: "Kinn", required: false },
];

export default function UploadCard({ weekNumber, isFirstWeek }: { weekNumber: number; isFirstWeek?: boolean }) {
  const [files, setFiles] = useState<Record<PhotoSlot["id"], File | null>>({
    front: null, leftCheek: null, rightCheek: null, forehead: null, chin: null,
  });
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const onPick = (slot: PhotoSlot["id"], f: File | null) =>
    setFiles((p) => ({ ...p, [slot]: f ?? null }));

  const handleUpload = async () => {
    const missing = photoSlots.filter(s => s.required && !files[s.id]);
    if (missing.length) {
      alert("Bitte alle erforderlichen Fotos auswählen.");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("programId", "b5a92338"); // <- falls du eine echte Program-ID hast: hier einsetzen
      fd.append("weekNumber", String(weekNumber));
      fd.append("note", note);
      for (const s of photoSlots) {
        const f = files[s.id];
        if (f) fd.append(s.id, f);
      }

      const res = await fetch("/api/creator/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Upload fehlgeschlagen");

      alert(json.status === "complete" ? "Erfolgreich: Set vollständig!" : "Hochgeladen: Set teilweise.");
      // Reset
      setFiles({ front: null, leftCheek: null, rightCheek: null, forehead: null, chin: null });
      setNote("");
    } catch (e: any) {
      alert(e.message || "Fehler beim Upload.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shadow-card rounded-2xl border border-border bg-card">
      <div className="px-4 pt-4">
        <h3 className="text-base font-semibold"> {isFirstWeek ? "Dein Baseline-Set" : "Dein Wochen-Set"} </h3>
        <p className="text-sm text-muted-foreground mb-4">Gleiches Licht, gleicher Abstand, keine Filter</p>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {photoSlots.map((slot) => (
          <label key={slot.id} className="block border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer hover:border-primary transition">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onPick(slot.id, e.target.files?.[0] ?? null)}
            />
            <div className="text-xs font-medium">
              {slot.label}{!slot.required && <span className="text-muted-foreground"> (optional)</span>}
            </div>
            {files[slot.id] && <div className="mt-2 text-xs text-success">ausgewählt</div>}
          </label>
        ))}
      </div>

      <div className="px-4 pb-4 space-y-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">Notizen (optional)</label>
          <textarea
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            rows={3}
            placeholder="Besonderheiten, Änderungen in der Routine, etc…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={handleUpload}
          disabled={loading}
          className="w-full rounded-xl py-2.5 text-white bg-gradient-primary shadow-card disabled:opacity-70"
        >
          {loading ? "Wird hochgeladen…" : "Hochladen"}
        </button>
      </div>
    </div>
  );
}

