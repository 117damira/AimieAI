"use client";

import { EXAMS } from "@/config/exams";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { ExamId } from "@/types/exam";

export function ExamStep({
  value,
  onChange,
}: {
  value: ExamId | null;
  onChange: (examId: ExamId) => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {Object.values(EXAMS).map((exam) => {
        const selected = exam.id === value;
        return (
          <button
            key={exam.id}
            type="button"
            disabled={!exam.isActive}
            onClick={() => onChange(exam.id)}
            aria-pressed={selected}
            className={cn(
              "flex flex-col items-center gap-2 rounded-2xl border px-4 py-5 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-60",
              selected
                ? "border-primary-400 bg-primary-50"
                : "border-border bg-background hover:border-primary-200"
            )}
          >
            <span className="font-display text-base font-semibold text-foreground">
              {exam.name}
            </span>
            <span className="text-xs text-muted">
              {t.onboarding.examLanguageNames[exam.language] ?? exam.language}
            </span>
            {!exam.isActive && <Badge variant="neutral">{t.onboarding.comingSoon}</Badge>}
          </button>
        );
      })}
    </div>
  );
}
