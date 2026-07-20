import type { DelfLevel, FeedbackLanguage } from "./writing-evaluation";

export type { DelfLevel, FeedbackLanguage };

/** A grammar mistake found in the student's actual spoken transcript,
 * explained pedagogically rather than just flagged. Kept separate from the
 * Writing module's `GrammarError` (in writing-evaluation.ts) so Writing's
 * existing evaluation contract is untouched by Speaking's richer shape. */
export interface SpeakingGrammarMistake {
  original: string;
  correction: string;
  category: "verb" | "agreement" | "sentence-structure" | "other";
  /** What's wrong and why — the grammar rule that was violated. */
  whyWrong: string;
  /** How to correct it — the rule applied to fix this specific mistake. */
  howToFix: string;
  /** A fresh, correct French example sentence demonstrating proper usage. */
  betterExample: string;
  /** A concrete tip for avoiding this mistake in future answers. */
  howToAvoid: string;
}

/** Feedback shown right after a single spoken answer, before the next
 * question is asked. */
export interface TurnFeedback {
  relevance: boolean;
  /** Did the answer actually address what was asked, and how fully. */
  taskCompletionNote: string;
  /** How logically the answer held together (coherence of ideas). */
  coherenceNote: string;
  grammarErrors: SpeakingGrammarMistake[];
  vocabularyNote: string;
  fluencyNote: string;
  /** Best-effort proxy — browser speech recognition can't do true phoneme
   * analysis, so this is inferred from recognition confidence + disfluencies
   * in the transcript, not acoustic/phonetic scoring. */
  pronunciationNote: string;
  encouragement: string;
  /** Raw per-turn score out of 25, carried through so the final report can
   * aggregate real per-turn results instead of re-rolling its own score. */
  turnScore: number;
}

/** One fully-evaluated turn, kept client-side across the whole session so
 * the final report reflects the user's actual transcripts — not a re-roll. */
export interface CompletedTurn {
  partId: string;
  questionId: string;
  transcript: string;
  wordCount: number;
  feedback: TurnFeedback;
}

/** Full examiner report generated after a speaking session ends —
 * identical shape for both the AI Live Examiner and Written Practice
 * modes, since both accumulate the same per-turn data. */
export interface SpeakingExaminerReport {
  level: DelfLevel;
  totalQuestions: number;
  grammar: { summary: string; commonErrors: SpeakingGrammarMistake[] };
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

/** A reactive question Claude may optionally insert right after a turn, in
 * conversational parts (A2, B1's guided interview/interaction). Never
 * produced by the offline mock — a bounded, Claude-only enhancement. */
export interface FollowUpQuestion {
  prompt: string; // French
  translation: string; // in the current feedback language
}

/** One question in a dynamically generated (or static-fallback) session. */
export interface GeneratedSpeakingQuestion {
  partId: string;
  partLabel: string;
  prompt: string; // French
  translation: string; // in the current feedback language
  suggestedDurationSeconds: number;
}

/** A candidate B2 discussion topic offered before the exam begins. */
export interface GeneratedTopicChoice {
  title: string; // French
  translation: string; // in the current feedback language
}
