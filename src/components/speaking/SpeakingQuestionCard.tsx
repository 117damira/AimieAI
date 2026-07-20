"use client";

import { useState } from "react";
import { Clock, Sparkles, Languages } from "lucide-react";
import { Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function SpeakingQuestionCard({
  partLabel,
  prompt,
  translation,
  suggestedDurationSeconds,
}: {
  partLabel: string;
  prompt: string;
  translation: string;
  suggestedDurationSeconds: number;
}) {
  const { t } = useLanguage();
  const [showTranslation, setShowTranslation] = useState(false);

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
      <CardContent className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setShowTranslation((prev) => !prev)}
          className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground"
        >
          <Languages className="h-3.5 w-3.5" />
          {showTranslation ? t.speaking.hideTranslation : t.speaking.showTranslation}
        </button>
        {showTranslation && <p className="text-sm text-muted">{translation}</p>}
      </CardContent>
    </Card>
  );
}
