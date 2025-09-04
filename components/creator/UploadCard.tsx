'use client';

import { useState, useEffect } from "react";
import { Camera, CheckCircle, Upload, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentWeek } from "@/lib/weeks";

async function finalizeStatus(uploadId: string, toast: any) {
  try {
    const { data, error } = await supabase.rpc('finalize_upload_status', {
      p_upload_id: uploadId,
    });
    if (error) {
      console.error('[FINALIZE STATUS] RPC error', error);
      toast({ title: "Fehler", description: "Status-Update fehlgeschlagen (siehe Konsole).", variant: "destructive" });
      return;
    }
    console.log('[FINALIZE STATUS] OK');
    // optional: UI/History refreshen, falls du eine Liste rechts neu laden willst
  } catch (e) {
    console.error('[FINALIZE STATUS] exception', e);
  }
}

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
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [isCheckingConsent, setIsCheckingConsent] = useState(true);

  // Check consent on component mount
  useEffect(() => {
    checkConsent();
  }, []);

  const checkConsent = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setHasConsent(false);
        setIsCheckingConsent(false);
        return;
      }

      // Zunächst localStorage verwenden (MVP)
      const consentKey = `consent_${user.id}`;
      const hasLocalConsent = localStorage.getItem(consentKey) === 'true';
      
      if (hasLocalConsent) {
        setHasConsent(true);
        setIsCheckingConsent(false);
        return;
      }

      // Fallback: Versuche Datenbank-Abfrage (falls Tabelle existiert)
      try {
        const { data, error } = await supabase
          .from('consents')
          .select('*')
          .eq('creator_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.log('Consents table not available, using localStorage fallback');
          setHasConsent(false);
        } else {
          setHasConsent(!!data);
        }
      } catch (dbError) {
        console.log('Database consent check failed, using localStorage fallback');
        setHasConsent(false);
      }
    } catch (error) {
      console.error('Error checking consent:', error);
      setHasConsent(false);
    } finally {
      setIsCheckingConsent(false);
    }
  };

  const handleConsentAgreement = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Nicht eingeloggt", description: "Bitte melde dich an", variant: "destructive" });
        return;
      }

      // Zunächst localStorage verwenden (MVP)
      const consentKey = `consent_${user.id}`;
      localStorage.setItem(consentKey, 'true');
      setHasConsent(true);
      toast({ title: "Einwilligung erteilt", description: "Du kannst jetzt Fotos hochladen" });

      // Fallback: Versuche auch in Datenbank zu speichern (falls Tabelle existiert)
      try {
        const { error } = await supabase
          .from('consents')
          .insert({
            creator_id: user.id,
            version: 'v1'
          });

        if (error) {
          console.log('Database consent save failed, but localStorage saved successfully');
        }
      } catch (dbError) {
        console.log('Database consent save failed, but localStorage saved successfully');
      }
    } catch (error) {
      console.error('Error handling consent:', error);
      toast({ title: "Fehler", description: "Einwilligung konnte nicht gespeichert werden", variant: "destructive" });
    }
  };

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

  const pingStorage = async (creatorId: string): Promise<void> => {
    try {
      console.log('[STORAGE PING] Testing storage access for creator:', creatorId);
      const { data, error } = await supabase.storage.from('ugc').list(`creator/${creatorId}`, { limit: 1 });
      if (error) {
        console.error('[STORAGE PING] Error:', error.message);
      } else {
        console.log('[STORAGE PING] Success - can access storage, found', data?.length || 0, 'items');
      }
    } catch (e) {
      console.error('[STORAGE PING] Exception:', e);
    }
  };

  const debugUpload = async (slot: string, path: string, file: File): Promise<{ data: any; error: any }> => {
    console.log('[UPLOAD] Starting upload for slot:', slot);
    console.log('[UPLOAD] Path:', path);
    console.log('[UPLOAD] File size:', file.size, 'bytes');
    console.log('[UPLOAD] File type:', file.type);

    const { data, error } = await supabase
      .storage
      .from('ugc')
      .upload(path, file, { 
        upsert: true, 
        contentType: file.type ?? 'image/png' 
      });

    if (error) {
      console.error('[UPLOAD ERROR]', slot, error.message);
      alert('Fehler: Upload fehlgeschlagen bei "' + slot + '"');
    } else {
      console.log('[UPLOAD SUCCESS]', slot, 'uploaded to:', data?.path);
    }

    return { data, error };
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
      // Get current week before upload
      const week = await getCurrentWeek(supabase);
      console.log("DEBUG current week:", week);
      
      const [userId, programId] = await Promise.all([fetchUserId(), fetchProgramId()]);
      console.log("DEBUG userId/programId:", userId, programId);

      if (!userId) {
        const msg = "Nicht eingeloggt – bitte neu anmelden.";
        toast({ title: "Nicht eingeloggt", description: msg, variant: "destructive" });
        alert(msg);
        return;
      }

      // Storage-Diagnose vor Upload
      await pingStorage(userId);

      // Hole program_id aus v_compliance oder fallback zu profiles
      let finalProgramId = programId;
      if (!finalProgramId) {
        console.log('[UPLOAD] No program_id from v_compliance, trying profiles fallback');
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('program_default_id')
          .eq('id', userId)
          .single();
        
        if (profileError) {
          console.error('[UPLOAD] Profile fallback error:', profileError);
        } else {
          finalProgramId = profileData?.program_default_id;
          console.log('[UPLOAD] Using program_default_id from profiles:', finalProgramId);
        }
      }

      if (!finalProgramId) {
        const msg = "Kein Programm hinterlegt. Bitte an Support/Admin wenden.";
        toast({ title: "Kein Programm", description: msg, variant: "destructive" });
        alert(msg);
        return;
      }

      // Korrekter Pfad: creator/{creatorId}/week-{weekIndex}/{slot}.png
      const photos: Record<string, string | null> = {
        front: null, "left-cheek": null, "right-cheek": null, forehead: null, chin: null,
      };

      // Upload aller Fotos mit detailliertem Logging
      for (const slot of photoSlots) {
        const f = uploadedPhotos[slot.id];
        if (!f) continue;
        
        const path = `creator/${userId}/week-${week}/${slot.id}.png`;
        const { data, error } = await debugUpload(slot.id, path, f);
        
        if (error) {
          throw new Error(`Upload fehlgeschlagen bei "${slot.label}"`);
        }
        photos[slot.id] = path;
      }

      // Prüfe ob alle erforderlichen Slots erfolgreich hochgeladen wurden
      const requiredCount = requiredSlots.length;
      const uploadedRequired = requiredSlots.filter((s) => !!photos[s.id]).length;
      const status: "complete" | "partial" = uploadedRequired === requiredCount ? "complete" : "partial";

      console.log('[UPLOAD] All uploads successful, upserting into database...');
      
      // Prepare payload for UPSERT
      const payload = {
        creator_id: userId,
        program_id: finalProgramId,
        week_index: week,
        before_path: photos["front"],
        after_path: photos["forehead"],
        left_cheek_path: photos["left-cheek"],
        right_cheek_path: photos["right-cheek"],
        note,
        status: 'partial' as const,
      };
      
      console.log('[UPLOAD] Upsert data:', payload);

      // DB-UPSERT in public.uploads
      const { data: upsertData, error: upsertErr } = await supabase
        .from("uploads")
        .upsert(payload, { onConflict: 'creator_id,program_id,week_index', ignoreDuplicates: false })
        .select()
        .single();

      if (upsertErr) {
        console.error('[UPLOAD] Upsert error:', upsertErr);
        throw new Error(`Datenbank-Fehler: ${upsertErr.message}`);
      }

      console.log('[UPLOAD] Database upsert successful:', upsertData);

      // Finalize upload status
      const insertedId = upsertData?.id;
      if (insertedId) {
        await finalizeStatus(insertedId, toast);
      }

      toast({
        title: "Upload erfolgreich",
        description: `Woche ${week}: ${uploadedRequired}/${requiredCount} gespeichert`,
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

  // Show loading state while checking consent
  if (isCheckingConsent) {
    return (
      <Card className="shadow-card rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Prüfe Einwilligung...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show consent banner if no consent found
  if (!hasConsent) {
    return (
      <Card className="shadow-card rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand-primary" />
            Einwilligung erforderlich
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-xl bg-primary-subtle border">
            <p className="text-sm text-foreground mb-3">
              Um Fotos hochladen zu können, musst du zuerst der Nutzung deiner Bilder zustimmen.
            </p>
            <p className="text-xs text-muted-foreground">
              Deine Fotos werden für die Analyse deines Fortschritts verwendet und sicher gespeichert.
            </p>
          </div>
          <Button 
            onClick={handleConsentAgreement}
            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity" 
            size="lg"
          >
            <Shield className="h-4 w-4 mr-2" />
            Einverstanden
          </Button>
        </CardContent>
      </Card>
    );
  }

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

