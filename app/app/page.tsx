import { StatusBanner } from "@/components/creator/StatusBanner";
import { UploadCard } from "@/components/creator/UploadCard";
import { HistoryCard } from "@/components/creator/HistoryCard";
import { CollaborationCard } from "@/components/creator/CollaborationCard";
import { LevelsWidget } from "@/components/creator/LevelsWidget";
import { VideoEmbed } from "@/components/creator/VideoEmbed";
import { FooterSection } from "@/components/creator/FooterSection";

export default function CreatorDashboardPage() {
  // Mock – später aus DB/Supabase
  const currentWeek = 1;
  const endDate = "22.01.2024";
  const isFirstWeek = currentWeek === 1;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Mobile-first Container */}
      <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8">
        <StatusBanner weekNumber={currentWeek} endDate={endDate} isFirstWeek={isFirstWeek} />
        <UploadCard  weekNumber={currentWeek} isFirstWeek={isFirstWeek} />
        <HistoryCard />
        <CollaborationCard />
        <LevelsWidget />
        <VideoEmbed src="https://player.vimeo.com/video/76979871" />
        <FooterSection />
      </div>
    </div>
  );
}
