"use client";

import { CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { useState } from "react";

const processSteps = [
  "Lade jede Woche deine Fotos hoch (gleiche Bedingungen)",
  "Unser Team analysiert deine Fortschritte professionell",
  "Du erhältst personalisierte Empfehlungen und Anpassungen",
  "Kontinuierliche Betreuung für optimale Ergebnisse",
  "Regelmäßige Check-ins und Erfolgs-Tracking",
  "Langfristige Begleitung auf deinem Weg",
];

const dos = [
  "Gleiche Beleuchtung verwenden",
  "Konstanten Abstand halten",
  "Neutrale Gesichtsposition",
  "Regelmäßig hochladen",
];

const donts = [
  "Filter oder Bearbeitung",
  "Unterschiedliche Beleuchtung",
  "Makeup während Aufnahme",
  "Unregelmäßige Uploads",
];

const faqs = [
  {
    q: "Wie oft sollte ich Fotos hochladen?",
    a: "Einmal pro Woche am gleichen Wochentag – so sind die Ergebnisse am vergleichbarsten.",
  },
  {
    q: "Was ist bei der Beleuchtung wichtig?",
    a: "Nutze konstantes Licht (am besten Tageslicht oder dieselbe Lampe) und verzichte auf Filter.",
  },
  {
    q: "Kann ich auch ohne alle Fotos hochladen?",
    a: "Ja, aber für eine vollständige Analyse sind alle Ansichten hilfreich.",
  },
  {
    q: "Wie schnell sehe ich Ergebnisse?",
    a: "Oft nach 2–4 Wochen erste Verbesserungen; deutlicher nach 8–12 Wochen.",
  },
  {
    q: "Was passiert, wenn ich eine Woche vergesse?",
    a: "Kein Stress – in der nächsten Woche einfach weitermachen. Kontinuität zählt.",
  },
];

export function CollaborationCard() {
  return (
    <div className="rounded-2xl border bg-card shadow-card">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">So läuft&apos;s ab</h3>

        {/* Steps */}
        <div className="space-y-3 mb-6">
          {processSteps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center mt-0.5">
                {i + 1}
              </div>
              <p className="text-sm text-foreground">{step}</p>
            </div>
          ))}
        </div>

        {/* Do's & Don'ts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-medium text-success mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Do&apos;s
            </h4>
            <ul className="space-y-2">
              {dos.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-destructive mb-3 flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Don&apos;ts
            </h4>
            <ul className="space-y-2">
              {donts.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-destructive mt-0.5" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* FAQ (native <details>) */}
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-primary" />
            Häufige Fragen
          </h4>

          <div className="space-y-2">
            {faqs.map(({ q, a }, idx) => (
              <details
                key={idx}
                className="rounded-2xl border bg-background open:bg-muted/30 transition-colors"
              >
                <summary className="cursor-pointer list-none px-3 py-2 rounded-2xl">
                  <span className="text-sm font-medium">{q}</span>
                </summary>
                <div className="px-3 pb-3 -mt-1">
                  <p className="text-sm text-muted-foreground">{a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

