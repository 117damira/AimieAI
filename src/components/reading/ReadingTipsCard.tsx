"use client";

import { Lightbulb, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function ReadingTipsCard() {
  const { t } = useLanguage();
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-[18px] w-[18px] text-warning-500" />
          <CardTitle>{t.reading.tips.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {t.reading.tips.items.map((tip) => (
            <li
              key={tip}
              className="flex items-start gap-2.5 rounded-2xl bg-background p-3.5 text-sm text-foreground"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-600" />
              {tip}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
