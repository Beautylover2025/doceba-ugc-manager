"use client";

import { Calendar, ChevronRight, StickyNote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getWeekMeta } from "@/lib/weeks";

type WeekStatus = "complete" | "partial" | "missing" | "offen";

interface WeekEntry {
  week: number;
  date: string;
  status: WeekStatus;
  hasNote: boolean;
}

interface HistoryCardProps {
  weeksDone: number;
  currentWeek: number;
}

const StatusBadge = ({ status }: { status: WeekStatus }) => {
  if (status === "complete") return <Badge className="bg-success text-success-foreground">Vollständig</Badge>;
  if (status === "partial")  return <Badge className="bg-warning text-warning-foreground">Teilweise</Badge>;
  if (status === "offen") return <Badge className="bg-blue-500 text-white">Offen</Badge>;
  return <Badge variant="outline" className="text-muted-foreground">Fehlend</Badge>;
};

export const HistoryCard = ({ weeksDone, currentWeek }: HistoryCardProps) => {
  // Calculate the open week (weeks_done + 1)
  const openWeek = weeksDone + 1;
  
  // Only show the open week if it's within the current week range
  if (openWeek > currentWeek) {
    return (
      <Card className="shadow-card rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-brand-primary" />
            Verlauf
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">Noch keine offene Woche verfügbar</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate the date for the open week
  const programStart = "2025-01-01";
  const weekStart = new Date(programStart);
  weekStart.setDate(weekStart.getDate() + (openWeek - 1) * 7);
  const weekDate = weekStart.toLocaleDateString("de-DE");

  const openWeekEntry: WeekEntry = {
    week: openWeek,
    date: weekDate,
    status: "offen",
    hasNote: false,
  };

  return (
    <Card className="shadow-card rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-brand-primary" />
          Verlauf
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-2xl border hover:bg-muted/50 cursor-pointer transition-colors">
            <div className="text-sm">
              <p className="font-medium">Woche {openWeekEntry.week}</p>
              <p className="text-muted-foreground">{openWeekEntry.date}</p>
            </div>

            <div className="flex items-center gap-2">
              {openWeekEntry.hasNote && <StickyNote className="h-4 w-4 text-muted-foreground" />}
              <StatusBadge status={openWeekEntry.status} />
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
