'use client';

import { useState } from "react";
import { Camera, CheckCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

interface PhotoSlot { id: string; label: string; required: boolean; }

const photoSlots: PhotoSlot[] = [
  { id: "front",       label: "Front",       required: true },
  { id: "left-cheek",  label: "Linke Wange", required: true },
  { id: "right-cheek", label: "Rechte Wange",required: true },
  { id: "forehead",    label: "Stirn",       required: true },
  { id: "chin",        label: "Kinn",        required: false },
];

export default function UploadCard({ weekNumber, isFirstWeek }: { weekNumber: number; isFirstWeek?: boolean }) {
  const { toast } = useToast();
  const [uploadedPhotos, setUploadedPhotos] = useState<Record<string, File>>({});
  const [note, setNote] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const onSelect = (slotId: string, f?: File | null) => {
    if (!f) return;
    setUploadedPhotos((prev) => ({ ...prev, [slotId]: f }));
  };

  const getSlotStatus = (slotId: string, required: boolean) => {
    const has = uploadedPhotos[slotId];
    if (has) return "success";
    if (required) return "required";
    return "optional";
  };

  const fetchProgramId = async (): Promise<string | null> => {
    const { data, error } = await supabase.from("v_compliance").select("program_id").single();
    if (error) { console.error("v_compliance read error", error); return null; }
    return data?.program_id ?? null;
  };

  const fetchUserId = async (): Promise<string | null> => {
    const { data, error } = await supabase.auth.getUser();
    if (error) { console.error("auth.getUser error", error); return null; }
    return data.user?.id ?? null;
  };

  const fileNameFor = (slotId: string) => {
    switch (slotId) {
      case "front":       return "front.png";
      case "left-cheek":  return "left-cheek.png";
      case "right-cheek": return "right-cheek.png";
      case "forehead":    return "forehead.png";
      case "chin":        return "chin.png";
      default:            return `${slotId}.png`;
    }
  };

  const handleUpload = async () => {
    const requiredSlots = photoSlots.filter((s) => s.required);
    const missing = requiredSlots.filter((s) => !uploadedPhotos[s.id]);
    if (missing.length) {
      const msg = "Es fehlen noch: " + missing.map((m) => m.label).join(", ");
      toast({ title: "Bitte vollständige Bilder hochladen", description: msg, variant: "destructive" });
      alert(msg); // Fallback sichtbar
      return;
    }

    setIsUploading(true);
    try {
      const [userId, programId] = await Promise.all([fetchUserId(), fetchProgramId()]);
      console.log("DEBUG userId/programId:", userId, programId);

      if (!userId) {
        const msg = "Nicht eingeloggt – bitte neu anmelden.";
        toast({ title: "Nicht eingeloggt", description: msg, variant: "destructive" });
        alert(msg);
        return;
      }
      if (!programId) {
        const msg = "Kein Programm hinterlegt. Bitte an Support/Admin wenden.";
        toast({ title: "Kein Programm", description: msg, variant: "destructive" });
        alert(msg);
        return;
      }

      const prefix = `creator/${userId}/program/${programId}/week-${weekNumber}`;

      const photos: Record<string, string | null> = {
        front: null, "left-cheek": null, "right-cheek": null, forehead: null, chin: null,
      };

      for (const slot of photoSlots) {
        const f = uploadedPhotos[slot.id];
        if (!f) continue;
        const path = `${prefix}/${fileNameFor(slot.id)}`;
        const { error: upErr } = await supabase.storage.from("ugc").upload(path, f, { upsert: true });
        if (upErr) {
          console.error("Upload error", slot.id, upErr);
          throw new Error(`Upload fehlgeschlagen bei "${slot.label}"`);
        }
        photos[slot.id] = path;
      }

      const requiredCount = requiredSlots.length;
      const uploadedRequired = requiredSlots.filter((s) => !!photos[s.id]).length;
      const status: "complete" | "partial" = uploadedRequired === requiredCount ? "complete" : "partial";

      const { error: insErr } = await supabase.from("uploads").insert({
        creator_id: userId,
        program_id: programId,                // ⬅️ jetzt gesetzt
        week_index: weekNumber,
        before_path: photos["front"],
        after_path: photos["forehead"],       // ⬅️ sinnvoller Platzhalter
        note,
        status,
      });

      if (insErr) {
        console.error("insert uploads error", insErr);
        throw new Error(insErr.message);
      }

      toast({
        title: "Upload erfolgreich",
        description: `Woche ${weekNumber}: ${uploadedRequired}/${requiredCount} gespeichert`,
      });
      alert("Upload erfolgreich ✅");

      setUploadedPhotos({});
      setNote("");
    } catch (e: any) {
      console.error("UPLOAD FAILED", e);
      toast({ title: "Fehler beim Hochladen", description: e?.message ?? String(e), variant: "destructive" });
      alert(`Fehler: ${e?.message ?? String(e)}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="shadow-card rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-brand-primary" />
          {isFirstWeek ? "Dein Baseline-Set" : "Dein Wochen-Set"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">Gleiches Licht, gleicher Abstand, keine Filter</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {photoSlots.map((slot) => {
            const status = getSlotStatus(slot.id, slot.required);
            const has = uploadedPhotos[slot.id];
            return (
              <label key={slot.id} className="relative block">
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => onSelect(slot.id, e.target.files?.[0] ?? null)} />
                <div className={[
                  "border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all",
                  status === "success" ? "border-success bg-success/5"
                  : status === "required" ? "border-border hover:border-brand-primary"
                  : "border-muted hover:border-brand-primary/50",
                ].join(" ")}>
                  {has ? (
                    <>
                      <CheckCircle className="h-6 w-6 text-success mx-auto" />
                      <p className="text-xs font-medium text-success">{slot.label}</p>
                    </>
                  ) : (
                    <>
                      <Camera className="h-6 w-6 text-muted-foreground mx-auto" />
                      <p className="text-xs font-medium text-foreground">
                        {slot.label}{!slot.required && <span className="text-muted-foreground"> (optional)</span>}
                      </p>
                    </>
                  )}
                </div>
              </label>
            );
          })}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Notizen (optional)</label>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="resize-none"
            placeholder="Besonderheiten, Änderungen in der Routine, etc..." />
        </div>

        <Button onClick={handleUpload} disabled={isUploading}
          className="w-full bg-gradient-primary hover:opacity-90 transition-opacity" size="lg">
          {isUploading ? (<><Upload className="h-4 w-4 mr-2 animate-spin" /> Wird hochgeladen...</>)
                      : (<><Upload className="h-4 w-4 mr-2" /> Hochladen</>)}
        </Button>
      </CardContent>
    </Card>
  );
}

