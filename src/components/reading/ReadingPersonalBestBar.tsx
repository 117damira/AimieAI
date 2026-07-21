"use client";

import { Trophy, BarChart2, Flame, ListChecks } from "lucide-react";
import { Card, CardContent } from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { ReadingPersonalBest } from "@/types/reading";

function Stat({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-background p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600">
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex flex-col">
        <span className="font-display text-lg font-semibold text-foreground">{value}</span>
        <span className="text-xs text-muted">{label}</span>
      </div>
    </div>
  );
}

/** Displayed at the top of the Reading Home — always computed from the
 * student's real stats.readingSessionHistory (see lib/reading/stats.ts),
 * never placeholder numbers. Updates automatically every time a Reading
 * session completes because it reads live profile state. */
export function ReadingPersonalBestBar({ personalBest }: { personalBest: ReadingPersonalBest }) {
  const { t } = useLanguage();
  const p = t.reading.personalBest;

  if (personalBest.sessionsCompleted === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center py-6 text-center text-sm text-muted">
          {p.noDataYet}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Trophy} label={p.bestScore} value={`${personalBest.bestScorePercent}%`} />
        <Stat icon={BarChart2} label={p.averageScore} value={`${personalBest.averageScorePercent}%`} />
        <Stat icon={Flame} label={p.streak} value={`${personalBest.readingStreakDays} ${p.daysUnit}`} />
        <Stat icon={ListChecks} label={p.sessionsCompleted} value={`${personalBest.sessionsCompleted}`} />
      </CardContent>
    </Card>
  );
}
