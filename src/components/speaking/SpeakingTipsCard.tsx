"use client";

import { Lightbulb } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function SpeakingTipsCard() {
  const { t } = useLanguage();
  const tips = t.speaking.tips;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-[18px] w-[18px] text-warning-600" />
          <CardTitle>{tips.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-3 text-sm leading-6 text-foreground">
          {[tips.beSpontaneous, tips.practiceMockExams, tips.dontBeAfraid, tips.practiceWithNatives, tips.practiceConsistently].map(
            (tip, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-warning-500" />
                {tip}
              </li>
            )
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
