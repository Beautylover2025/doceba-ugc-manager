"use client";

import { useState } from "react";
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
  { id: "front",       label: "Front",        required: true },
  { id: "left-cheek",  label: "Linke Wange",  required: true },
  { id: "right-cheek", label: "Rechte Wange", required: true },
  { id: "forehead",    label: "Stirn",        required: true },
  { id: "chin",        label: "Kinn",         required: false },
];

export const UploadCard = ({ weekNumber, isFirstWeek }: { weekNumber: number; isFirstWeek?: boolean }) => {
  const [uploadedPhotos, setUploadedPhotos] = useState<Record<string, File>>({});
  const [note, setNote] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handlePhotoSelect = (slotId: string, file: File) => {
    setUploadedPhotos((prev) => ({ ...prev, [slotId]: file }));
  };

  const handleUpload = async () => {
    const requiredSlots = photoSlots.filter((s) => s.required);
    const hasAllRequired = requiredSlots.every((s) => uploadedPhotos[s.id]);

    if (!hasAllRequired) {
      toast({
        title: "Fehlende Fotos",
        description: "Bitte lade alle erforderlichen Fotos hoch.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    // 👉 Hier später echten Upload/Supabase einhängen
    setTimeout(() => {
      setIsUploading(false);
      toast({
        title: "Erfolgreich hochgeladen!",
        description: `Danke! Dein Set für Woche ${weekNumber} ist gespeichert.`,
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
            const hasPhoto = uploadedPhotos[slot.id];

            return (
              <div key={slot.id} className="relative">
                <label className="block">
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
                    className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all
                      ${status === "success" ? "border-success bg-success/5" :
                        status === "required" ? "border-border hover:border-brand-primary" :
                        "border-muted hover:border-brand-primary/50"}`}
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
                          {!slot.required && <span className="text-muted-foreground"> (optional)</span>}
                        </p>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            );
          })}
        </div>

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
          disabled={isUploading}
          className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
          size="lg"
        >
          {isUploading ? (
            <>
              <Upload className="h-4 w-4 mr-2 animate-spin" />
              Wird hochgeladen…
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Hochladen
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
