"use client";

import { useEffect, useState } from "react";
import { Camera, CheckCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface PhotoSlot {
  id: string;
  label: string;
  required: boolean;
}

const photoSlots: PhotoSlot[] = [
  { id: "front", label: "Front", required: true },
  { id: "left-cheek", label: "Linke Wange", required: true },
  { id: "right-cheek", label: "Rechte Wange", required: true },
  { id: "forehead", label: "Stirn", required: true },
  { id: "chin", label: "Kinn", required: false },
];

const CONSENT_KEY = "doceba-consent-v1";

export default function UploadCard({
  weekNumber,
  isFirstWeek,
}: {
  weekNumber: number;
  isFirstWeek?: boolean;
}) {
  const [uploadedPhotos, setUploadedPhotos] = useState<Record<string, File>>({});
  const [note, setNote] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // MVP: Consent aus localStorage laden
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      setConsentAccepted(stored === "1");
    } catch {
      // ignore
    }
  }, []);

  const handlePhotoSelect = (slotId: string, file: File) => {
    setUploadedPhotos((prev) => ({ ...prev, [slotId]: file }));
  };

  const handleConsentToggle = (checked: boolean) => {
    setConsentAccepted(checked);
    try {
      localStorage.setItem(CONSENT_KEY, checked ? "1" : "0");
    } catch {
      // ignore
    }
  };

  const handleUpload = async () => {
    const requiredSlots = photoSlots.filter((slot) => slot.required);
    const hasAllRequired = requiredSlots.every((slot) => uploadedPhotos[slot.id]);

    if (!consentAccepted) {
      toast({
        title: "Einwilligung erforderlich",
        description:
          "Bitte bestätige die Einwilligung & Nutzungsbedingungen, bevor du Bilder hochlädst.",
        variant: "destructive",
      });
      return;
    }

    if (!hasAllRequired) {
      toast({
        title: "Fehlende Fotos",
        description: "Bitte lade alle erforderlichen Fotos hoch.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    // MVP Simulation – hier später Supabase Upload + DB-Record
    setTimeout(() => {
      setIsUploading(false);
      toast({
        title: "Erfolgreich hochgeladen!",
        description: `Danke! Dein Set für Woche ${weekNumber} ist gespeichert.`,
        variant: "default",
      });
      setUploadedPhotos({});
      setNote("");
    }, 1500);
  };

  const getSlotStatus = (slotId: string, required: boolean) => {
    const hasPhoto = uploadedPhotos[slotId];
    if (hasPhoto) return "success";
    if (required) return "required";
    return "optional";
  };

  const requiredSlots = photoSlots.filter((s) => s.required);
  const hasAllRequired = requiredSlots.every((slot) => uploadedPhotos[slot.id]);
  const canUpload = consentAccepted && hasAllRequired && !isUploading;

  return (
    <Card className="shadow-card rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-brand-primary" />
          {isFirstWeek ? "Dein Baseline-Set" : "Dein Wochen-Set"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Gleiches Licht, gleicher Abstand, keine Filter
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Consent Gate */}
        <div className="rounded-2xl border bg-primary-subtle p-3">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4"
              checked={consentAccepted}
              onChange={(e) => handleConsentToggle(e.target.checked)}
            />
            <span className="text-sm">
              Ich habe die{" "}
              <a href="/consent" className="underline text-blue-600">
                Einwilligung & Nutzungsbedingungen
              </a>{" "}
              gelesen und stimme zu.
            </span>
          </label>
        </div>

        {/* Foto-Slots */}
        <div className="grid grid-cols-2 gap-3">
          {photoSlots.map((slot) => {
            const status = getSlotStatus(slot.id, slot.required);
            const hasPhoto = uploadedPhotos[slot.id];

            return (
              <div key={slot.id} className="relative">
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoSelect(slot.id, file);
                    }}
                  />
                  <div
                    className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all
                      ${
                        status === "success"
                          ? "border-success bg-success/5"
                          : status === "required"
                          ? "border-border hover:border-brand-primary"
                          : "border-muted hover:border-brand-primary/50"
                      }`}
                  >
                    {hasPhoto ? (
                      <div className="space-y-2">
                        <CheckCircle className="h-6 w-6 text-success mx-auto" />
                        <p className="text-xs font-medium text-success">{slot.label}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Camera className="h-6 w-6 text-muted-foreground mx-auto" />
                        <p className="text-xs font-medium text-foreground">
                          {slot.label}
                          {!slot.required && (
                            <span className="text-muted-foreground"> (optional)</span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            );
          })}
        </div>

        {/* Notizen */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Notizen (optional)</label>
          <Textarea
            placeholder="Besonderheiten, Änderungen in der Routine, etc..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="resize-none"
            rows={3}
          />
        </div>

        <Button
          onClick={handleUpload}
          disabled={!canUpload}
          className="w-full bg-gradient-primary hover:opacity-90 transition-opacity disabled:opacity-50"
          size="lg"
        >
          {isUploading ? (
            <>
              <Upload className="h-4 w-4 mr-2 animate-spin" />
              Wird hochgeladen...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Hochladen
            </>
          )}
        </Button>

        {!hasAllRequired && (
          <p className="text-xs text-muted-foreground text-center">
            Tipp: Für die Analyse brauchen wir Front, linke/rechte Wange und Stirn.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
