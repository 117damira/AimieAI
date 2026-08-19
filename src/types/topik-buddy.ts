import type { TopikLevel, TopikTrack } from "./topik";

export interface TopikBuddyMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * A compact, curated summary of the account's real TOPIK progress — the
 * only shape of profile data ever sent to the Buddy chat API or the model.
 * Deliberately narrow: no raw ids, no full session history, no email/auth
 * fields, nothing beyond what's needed to ground a study-mentor reply in
 * the student's actual performance. Built by lib/topik/buddy-context.ts.
 */
export interface TopikBuddyContext {
  firstName: string;
  track: TopikTrack | null;
  level: TopikLevel | null;
  examDate: string | null;
  daysUntilExam: number | null;
  listeningAccuracyPct: number | null;
  readingAccuracyPct: number | null;
  writingAccuracyPct: number | null;
  weakestSkill: "listening" | "reading" | "writing" | null;
  currentStreakDays: number;
  wordsLearned: number;
  totalSessionsCompleted: number;
}
