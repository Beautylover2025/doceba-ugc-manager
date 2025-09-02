import { StatusBanner } from "@/components/creator/StatusBanner";
import { UploadCard } from "@/components/creator/UploadCard";
import { HistoryCard } from "@/components/creator/HistoryCard";
import { CollaborationCard } from "@/components/creator/CollaborationCard";
import { LevelsWidget } from "@/components/creator/LevelsWidget";
import { VideoEmbed } from "@/components/creator/VideoEmbed";

export default function Page() {
  // Mock-Daten – später per API/Supabase
  const currentWeek = 1;
  const endDate = "22.01.2024";
  const isFirstWeek = currentWeek === 1;

  return (
    <div className="min-h-screen">
      <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Status-Banner */}
        <StatusBanner
          weekNumber={currentWeek}
          endDate={endDate}
          isFirstWeek={isFirstWeek}
        />

        {/* Upload-Bereich */}
        <UploadCard weekNumber={currentWeek} isFirstWeek={isFirstWeek} />

        {/* Verlauf */}
        <HistoryCard />

        {/* Zusammenarbeit / Do's & Don'ts / FAQ */}
        <CollaborationCard />

        {/* Level/Gamification (Platzhalter) */}
        <LevelsWidget />

        {/* Kurz erklärt – Video */}
        <VideoEmbed src="https://player.vimeo.com/video/76979871" />
      </div>
    </div>
  );
}
