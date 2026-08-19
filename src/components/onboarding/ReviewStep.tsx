"use client";

import { EXAMS } from "@/config/exams";
import { ONBOARDING_LEVEL_LABELS, STUDY_DAY_ORDER, STUDY_DAY_WEEKDAY_INDEX } from "@/config/onboarding";
import { TOPIK_TRACK_LABELS, TOPIK_LEVEL_LABELS } from "@/config/topik-onboarding";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { ExamId } from "@/types/exam";
import type { OnboardingLevel, StudyDay } from "@/types/user";
import type { TopikLevel, TopikTrack } from "@/types/topik";

interface ReviewDraft {
  examId: ExamId | null;
  targetLevel: OnboardingLevel | null;
  topikTrack: TopikTrack | null;
  topikLevel: TopikLevel | null;
  examDate: string | null;
  dailyGoalMinutes: number;
  studyDays: StudyDay[];
}

function formatStudyDays(
  days: StudyDay[],
  weekdaysShort: readonly string[],
  everyDayLabel: string
): string {
  if (days.length === STUDY_DAY_ORDER.length) return everyDayLabel;
  return STUDY_DAY_ORDER.filter((day) => days.includes(day))
    .map((day) => weekdaysShort[STUDY_DAY_WEEKDAY_INDEX[day]])
    .join(", ");
}

export function ReviewStep({ draft }: { draft: ReviewDraft }) {
  const { t, language } = useLanguage();
  const exam = draft.examId ? EXAMS[draft.examId] : null;
  const isTopik = draft.examId === "topik";
  const levelMeta = draft.targetLevel
    ? ONBOARDING_LEVEL_LABELS[draft.targetLevel]
    : null;
  const topikTrackMeta = draft.topikTrack ? TOPIK_TRACK_LABELS[draft.topikTrack] : null;
  const topikLevelMeta = draft.topikLevel ? TOPIK_LEVEL_LABELS[draft.topikLevel] : null;

  const levelValue = isTopik
    ? topikTrackMeta && topikLevelMeta
      ? `${topikTrackMeta.label} · ${topikLevelMeta.label}`
      : "—"
    : levelMeta
      ? `${levelMeta.label} · ${levelMeta.description[language]}`
      : "—";

  return (
    <div className="flex flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border shadow-card">
      <ReviewRow label={t.onboarding.reviewExam} value={exam?.name ?? "—"} />
      <ReviewRow label={t.onboarding.reviewLevel} value={levelValue} />
      <ReviewRow label={t.onboarding.reviewExamDate} value={draft.examDate ?? t.onboarding.notSetYet} />
      <ReviewRow
        label={t.onboarding.reviewDailyGoalLabel}
        value={t.onboarding.reviewDailyGoal(draft.dailyGoalMinutes)}
      />
      <ReviewRow
        label={t.onboarding.reviewStudyDaysLabel}
        value={formatStudyDays(draft.studyDays, t.weekdaysShort, t.onboarding.everyDayIntensive)}
      />
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors duration-200 hover:bg-background/60">
      <span className="text-sm font-medium text-muted">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}
