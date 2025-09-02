"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type SlotId = "front" | "left-cheek" | "right-cheek" | "forehead" | "chin";

const slots: Array<{ id: SlotId; label: string; required: boolean }> = [
  { id: "front", label: "Front", required: true },
  { id: "left-cheek", label: "Linke Wange", required: true },
  { id: "right-cheek", label: "Rechte Wange", required: true },
  { id: "forehead", label: "Stirn", required: true },
  { id: "chin", label: "Kinn", required: false },
];

// 👉 hier den Ziel-Bucket festlegen
const BUCKET = "ugc"; // <--- nicht "ugc-uploads"

export default function UploadCard({
  weekNumber,
  isFirstWeek,
}: {
  weekNumber: number;
  isFirstWeek?: boolean;
}) {
  const supabase = createClientComponentClient();
  const [files, setFiles] = useState<Record<SlotId, File | null>>({
    front: null,
    "left-cheek": null,
    "right-cheek": null,
    forehead: null,
    chin: null,
  });
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<null | { kind: "ok" | "err"; text: string }>(
    null
  );

  const onPick = (slot: SlotId, file: File | null) => {
    setFiles((p) => ({ ...p, [slot]: file }));
  };

  const validate = () =>
    slots.filter((s) => s.required).every((s) => Boolean(files[s.id]));

  const handleUpload = async () => {
    setMsg(null);

    if (!validate()) {
      setMsg({
        kind: "err",
        text: "Bitte lade alle erforderlichen Fotos hoch (Front, linke/rechte Wange, Stirn).",
      });
      return;
    }

    setBusy(true);
    try {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr || !user) throw new Error("Nicht eingeloggt.");

      const programId = "default";
      const photos: Record<string, string> = {};

      // Dateien in Storage hochladen
      for (const s of slots) {
        const f = files[s.id];
        if (!f) continue;

        const ext = (f.name.split(".").pop() || "jpg").toLowerCase();
        const path = `${user.id}/${programId}/week-${weekNumber}/${s.id}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, f, { upsert: true });

        if (upErr) {
          console.error("Upload error", s.id, upErr);
          throw new Error(`Upload fehlgeschlagen für ${s.label}: ${upErr.message}`);
        }
        photos[s.id] = path;
      }

      // Status ableiten
      const requiredCount = slots.filter((s) => s.required).length;
      const uploadedRequired = slots
        .filter((s) => s.required)
        .filter((s) => photos[s.id]).length;
      const status = uploadedRequired === requiredCount ? "complete" : "partial";

      // 📝 DB-Insert (Kompatibilität: user_id + creator_id; week + week_index)
      const { error: insErr } = await supabase.from("uploads").insert({
        user_id: user.id,
        creator_id: user.id,     // falls dein Admin heute noch 'creator_id' nutzt
        program_id: programId,
        week: weekNumber,
        week_index: weekNumber,  // falls es diese Spalte bei dir gibt
        note,
        photos,                  // JSON-B mit Pfaden
        status,
      });

      if (insErr) {
        console.error("DB insert error", insErr);
        throw new Error(`DB-Eintrag fehlgeschlagen: ${insErr.message}`);
      }

      // Reset + Hinweis
      setFiles({
        front: null,
        "left-cheek": null,
        "right-cheek": null,
        forehead: null,
        chin: null,
      });
      setNote("");
      setMsg({
        kind: "ok",
        text: status === "complete"
          ? `Erfolgreich hochgeladen – Woche ${weekNumber} vollständig.`
          : `Hochgeladen – Woche ${weekNumber} teilweise.`,
      });
    } catch (e: any) {
      setMsg({ kind: "err", text: e?.message || "Upload fehlgeschlagen." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="shadow-card rounded-2xl border bg-card">
      <div className="p-5 border-b">
        <h3 className="text-base font-medium">
          {isFirstWeek ? "Dein Baseline-Set" : "Dein Wochen-Set"}
        </h3>
        <p className="text-sm text-muted-foreground">
          Gleiches Licht, gleicher Abstand, keine Filter
        </p>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {slots.map((s) => {
            const picked = Boolean(files[s.id]);
            return (
              <label
                key={s.id}
                className={`rounded-2xl border-2 border-dashed p-4 text-center cursor-pointer transition ${
                  picked ? "border-green-500 bg-green-50" : "hover:border-primary"
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onPick(s.id, e.target.files?.[0] || null)}
                />
                <div className="space-y-1">
                  <div className="text-xs font-medium">
                    {s.label} {!s.required && <span className="text-muted-foreground">(optional)</span>}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {picked ? "Ausgewählt" : "Datei wählen"}
                  </div>
                </div>
              </label>
            );
          })}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Notizen (optional)</label>
          <textarea
            className="w-full rounded-xl border p-3 outline-none"
            placeholder="Besonderheiten, Änderungen in der Routine, etc."
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={busy}
          className="w-full rounded-xl py-3 bg-gradient-primary text-white font-medium shadow-card disabled:opacity-60"
        >
          {busy ? "Wird hochgeladen..." : "Hochladen"}
        </button>

        {msg && (
          <p className={`text-sm mt-2 ${msg.kind === "ok" ? "text-green-600" : "text-red-600"}`}>
            {msg.text}
          </p>
        )}
      </div>
    </div>
  );
}
