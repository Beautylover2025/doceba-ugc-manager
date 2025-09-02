"use client";

import { Calendar } from "lucide-react";

interface StatusBannerProps {
  weekNumber: number;
  endDate: string;
  isFirstWeek?: boolean;
}

export const StatusBanner = ({ weekNumber, endDate, isFirstWeek }: StatusBannerProps) => {
  return (
    <div className="bg-gradient-primary p-6 rounded-2xl shadow-card text-white">
      <div className="flex items-center gap-3 mb-2">
        <Calendar className="h-5 w-5" />
        <h1 className="text-lg font-semibold">Willkommen du SuperUGC</h1>
      </div>

      <p className="text-primary-foreground/90 text-sm">
        {isFirstWeek
          ? "Willkommen! Zeit für dein erstes Baseline-Set. Vergiss nicht: gleiches Licht, gleicher Abstand."
          : `Woche ${weekNumber} läuft. Achte auf konstante Bedingungen. Diese Woche endet am ${endDate}.`}
      </p>
    </div>
  );
};
