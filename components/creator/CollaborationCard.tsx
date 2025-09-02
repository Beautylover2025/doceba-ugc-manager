"use client";

import { useState } from "react";
import { CheckCircle, XCircle, HelpCircle, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const processSteps = [
  "Lade jede Woche deine Fotos hoch (gleiche Bedingungen)",
  "Unser Team analysiert deine Fortschritte professionell",
  "Du erhältst personalisierte Empfehlungen und Anpassungen",
  "Kontinuierliche Betreuung für optimale Ergebnisse",
  "Regelmäßige Check-ins und Erfolgs-Tracking",
  "Langfristige Begleitung auf deinem Weg",
];

const dos   = ["Gleiche Beleuchtung verwenden", "Konstanten Abstand halten", "Neutrale Gesichtsposition", "Regelmäßig hochladen"];
const donts = ["Filter oder Bearbeitung", "Unterschiedliche Beleuchtung", "Makeup während Aufnahme", "Unregelmäßige Uploads"];

const faqs = [
  { question: "Wie oft sollte ich Fotos hochladen?", answer: "Idealerweise 1× pro Woche am selben Tag – für beste Vergleichbarkeit." },
  { question: "Was ist bei der Beleuchtung wichtig?", answer: "Natürliches Tageslicht oder eine konstante, immer gleiche Lichtquelle." },
  { question: "Kann ich auch ohne alle Fotos hochladen?", answer: "Ja, aber für eine vollständige Analyse sind alle Ansichten besser." },
  { question: "Wie schnell sehe ich Ergebnisse?", answer: "Erste Verbesserungen nach 2–4 Wochen, deutlichere nach 8–12 Wochen." },
  { question: "Was passiert, wenn ich eine Woche vergesse?", answer: "Kein Stress – in der nächsten Woche weitermachen. Konstanz zählt." },
];

export const CollaborationCard = () => {
  return (
    <Card className="shadow-card rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg">So läuft's ab</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Prozess */}
        <div className="space-y-3">
          {processSteps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                {i + 1}
              </div>
              <p className="text-sm text-foreground">{step}</p>
            </div>
          ))}
        </div>

        {/* Do’s & Don’ts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium text-success flex items-center gap-2">
              <CheckCircle className="h-4 w-4" /> Do's
            </h4>
            <div className="space-y-2">
              {dos.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-success mt-1 flex-shrink-0" />
                  <p className="text-sm text-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-destructive flex items-center gap-2">
              <XCircle className="h-4 w-4" /> Don’ts
            </h4>
            <div className="space-y-2">
              {donts.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <XCircle className="h-3 w-3 text-destructive mt-1 flex-shrink-0" />
                  <p className="text-sm text-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-brand-primary" />
            Häufige Fragen
          </h4>

          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <FAQItem key={i} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-left rounded-2xl border hover:bg-muted/50 transition-colors">
        <span className="text-sm font-medium">{question}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-3">
        <p className="text-sm text-muted-foreground">{answer}</p>
      </CollapsibleContent>
    </Collapsible>
  );
};
