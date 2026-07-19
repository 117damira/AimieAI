"use client";

import { Clock, Sparkles } from "lucide-react";
import { Badge, Card, CardHeader, CardTitle } from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function SpeakingQuestionCard({
  partLabel,
  prompt,
  suggestedDurationSeconds,
}: {
  partLabel: string;
  prompt: string;
  suggestedDurationSeconds: number;
}) {
  const { t } = useLanguage();
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="primary">
            <Sparkles className="h-3.5 w-3.5" />
            {partLabel}
          </Badge>
          <Badge variant="neutral">
            <Clock className="h-3.5 w-3.5" />
            {t.speaking.minutesUnit(Math.max(1, Math.round(suggestedDurationSeconds / 60)))}
          </Badge>
        </div>
        <CardTitle className="mt-1">{prompt}</CardTitle>
      </CardHeader>
    </Card>
  );
}
