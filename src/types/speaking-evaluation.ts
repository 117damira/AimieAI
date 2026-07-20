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

/** A specific word from the student's transcript flagged as commonly
 * mispronounced by learners at this level — phonetically grounded (nasal
 * vowels, silent endings, liaison), not a claim of certain audio detection.
 * Live Examiner mode only surfaces this in the UI; Written Practice never
 * shows it (see `SpeakingTurnFeedback`'s `showPronunciationWords` prop). */
export interface MispronuncedWord {
  word: string; // French, exactly as it appears in the transcript
  note: string; // brief explanation, in the feedback language
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
  /** Variety of sentence structures used, vs. repeating the same pattern. */
  sentenceVarietyNote: string;
  fluencyNote: string;
  /** Best-effort proxy — browser speech recognition can't do true phoneme
   * analysis, so this is inferred from recognition confidence + disfluencies
   * in the transcript, not acoustic/phonetic scoring. */
  pronunciationNote: string;
  mispronuncedWords: MispronuncedWord[];
  /** How natural/idiomatic the phrasing sounded vs. stilted or translated. */
  naturalnessNote: string;
  /** Whether the answer has the structural elements a strong DELF response
   * needs (introduction where appropriate, a direct answer, supporting
   * detail, an example where appropriate, a conclusion where appropriate),
   * naming exactly what's missing. */
  structureNote: string;
  strengths: string[];
  areasForImprovement: string[];
  suggestions: string[];
  /** A stronger model answer at the target DELF level, in French, for the
   * student to compare against — null when not generated (always null in
   * the offline mock; populated when Claude is configured). */
  betterExampleAnswer: string | null;
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
  /** A genuine, curated model answer for this exact question — only present
   * on the static fallback (see delf-speaking.ts); the Claude-generated path
   * doesn't pre-author one, since Claude supplies its own per-turn instead. */
  modelAnswer?: string;
}

/** A candidate B2 discussion topic offered before the exam begins. */
export interface GeneratedTopicChoice {
  title: string; // French
  translation: string; // in the current feedback language
}
