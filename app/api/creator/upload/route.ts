// /app/api/creator/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

type SlotId = "front" | "leftCheek" | "rightCheek" | "forehead" | "chin";
const REQUIRED_SLOTS: SlotId[] = ["front", "leftCheek", "rightCheek", "forehead"]; // chin optional
const BUCKET = "ugc";                    // <- Storage-Bucket-Name (öffentlich)

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const programId = String(form.get("programId") ?? "default");
  const weekNumber = Number(form.get("weekNumber") ?? 1);
  const note = String(form.get("note") ?? "");

  const slots: Record<SlotId, { uploaded: boolean; path?: string }> = {
    front: { uploaded: false },
    leftCheek: { uploaded: false },
    rightCheek: { uploaded: false },
    forehead: { uploaded: false },
    chin: { uploaded: false },
  };

  // Upload jedes vorhandenen Files
  for (const key of Object.keys(slots) as SlotId[]) {
    const file = form.get(key) as File | null;
    if (!file || file.size === 0) continue;

    const arrayBuf = await file.arrayBuffer();
    const bytes = Buffer.from(arrayBuf);
    const ext = (file.type?.split("/")[1] || "jpg").replace("jpeg", "jpg");
    const path = `${user.id}/${programId}/week-${weekNumber}/${key}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, bytes, {
        cacheControl: "3600",
        contentType: file.type || "image/jpeg",
        upsert: true,
      });

    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    slots[key] = { uploaded: true, path };
  }

  // Status bestimmen
  const hasAllRequired = REQUIRED_SLOTS.every((s) => slots[s].uploaded);
  const status: "complete" | "partial" = hasAllRequired ? "complete" : "partial";

  // ⚠️ Tabelle anpassen, falls dein Name anders ist!
  // Vorschlag: "creator_uploads"
  const { error: insErr } = await supabase.from("creator_uploads").insert({
    creator_id: user.id,
    program_id: programId,
    week: weekNumber,
    note,
    status,
    files: slots, // JSONB
  });

  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, status, slots });
}
