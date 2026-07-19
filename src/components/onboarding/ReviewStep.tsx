"use client";

import { EXAMS } from "@/config/exams";
import { ONBOARDING_LEVEL_LABELS } from "@/config/onboarding";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { ExamId } from "@/types/exam";
import type { OnboardingLevel } from "@/types/user";

interface ReviewDraft {
  examId: ExamId | null;
  targetLevel: OnboardingLevel | null;
  examDate: string | null;
  dailyGoalMinutes: number;
}

export function ReviewStep({ draft }: { draft: ReviewDraft }) {
  const { t, language } = useLanguage();
  const exam = draft.examId ? EXAMS[draft.examId] : null;
  const levelMeta = draft.targetLevel
    ? ONBOARDING_LEVEL_LABELS[draft.targetLevel]
    : null;

  return (
    <div className="flex flex-col divide-y divide-border rounded-2xl border border-border">
      <ReviewRow label={t.onboarding.reviewExam} value={exam?.name ?? "—"} />
      <ReviewRow
        label={t.onboarding.reviewLevel}
        value={levelMeta ? `${levelMeta.label} · ${levelMeta.description[language]}` : "—"}
      />
      <ReviewRow label={t.onboarding.reviewExamDate} value={draft.examDate ?? t.onboarding.notSetYet} />
      <ReviewRow
        label={t.onboarding.reviewDailyGoalLabel}
        value={t.onboarding.reviewDailyGoal(draft.dailyGoalMinutes)}
      />
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
