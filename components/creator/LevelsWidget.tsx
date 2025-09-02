"use client";

import { Trophy, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const levels = [
  { id: 1, description: "Grundlagen der Hautpflege" },
  { id: 2, description: "Erweiterte Behandlungen" },
  { id: 3, description: "Professionelle Ergebnisse" },
];

export const LevelsWidget = () => {
  return (
    <Card className="shadow-card rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-brand-primary" />
          Deine Level
        </CardTitle>
        <p className="text-sm text-muted-foreground">Schalte neue Features und Behandlungen frei</p>
      </CardHeader>

      <CardContent>
        <div className="grid gap-3">
          {levels.map((level) => (
            <div key={level.id} className="flex items-center justify-between p-3 rounded-2xl border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">Level {level.id}</p>
                  <p className="text-xs text-muted-foreground">{level.description}</p>
                </div>
              </div>

              <Badge variant="outline" className="text-xs">Coming Soon</Badge>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-primary-subtle rounded-2xl">
          <p className="text-xs text-center text-muted-foreground">
            Neue Level werden basierend auf deinen Fortschritten freigeschaltet
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
