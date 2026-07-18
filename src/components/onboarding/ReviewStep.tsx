import { EXAMS } from "@/config/exams";
import { ONBOARDING_LEVEL_LABELS } from "@/config/onboarding";
import type { ExamId } from "@/types/exam";
import type { OnboardingLevel } from "@/types/user";

interface ReviewDraft {
  examId: ExamId | null;
  targetLevel: OnboardingLevel | null;
  examDate: string | null;
  dailyGoalMinutes: number;
}

export function ReviewStep({ draft }: { draft: ReviewDraft }) {
  const exam = draft.examId ? EXAMS[draft.examId] : null;
  const levelMeta = draft.targetLevel
    ? ONBOARDING_LEVEL_LABELS[draft.targetLevel]
    : null;

  return (
    <div className="flex flex-col divide-y divide-border rounded-2xl border border-border">
      <ReviewRow label="Exam" value={exam?.name ?? "—"} />
      <ReviewRow
        label="Level"
        value={levelMeta ? `${levelMeta.label} · ${levelMeta.description}` : "—"}
      />
      <ReviewRow label="Exam date" value={draft.examDate ?? "Not set yet"} />
      <ReviewRow label="Daily goal" value={`${draft.dailyGoalMinutes} min / day`} />
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
