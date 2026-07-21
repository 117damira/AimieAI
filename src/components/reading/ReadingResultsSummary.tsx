"use client";

import { Award, Clock, Target, TrendingUp, Timer, Hourglass, Gauge } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import { formatTime } from "@/lib/utils/ttsPlayer";
import { classifyPace } from "@/lib/reading/timing";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { ReadingResult } from "@/types/reading";

function Stat({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-background p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <div className="flex flex-col">
        <span className="font-display text-lg font-semibold text-foreground">{value}</span>
        <span className="text-xs text-muted">{label}</span>
      </div>
    </div>
  );
}

export function ReadingResultsSummary({ result }: { result: ReadingResult }) {
  const { t } = useLanguage();
  const r = t.reading.results;
  const isOfficialExam = result.mode === "full-exam";
  const paceTier = classifyPace(result.timing.paceRatio);
  const paceLabel = { fast: r.paceFast, onPace: r.paceOnPace, slow: r.paceSlow }[paceTier];
  const paceVariant = paceTier === "onPace" ? "success" : paceTier === "fast" ? "warning" : "danger";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Award className="h-[18px] w-[18px] text-warning-600" />
          <CardTitle>{r.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div
          className={`flex flex-wrap items-end justify-between gap-4 rounded-2xl p-4 ${
            result.passed ? "bg-success-50" : isOfficialExam ? "bg-danger-50" : "bg-warning-50"
          }`}
        >
          <div className="flex flex-col gap-1">
            <span className="font-display text-4xl font-semibold text-foreground">
              {result.score}
              <span className="ml-1 text-base font-normal text-muted">/ {result.scoreOutOf}</span>
            </span>
            <span className="text-sm text-muted">{isOfficialExam ? r.scoreLabel : r.practiceScoreLabel}</span>
          </div>
          {isOfficialExam ? (
            <Badge variant={result.passed ? "success" : "danger"}>{result.passed ? r.pass : r.needsImprovement}</Badge>
          ) : (
            <Badge variant={result.passed ? "success" : "warning"}>
              {result.passed ? r.practiceGood : r.practiceNeedsWork}
            </Badge>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Stat icon={TrendingUp} label={r.percentageLabel} value={`${result.percentage}%`} />
          <Stat icon={Target} label={r.accuracyLabel} value={`${Math.round(result.accuracy * 100)}%`} />
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-foreground">{r.timingTitle}</span>
            <Badge variant={paceVariant}>{paceLabel}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat icon={Hourglass} label={r.readingTimeLabel} value={formatTime(result.timing.readingTimeSeconds)} />
            <Stat icon={Timer} label={r.answeringTimeLabel} value={formatTime(result.timing.answeringTimeSeconds)} />
            <Stat icon={Clock} label={r.totalTimeLabel} value={formatTime(result.timing.totalTimeSeconds)} />
            <Stat icon={Gauge} label={r.recommendedTimeLabel} value={`${result.timing.recommendedMinutes} min`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
