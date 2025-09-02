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

// ► neuer Bucket
const BUCKET = "ugc";

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
        text:
          "Bitte lade alle erforderlichen Fotos hoch (Front, linke/rechte Wange, Stirn).",
      });
      return;
    }

    setBusy(true);
    try {
      // 1) User laden
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr || !user) throw new Error("Nicht eingeloggt.");

      // 2) Program ID – vorerst nicht in die Tabelle schreiben (deine Spalte ist UUID)
      const programIdForPath = "default";

      // 3) Dateien in Storage hochladen
      const photos: Record<string, string> = {};
      for (const s of slots) {
        const f = files[s.id];
        if (!f) continue;

        const ext = (f.name.split(".").pop() || "jpg").toLowerCase();
        const path = `${user.id}/${programIdForPath}/week-${weekNumber}/${s.id}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, f, { upsert: true });

        if (upErr) {
          console.error("Upload error", s.id, upErr);
          throw new Error(`Upload
