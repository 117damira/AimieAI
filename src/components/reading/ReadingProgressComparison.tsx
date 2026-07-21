"use client";

import { TrendingUp, TrendingDown, Minus, GitCompare } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { ReadingProgressComparison as ReadingProgressComparisonData } from "@/types/reading";

function DeltaRow({
  label,
  currentValue,
  delta,
  unit = "",
}: {
  label: string;
  currentValue: string;
  delta: number | null;
  unit?: string;
}) {
  const Icon = delta === null || delta === 0 ? Minus : delta > 0 ? TrendingUp : TrendingDown;
  const toneClass =
    delta === null || delta === 0 ? "text-muted" : delta > 0 ? "text-success-600" : "text-danger-600";

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-background p-4">
      <div className="flex flex-col">
        <span className="text-xs text-muted">{label}</span>
        <span className="font-display text-lg font-semibold text-foreground">{currentValue}</span>
      </div>
      <span className={`flex items-center gap-1 text-sm font-medium ${toneClass}`}>
        <Icon className="h-4 w-4 shrink-0" />
        {delta !== null && (delta > 0 ? "+" : "") + delta + unit}
      </span>
    </div>
  );
}

/** Always compares the just-completed session against the real previous
 * Reading session stored in stats.readingSessionHistory — never a
 * fabricated baseline. See lib/reading/stats.ts#computeReadingProgressComparison. */
export function ReadingProgressComparison({ comparison }: { comparison: ReadingProgressComparisonData }) {
  const { t } = useLanguage();
  const p = t.reading.progressComparison;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <GitCompare className="h-[18px] w-[18px] text-primary-500" />
          <CardTitle>{p.title}</CardTitle>
        </div>
        <CardDescription>{p.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {!comparison.hasPrevious ? (
          <div className="flex h-20 items-center justify-center text-center text-sm text-muted">
            {p.noPreviousSession}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DeltaRow label={p.scoreChange} currentValue={`${comparison.currentScore}%`} delta={comparison.scoreImprovement} unit="%" />
            <DeltaRow
              label={p.speedChange}
              currentValue={`${comparison.currentWordsPerMinute} ${p.wpmUnit}`}
              delta={comparison.speedImprovement}
              unit={` ${p.wpmUnit}`}
            />
            <DeltaRow label={p.accuracyChange} currentValue={`${comparison.currentAccuracy}%`} delta={comparison.accuracyImprovement} unit="%" />
            <DeltaRow
              label={p.vocabularyChange}
              currentValue={`${comparison.currentVocabularyCount}`}
              delta={comparison.vocabularyImprovement}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
