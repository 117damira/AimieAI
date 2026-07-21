import type { ExamId } from "./exam";
import type { VocabularyEntry } from "./vocabulary";
import type { DelfLevel } from "./writing-evaluation";

/** Self-reported proficiency level collected during onboarding. Only
 * "A1"-"B2" have real DELF content — see resolvePracticeLevel() in
 * lib/utils/level.ts for how "Beginner" maps onto it. */
export type OnboardingLevel = "Beginner" | "A1" | "A2" | "B1" | "B2";

/** A day of the week a student has chosen to study on. Indices match
 * JS `Date.getDay()` (0 = Sunday) so labels can reuse `weekdaysShort`. */
export type StudyDay = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

/** One completed practice session, used to derive streaks, history, and
 * exam-readiness estimates. */
export interface ActivityLogEntry {
  /** ISO yyyy-mm-dd, the local calendar day the session was completed on. */
  date: string;
  activity: "writing" | "speaking" | "listening";
  /** The session's AI-evaluated exam-readiness score, normalized to 0-100
   * (from WritingEvaluation/SpeakingExaminerReport's estimatedScore/scoreOutOf,
   * or a Listening result's score/scoreOutOf). */
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
  listeningSessions: number;
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
  /** Empty string when the account was registered with a phone number
   * instead of an email — see `registrationMethod`. */
  email: string;
  /** E.164-ish Kazakhstan number ("+7XXXXXXXXXX"), or null when the account
   * was registered with an email instead. */
  phone: string | null;
  /** Which identifier was used to create this account — determines whether
   * `email` or `phone` is the sign-in identifier and what's shown as the
   * primary contact method throughout the app. */
  registrationMethod: "email" | "phone";
  examId: ExamId;
  targetLevel: OnboardingLevel;
  /** ISO yyyy-mm-dd, or null if the user hasn't set an exam date yet. */
  examDate: string | null;
  dailyGoalMinutes: number;
  /** Days of the week the student plans to study — always at least one. */
  studyDays: StudyDay[];
  /** Uploaded avatar photo as a data URL, or null to fall back to computed
   * initials — see getInitials() in lib/utils/initials.ts. */
  avatarPhotoDataUrl: string | null;
  /** ISO timestamp of the last time this account reached the dashboard, or
   * null if it never has yet — used to show "Welcome" (first time) vs
   * "Welcome back" (every time after). Set once by the dashboard itself. */
  lastLoginAt: string | null;
  stats: UserStats;
  /** Real, per-word practice progress — starts empty for every new account.
   * A word only appears here once the student has actually practiced it
   * (see UserProfileContext.recordVocabularyPractice); never preloaded. */
  vocabularyProgress: VocabularyEntry[];
  /** Writing prompt ids used recently, per DELF level (most recent last,
   * capped) — lets topic rotation avoid repeating the last-seen prompt.
   * Starts empty for every new account; never preloaded. */
  writingTopicHistory: Partial<Record<DelfLevel, string[]>>;
  /** Listening recording ids completed recently, per DELF level — lets
   * content rotation avoid repeating the same recording(s). Starts empty
   * for every new account; never preloaded. */
  listeningHistory: Partial<Record<DelfLevel, string[]>>;
}
