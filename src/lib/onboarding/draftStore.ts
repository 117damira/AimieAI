import type { ExamId } from "@/types/exam";
import type { OnboardingLevel, StudyDay } from "@/types/user";
import type { TopikLevel, TopikTrack } from "@/types/topik";

const DRAFT_KEY = "aimieai.onboarding-draft.v1";

/** Answers collected by the onboarding questionnaire, before an account
 * exists — registration now happens after onboarding, so these are held
 * here until register() folds them into the new account. `targetLevel` is
 * DELF-specific (ignored for topik); `topikTrack`/`topikLevel` are only set
 * when `examId === "topik"`. */
export interface OnboardingAnswers {
  examId: ExamId;
  targetLevel: OnboardingLevel;
  topikTrack: TopikTrack | null;
  topikLevel: TopikLevel | null;
  examDate: string | null;
  dailyGoalMinutes: number;
  studyDays: StudyDay[];
}

/** Session-scoped: an abandoned, never-registered draft has no reason to
 * outlive the browser tab. */
export function saveOnboardingDraft(answers: OnboardingAnswers): void {
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(answers));
}

export function readOnboardingDraft(): OnboardingAnswers | null {
  const raw = sessionStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OnboardingAnswers;
  } catch {
    return null;
  }
}

export function clearOnboardingDraft(): void {
  sessionStorage.removeItem(DRAFT_KEY);
}
