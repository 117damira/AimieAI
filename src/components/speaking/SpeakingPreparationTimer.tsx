"use client";

import { Timer } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, ProgressBar } from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useCountdown, formatMMSS } from "@/lib/hooks/useCountdown";

export function SpeakingPreparationTimer({
  totalMinutes,
  onSkip,
  onComplete,
}: {
  totalMinutes: number;
  onSkip: () => void;
  onComplete: () => void;
}) {
  const { t } = useLanguage();
  const totalSeconds = totalMinutes * 60;
  const { remainingSeconds, elapsedSeconds } = useCountdown(totalSeconds, onComplete);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Timer className="h-[18px] w-[18px] text-primary-500" />
          <CardTitle>{t.speaking.preparingTitle}</CardTitle>
        </div>
        <CardDescription>{t.speaking.preparingDescription}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6 py-8">
        <span className="font-display text-4xl font-semibold tabular-nums text-foreground">
          {formatMMSS(remainingSeconds)}
        </span>
        <ProgressBar value={elapsedSeconds} max={totalSeconds} className="w-full max-w-sm" />
        <Button variant="secondary" onClick={onSkip}>
          {t.speaking.startSpeakingNow}
        </Button>
      </CardContent>
    </Card>
  );
}
