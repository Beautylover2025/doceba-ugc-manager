// app/page.tsx
import { StatusBanner } from "@/components/creator/StatusBanner";
import UploadCard from "@/components/creator/UploadCard"; // <- Default-Import
import { HistoryCard } from "@/components/creator/HistoryCard";
import { CollaborationCard } from "@/components/creator/CollaborationCard";
import { LevelsWidget } from "@/components/creator/LevelsWidget";
import { getWeekMeta } from "@/lib/weeks";

export default function Page() {
  // MVP: später aus DB
  const programStart = "2025-01-01";
  const { currentWeek, isFirstWeek, endDateLabel } = getWeekMeta(programStart);

  return (
    <main className="min-h-screen bg-gradient-subtle">
      <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8">
        <StatusBanner
          weekNumber={currentWeek}
          endDate={endDateLabel}
          isFirstWeek={isFirstWeek}
        />

        <UploadCard weekNumber={currentWeek} isFirstWeek={isFirstWeek} />

        <HistoryCard />
        <CollaborationCard />
        <LevelsWidget />
      </div>
    </main>
  );
}
