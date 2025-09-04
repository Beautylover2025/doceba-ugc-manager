"use client";

import { StatusBanner } from "@/components/creator/StatusBanner";
import UploadCard from "@/components/creator/UploadCard"; // <- Default-Import
import { HistoryCard } from "@/components/creator/HistoryCard";
import { CollaborationCard } from "@/components/creator/CollaborationCard";
import { LevelsWidget } from "@/components/creator/LevelsWidget";
import { getWeekMeta, getCurrentWeek } from "@/lib/weeks";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function Page() {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [isFirstWeek, setIsFirstWeek] = useState(true);
  const [endDateLabel, setEndDateLabel] = useState("");
  const [weeksDone, setWeeksDone] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeekData = async () => {
      try {
        // Get current week from v_compliance
        const week = await getCurrentWeek(supabase);
        setCurrentWeek(week);

        // Get weeks_done from v_compliance
        const { data: complianceData, error } = await supabase
          .from("v_compliance")
          .select("weeks_done")
          .single();

        if (!error && complianceData?.weeks_done !== undefined) {
          setWeeksDone(complianceData.weeks_done);
        }

        // Calculate week metadata
        const programStart = "2025-01-01";
        const { isFirstWeek: firstWeek, endDateLabel: endDate } = getWeekMeta(programStart);
        setIsFirstWeek(firstWeek);
        setEndDateLabel(endDate);
      } catch (error) {
        console.error("Error fetching week data:", error);
        // Fallback to default values
        const programStart = "2025-01-01";
        const { currentWeek: fallbackWeek, isFirstWeek: firstWeek, endDateLabel: endDate } = getWeekMeta(programStart);
        setCurrentWeek(fallbackWeek);
        setIsFirstWeek(firstWeek);
        setEndDateLabel(endDate);
      } finally {
        setLoading(false);
      }
    };

    fetchWeekData();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-subtle">
        <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8">
          <div className="text-center py-8">Lade Dashboard...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-subtle">
      <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8">
        <StatusBanner
          weekNumber={currentWeek}
          endDate={endDateLabel}
          isFirstWeek={isFirstWeek}
        />

        <UploadCard weekNumber={currentWeek} isFirstWeek={isFirstWeek} />

        <HistoryCard weeksDone={weeksDone} currentWeek={currentWeek} />
        <CollaborationCard />
        <LevelsWidget />
      </div>
    </main>
  );
}
