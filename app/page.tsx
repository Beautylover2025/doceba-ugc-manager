// app/page.tsx
import { StatusBanner } from "@/components/creator/StatusBanner";
import UploadCard from "@/components/creator/UploadCard"; // <-- Default-Import
import { HistoryCard } from "@/components/creator/HistoryCard";
import { CollaborationCard } from "@/components/creator/CollaborationCard";
import { LevelsWidget } from "@/components/creator/LevelsWidget";

export default function Page() {
  // Mock: kommt später aus der DB
  const currentWeek = 1;
  const endDate = "22.01.2024";
  const isFirstWeek = currentWeek === 1;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8">
        <StatusBanner weekNumber={currentWeek} endDate={endDate} isFirstWeek={isFirstWeek} />
        <UploadCard weekNumber={currentWeek} isFirstWeek={isFirstWeek} />
        <HistoryCard />
        <CollaborationCard />
        <LevelsWidget />
      </div>
    </div>
  );
}
