"use client";

import { ClipboardList, Headphones, CalendarCheck2, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, Button, Badge } from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { ListeningMode } from "@/types/listening";

export function ListeningModeSelect({
  onSelectMode,
  dailyChallengeCompleted,
}: {
  onSelectMode: (mode: ListeningMode) => void;
  dailyChallengeCompleted: boolean;
}) {
  const { t } = useLanguage();
  const m = t.listening.modes;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-[18px] w-[18px] text-primary-500" />
            <CardTitle>{m.fullExamTitle}</CardTitle>
          </div>
          <CardDescription>{m.fullExamDescription}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => onSelectMode("full-exam")}>
            {m.startFullExam}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Headphones className="h-[18px] w-[18px] text-primary-500" />
            <CardTitle>{m.practiceByPartTitle}</CardTitle>
          </div>
          <CardDescription>{m.practiceByPartDescription}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="secondary" onClick={() => onSelectMode("practice-by-part")}>
            {m.startPractice}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CalendarCheck2 className="h-[18px] w-[18px] text-primary-500" />
              <CardTitle>{m.dailyChallengeTitle}</CardTitle>
            </div>
            {dailyChallengeCompleted && (
              <Badge variant="success">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {m.completedTodayBadge}
              </Badge>
            )}
          </div>
          <CardDescription>{m.dailyChallengeDescription}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="secondary" onClick={() => onSelectMode("daily-challenge")}>
            {m.startDailyChallenge}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
