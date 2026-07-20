"use client";

import { Sparkles, Clock, Timer, ListChecks } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button } from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { DelfSpeakingLevelConfig } from "@/config/delf-speaking";

export function SpeakingWelcomeScreen({
  levelConfig,
  onStart,
}: {
  levelConfig: DelfSpeakingLevelConfig;
  onStart: () => void;
}) {
  const { t, language } = useLanguage();
  const { min, max } = levelConfig.estimatedSpeakingMinutes;
  const durationLabel = min === max ? t.speaking.minutesUnit(min) : `${min}–${max} min`;
  const prepTimeLabel =
    levelConfig.prepTimeMinutes === 0 ? t.speaking.noPrepTime : t.speaking.minutesUnit(levelConfig.prepTimeMinutes);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-[18px] w-[18px] text-primary-500" />
          <CardTitle>
            {levelConfig.label} · {t.speaking.modeSelect.aiLiveExaminerTitle}
          </CardTitle>
        </div>
        <CardDescription>{levelConfig.structureDescription[language]}</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <WelcomeStat icon={Timer} label={t.speaking.prepTimeLabel} value={prepTimeLabel} />
        <WelcomeStat icon={Clock} label={t.speaking.estimatedDurationLabel} value={durationLabel} />
        <WelcomeStat icon={ListChecks} label={t.speaking.numberOfPartsLabel} value={String(levelConfig.parts.length)} />
      </CardContent>
      <CardFooter className="justify-center">
        <Button size="lg" onClick={onStart}>
          {t.speaking.startExam}
        </Button>
      </CardFooter>
    </Card>
  );
}

function WelcomeStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Timer;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-background p-4 text-center">
      <Icon className="h-5 w-5 text-primary-500" />
      <span className="font-display text-lg font-semibold text-foreground">{value}</span>
      <span className="text-xs text-muted">{label}</span>
    </div>
  );
}
