"use client";

import { BarChart3, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, ProgressBar } from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { ReadingFeedback } from "@/types/reading";

function scoreColor(scorePercent: number): string {
  if (scorePercent >= 70) return "bg-success-500";
  if (scorePercent >= 40) return "bg-warning-500";
  return "bg-danger-500";
}

/** Every skill score/explanation is computed purely from this session's
 * real question results (or real timing, for "speed") — see
 * lib/reading/feedback.ts. Never randomized or templated independent of
 * the data. */
export function ReadingSkillBreakdown({ feedback }: { feedback: ReadingFeedback }) {
  const { t } = useLanguage();
  const sb = t.reading.skillBreakdown;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-[18px] w-[18px] text-primary-500" />
          <CardTitle>{sb.title}</CardTitle>
        </div>
        <CardDescription>{sb.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {feedback.skills.map((skill) => (
          <div key={skill.skill} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{skill.label}</span>
              <span className="text-muted">{skill.scorePercent}%</span>
            </div>
            <ProgressBar value={skill.scorePercent} max={100} colorClassName={scoreColor(skill.scorePercent)} />
            <p className="text-xs text-muted">{skill.explanation}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/** Personalized coaching (AI Reading Strategy) — every insight is gated
 * behind a real computed condition, see
 * lib/reading/feedback.ts#buildStrategyInsights. */
export function ReadingStrategyCard({ feedback }: { feedback: ReadingFeedback }) {
  const { t } = useLanguage();
  const st = t.reading.strategy;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-[18px] w-[18px] text-primary-500" />
          <CardTitle>{st.title}</CardTitle>
        </div>
        <CardDescription>{feedback.overallPerformance}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-xs text-muted">{st.description}</p>
        <ul className="flex flex-col gap-2.5">
          {feedback.strategyInsights.map((insight, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 rounded-2xl bg-background p-3.5 text-sm text-foreground"
            >
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
              {insight}
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-1 rounded-2xl bg-primary-50 p-4">
          <span className="text-xs font-medium text-primary-700">{st.readinessLabel}</span>
          <span className="text-sm text-primary-900">{feedback.estimatedDelfReadiness}</span>
        </div>
      </CardContent>
    </Card>
  );
}
