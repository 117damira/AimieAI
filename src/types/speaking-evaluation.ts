import type { DelfLevel, FeedbackLanguage, GrammarError } from "./writing-evaluation";

export type { DelfLevel, FeedbackLanguage, GrammarError };

/** Feedback shown right after a single spoken answer, before the next
 * question is asked. */
export interface TurnFeedback {
  relevance: boolean;
  grammarErrors: GrammarError[];
  vocabularyNote: string;
  fluencyNote: string;
  encouragement: string;
}

/** Full examiner report generated after a speaking session ends —
 * identical shape for both the AI Live Examiner and Written Practice
 * modes, since both accumulate the same per-turn data. */
export interface SpeakingExaminerReport {
  level: DelfLevel;
  totalQuestions: number;
  grammar: { summary: string; commonErrors: GrammarError[] };
  vocabulary: { summary: string; rangeNote: string };
  pronunciation: { summary: string; note: string };
  fluency: { summary: string; pace: string };
  taskCompletion: { summary: string; partsCompleted: string[] };
  repeatedMistakes: string[];
  fillerWords: { count: number; examples: string[] };
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  estimatedScore: number;
  scoreOutOf: number;
  scoreExplanation: string;
}
