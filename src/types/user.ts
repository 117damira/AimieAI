import type { ExamId } from "./exam";

/** Self-reported proficiency level collected during onboarding. Only
 * "A1"-"B2" have real DELF content — see resolvePracticeLevel() in
 * lib/utils/level.ts for how "Beginner"/"C1"/"C2" map onto it. */
export type OnboardingLevel = "Beginner" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  examId: ExamId;
  targetLevel: OnboardingLevel;
  /** ISO yyyy-mm-dd, or null if the user hasn't set an exam date yet. */
  examDate: string | null;
  dailyGoalMinutes: number;
  avatarInitials: string;
}
