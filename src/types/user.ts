import type { ExamId } from "./exam";

/** Self-reported proficiency level collected during onboarding. Only
 * "A1"-"B2" have real DELF content — see resolvePracticeLevel() in
 * lib/utils/level.ts for how "Beginner" maps onto it. */
export type OnboardingLevel = "Beginner" | "A1" | "A2" | "B1" | "B2";

/** One completed practice session, used to derive streaks, history, and
 * exam-readiness estimates. */
export interface ActivityLogEntry {
  /** ISO yyyy-mm-dd, the local calendar day the session was completed on. */
  date: string;
  activity: "writing" | "speaking";
  /** The session's AI-evaluated exam-readiness score, normalized to 0-100
   * (from WritingEvaluation/SpeakingExaminerReport's estimatedScore/scoreOutOf). */
  score: number;
}

/** Per-user progress data. Every new account starts at zero — see
 * createInitialStats() in lib/profile/UserProfileContext.tsx. Never seed
 * this with placeholder/sample numbers; it must reflect only what the
 * user actually did. */
export interface UserStats {
  wordsLearned: number;
  quizzesCompleted: number;
  speakingSessions: number;
  writingSessions: number;
  currentStreakDays: number;
  longestStreakDays: number;
  /** ISO yyyy-mm-dd of the last completed session, or null if none yet. */
  lastPracticeDate: string | null;
  history: ActivityLogEntry[];
}

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
  stats: UserStats;
}
