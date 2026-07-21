"use client";

import { ClipboardList, BookOpen, CalendarCheck2, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, Button, Badge } from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { ReadingMode } from "@/types/reading";

export function ReadingModeSelect({
  onSelectMode,
  dailyChallengeCompleted,
}: {
  onSelectMode: (mode: ReadingMode) => void;
  dailyChallengeCompleted: boolean;
}) {
  const { t } = useLanguage();
  const m = t.reading.modes;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="group flex flex-col transition-transform duration-300 transition-smooth hover:-translate-y-0.5 hover:shadow-card-hover">
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600 transition-transform duration-300 transition-smooth group-hover:scale-110">
              <ClipboardList className="h-[18px] w-[18px]" />
            </span>
            <CardTitle>{m.fullExamTitle}</CardTitle>
          </div>
          <CardDescription>{m.fullExamDescription}</CardDescription>
        </CardHeader>
        <CardFooter className="mt-auto">
          <Button onClick={() => onSelectMode("full-exam")}>
            {m.startFullExam}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <Card className="group flex flex-col transition-transform duration-300 transition-smooth hover:-translate-y-0.5 hover:shadow-card-hover">
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600 transition-transform duration-300 transition-smooth group-hover:scale-110">
              <BookOpen className="h-[18px] w-[18px]" />
            </span>
            <CardTitle>{m.practiceByTextTitle}</CardTitle>
          </div>
          <CardDescription>{m.practiceByTextDescription}</CardDescription>
        </CardHeader>
        <CardFooter className="mt-auto">
          <Button variant="secondary" onClick={() => onSelectMode("practice-by-text")}>
            {m.startPractice}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <Card className="group flex flex-col transition-transform duration-300 transition-smooth hover:-translate-y-0.5 hover:shadow-card-hover">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600 transition-transform duration-300 transition-smooth group-hover:scale-110">
                <CalendarCheck2 className="h-[18px] w-[18px]" />
              </span>
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
        <CardFooter className="mt-auto">
          <Button variant="secondary" onClick={() => onSelectMode("daily-challenge")}>
            {m.startDailyChallenge}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
