"use client";

import { Calendar, ChevronRight, StickyNote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type WeekStatus = "complete" | "partial" | "missing";

interface WeekEntry {
  week: number;
  date: string;
  status: WeekStatus;
  hasNote: boolean;
}

const mockHistory: WeekEntry[] = [
  { week: 3, date: "15.01.2024", status: "complete", hasNote: true },
  { week: 2, date: "08.01.2024", status: "partial",  hasNote: false },
  { week: 1, date: "01.01.2024", status: "complete", hasNote: true },
];

const StatusBadge = ({ status }: { status: WeekStatus }) => {
  if (status === "complete") return <Badge className="bg-success text-success-foreground">Vollständig</Badge>;
  if (status === "partial")  return <Badge className="bg-warning text-warning-foreground">Teilweise</Badge>;
  return <Badge variant="outline" className="text-muted-foreground">Fehlend</Badge>;
};

export const HistoryCard = () => {
  return (
    <Card className="shadow-card rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-brand-primary" />
          Verlauf
        </CardTitle>
      </CardHeader>

      <CardContent>
        {mockHistory.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Noch keine Uploads vorhanden</p>
        ) : (
          <div className="space-y-3">
            {mockHistory.map((entry) => (
              <div
                key={entry.week}
                className="flex items-center justify-between p-3 rounded-2xl border hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="text-sm">
                  <p className="font-medium">Woche {entry.week}</p>
                  <p className="text-muted-foreground">{entry.date}</p>
                </div>

                <div className="flex items-center gap-2">
                  {entry.hasNote && <StickyNote className="h-4 w-4 text-muted-foreground" />}
                  <StatusBadge status={entry.status} />
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
