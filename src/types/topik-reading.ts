import type { TopikLevel } from "./topik";
import type { FeedbackLanguage } from "./writing-evaluation";
import type { ReadingSessionRecord } from "./reading";

export type { TopikLevel, FeedbackLanguage };

/** How a reading set was requested — mirrors ReadingMode from types/reading.ts.
 * "full-exam" uses the official 100-point TOPIK Reading scale (within the
 * combined 200/300-point test), the other two modes are practice and are
 * scored lightly out of their own question count. */
export type TopikReadingMode = "full-exam" | "practice-by-text" | "daily-challenge";

/** The ten core TOPIK reading task concepts, drawn from the official exam's
 * question types across TOPIK I and TOPIK II:
 * - vocabGrammar: choosing the correct word/grammar form for a blank
 * - sentenceCompletion: choosing the sentence/phrase that completes a text
 * - correctSentence: choosing which candidate sentence is grammatically/
 *   contextually correct (or where a given sentence should be inserted)
 * - mainIdea: identifying the passage's central point or purpose
 * - detail: locating a specific stated fact (number, name, date, action)
 * - ordering: arranging jumbled sentences into the correct sequence
 * - appropriateResponse: choosing a fitting reply/reaction in a dialogue
 * - inference: understanding what is implied but not directly stated
 * - authorIntention: recognizing why the writer included something
 * - correctStatement: picking the one statement that matches the passage
 *
 * "speed" is never a question tag — it is computed purely from timing (see
 * lib/topik/reading-timing.ts), never assigned to an individual question. */
export type TopikReadingSkillTag =
  | "vocabGrammar"
  | "sentenceCompletion"
  | "correctSentence"
  | "mainIdea"
  | "detail"
  | "ordering"
  | "appropriateResponse"
  | "inference"
  | "authorIntention"
  | "correctStatement";

export type TopikReadingDifficulty = "easy" | "medium" | "hard";

/** Official TOPIK reading structure for one numbered level — the numbers
 * the Reading Home dashboard displays, and what content generation
 * targets (passage count, max length). Mirrors DelfReadingLevelConfig's
 * shape. */
export interface TopikReadingLevelConfig {
  level: TopikLevel;
  label: string;
  durationMinutes: number;
  passageCountLabel: string; // e.g. "3–4" or "2" — wording varies by level
  passageCountMin: number;
  passageCountMax: number;
  maxWordsPerPassage: number;
  /** Always 100 — TOPIK Reading's official share of the combined 200-point
   * (TOPIK I) or 300-point (TOPIK II) test. See config/topik-reading.ts for
   * how this app's own practice "passed" threshold relates to (but is not)
   * the real published level cutoffs. */
  scoreOutOf: number;
  minPassingScore: number;
  textTypes: Record<FeedbackLanguage, string[]>;
  topics: Record<FeedbackLanguage, string[]>;
}

/** All types share one scoring mechanism (options[] + correctOptionIds[])
 * — "matching"/"ordering" are modeled with that same shape; only the type
 * tag changes prompt framing/UI label. */
export type TopikReadingQuestionType = "multiple-choice" | "true-false" | "multi-select" | "matching" | "ordering";

/** One TOPIK-style reading passage — always genuinely original, never a
 * copy of a real official TOPIK text. */
export interface TopikReadingPassage {
  id: string;
  textType: string; // e.g. "notice", "diary entry" — in the feedback language
  title: string; // in the feedback language
  body: string; // Korean — the actual passage text
  estimatedWordCount: number; // counted in 어절 (space-separated word-units)
}

export interface TopikReadingQuestionOption {
  id: string;
  text: string; // in the feedback language
}

/** Why a specific wrong option is wrong — never just "Incorrect": always a
 * real, specific reason tied to what that option actually claims. */
export interface TopikReadingOptionExplanation {
  optionId: string;
  reason: string;
}

/** The full educational breakdown shown when a question's explanation is
 * expanded — every field grounded in the passage's real text, never
 * generic filler. */
export interface TopikReadingQuestionExplanation {
  /** Where in the passage the answer is found, quoting the real text. */
  whereInText: string;
  /** The specific Korean keywords/expressions that signal the answer. */
  keywords: string;
  whyCorrect: string;
  /** Every incorrect option explained individually — never omitted, never
   * a bare "incorrect". */
  whyIncorrect: TopikReadingOptionExplanation[];
  vocabulary: { term: string; translation: string }[];
  grammarPattern: string;
  strategy: string;
}

export interface TopikReadingQuestion {
  id: string;
  passageId: string;
  questionNumber: number;
  type: TopikReadingQuestionType;
  prompt: string; // in the feedback language
  options: TopikReadingQuestionOption[];
  /** Every option id that counts as correct. Length 1 for single-answer
   * types; length >= 1 for "multi-select". */
  correctOptionIds: string[];
  difficulty: TopikReadingDifficulty;
  skillTag: TopikReadingSkillTag;
  /** An exact substring of the passage body — the sentence/phrase a "Show
   * where the answer is in the text" click highlights. Never reveals the
   * answer by itself; it's shown after the question review already shows
   * correctness. */
  evidenceQuote: string;
  /** Strategy-only guidance shown on request BEFORE submission — must
   * never reveal or narrow down to the correct option. */
  hint: string;
  explanation: TopikReadingQuestionExplanation;
}

/** One word extracted from a passage for the "New Vocabulary" section. */
export interface TopikReadingVocabularyItem {
  term: string; // Korean
  translation: string; // in the feedback language
  definition: string; // in the feedback language
  exampleSentence: string; // Korean
}

export interface TopikReadingSet {
  id: string;
  level: TopikLevel;
  mode: TopikReadingMode;
  passages: TopikReadingPassage[];
  questions: TopikReadingQuestion[];
  vocabulary: TopikReadingVocabularyItem[];
}

export interface TopikReadingAnswer {
  questionId: string;
  /** Empty array means unanswered. */
  selectedOptionIds: string[];
}

export interface TopikReadingQuestionResult {
  questionId: string;
  selectedOptionIds: string[];
  correctOptionIds: string[];
  isCorrect: boolean;
}

/** reading = time before the first answer selection; answering = from the
 * first selection to submit; total = the whole session. Computed purely
 * from real timestamps — see lib/topik/reading-timing.ts. */
export interface TopikReadingTiming {
  readingTimeSeconds: number;
  answeringTimeSeconds: number;
  totalTimeSeconds: number;
  recommendedMinutes: number;
  /** total vs recommended, as a ratio (1 = exactly on pace). */
  paceRatio: number;
}

/** Computed purely from the student's actual selected answers compared
 * against each question's real correctOptionIds — never a random or
 * placeholder score. See lib/topik/reading-scoring.ts. */
export interface TopikReadingResult {
  setId: string;
  level: TopikLevel;
  mode: TopikReadingMode;
  score: number;
  scoreOutOf: number;
  percentage: number;
  passed: boolean;
  accuracy: number;
  timing: TopikReadingTiming;
  questionResults: TopikReadingQuestionResult[];
}

/** One skill's score + a brief explanation grounded in this session's real
 * numbers (correct/total, or timing ratio for "speed"). */
export interface TopikReadingSkillScore {
  skill: TopikReadingSkillTag | "speed";
  label: string;
  scorePercent: number; // 0-100
  explanation: string;
}

export interface TopikReadingFeedback {
  overallPerformance: string;
  skills: TopikReadingSkillScore[];
  strongestSkills: string[];
  weakestSkills: string[];
  /** Personalized coaching sentences explaining WHY points were lost —
   * always derived from this session's real skill/timing numbers, never
   * random or templated independent of the data. See
   * lib/topik/reading-feedback.ts#synthesizeTopikReadingFeedback. */
  strategyInsights: string[];
  estimatedTopikReadiness: string;
}

/** One completed Reading session's real numbers — used for Personal Best
 * and Progress Comparison. Never seeded with placeholder data. Structurally
 * identical to the shared ReadingSessionRecord (types/reading.ts) that
 * UserProfileContext#recordTopikReadingCompletion's signature is declared
 * with — except that shared type's `level` field is narrowed to DelfLevel,
 * a DELF-only artifact of that foundation type being reused verbatim
 * across exams. Since "1"-"6" isn't assignable to DelfLevel, callers build
 * this (TopikLevel-typed) record and cast to ReadingSessionRecord at the
 * recordTopikReadingCompletion call site — see components/topik/TopikReadingPage.tsx. */
export interface TopikReadingSessionRecord {
  date: string; // yyyy-mm-dd
  level: TopikLevel;
  mode: TopikReadingMode;
  score: number;
  scoreOutOf: number;
  percentage: number;
  accuracy: number;
  timeSpentSeconds: number;
  wordsPerMinute: number;
  newVocabularyCount: number;
}

// Referenced only in documentation above — re-exported so this file's
// import isn't flagged unused while keeping the explanation self-contained.
export type { ReadingSessionRecord };

export interface TopikReadingProgressComparison {
  hasPrevious: boolean;
  previousScore: number | null;
  currentScore: number;
  scoreImprovement: number | null;
  previousWordsPerMinute: number | null;
  currentWordsPerMinute: number;
  speedImprovement: number | null;
  previousAccuracy: number | null;
  currentAccuracy: number;
  accuracyImprovement: number | null;
  previousVocabularyCount: number | null;
  currentVocabularyCount: number;
  vocabularyImprovement: number | null;
}

export interface TopikReadingPersonalBest {
  bestScorePercent: number | null;
  averageScorePercent: number | null;
  readingStreakDays: number;
  sessionsCompleted: number;
}
