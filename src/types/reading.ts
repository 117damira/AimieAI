import type { DelfLevel, FeedbackLanguage } from "./writing-evaluation";

export type { DelfLevel, FeedbackLanguage };

/** How a reading set was requested — mirrors ListeningMode. "full-exam" uses
 * the official 25-point DELF scale, the other two modes are practice and
 * are scored lightly out of their own question count. */
export type ReadingMode = "full-exam" | "practice-by-text" | "daily-challenge";

/** "speed" is never a question tag — it's computed purely from timing (see
 * lib/reading/timing.ts), never assigned to an individual question. */
export type ReadingSkillTag = "mainIdea" | "detail" | "inference" | "vocabulary" | "grammar";

export type ReadingDifficulty = "easy" | "medium" | "hard";

/** Official DELF Compréhension des Écrits structure for one CEFR level —
 * the numbers the Reading Home dashboard displays, and what content
 * generation targets (passage count, max length). */
export interface DelfReadingLevelConfig {
  level: DelfLevel;
  label: string;
  durationMinutes: number;
  passageCountLabel: string; // e.g. "4–5" or "2" — official DELF wording varies by level
  passageCountMin: number;
  passageCountMax: number;
  maxWordsPerPassage: number;
  scoreOutOf: number; // always 25 — the official Full Exam scale
  minPassingScore: number; // always 5
  textTypes: Record<FeedbackLanguage, string[]>;
  topics: Record<FeedbackLanguage, string[]>;
}

/** All types share one scoring mechanism (options[] + correctOptionIds[]) —
 * "matching"/"heading-matching" are modeled as a single pairing decision
 * using that same shape; only the type tag changes prompt framing/UI label. */
export type ReadingQuestionType =
  | "multiple-choice"
  | "true-false"
  | "multi-select"
  | "matching"
  | "heading-matching";

/** One DELF-style reading passage — always genuinely original, never a copy
 * of a real official DELF text. */
export interface ReadingPassage {
  id: string;
  textType: string; // e.g. "email", "newspaper article" — in the feedback language
  title: string; // in the feedback language
  body: string; // French — the actual passage text
  estimatedWordCount: number;
}

export interface ReadingQuestionOption {
  id: string;
  text: string; // in the feedback language
}

/** Why a specific wrong option is wrong — never just "Incorrect": always a
 * real, specific reason tied to what that option actually claims. */
export interface ReadingOptionExplanation {
  optionId: string;
  reason: string;
}

/** The full educational breakdown shown when a question's explanation is
 * expanded — every field grounded in the passage's real text, never generic
 * filler. */
export interface ReadingQuestionExplanation {
  /** Where in the passage the answer is found, quoting the real text. */
  whereInText: string;
  /** The specific French keywords/expressions that signal the answer. */
  keywords: string;
  whyCorrect: string;
  /** Every incorrect option explained individually — never omitted, never a
   * bare "incorrect". */
  whyIncorrect: ReadingOptionExplanation[];
  vocabulary: { term: string; translation: string }[];
  grammarPattern: string;
  strategy: string;
}

export interface ReadingQuestion {
  id: string;
  passageId: string;
  questionNumber: number;
  type: ReadingQuestionType;
  prompt: string; // in the feedback language
  options: ReadingQuestionOption[];
  /** Every option id that counts as correct. Length 1 for single-answer
   * types; length >= 1 for "multi-select". */
  correctOptionIds: string[];
  difficulty: ReadingDifficulty;
  skillTag: ReadingSkillTag;
  /** An exact substring of the passage body — the sentence/paragraph a
   * "Show where the answer is in the text" click highlights. Never reveals
   * the answer by itself; it's shown after the question review already
   * shows correctness. */
  evidenceQuote: string;
  /** Strategy-only guidance shown on request BEFORE submission — must never
   * reveal or narrow down to the correct option. */
  hint: string;
  explanation: ReadingQuestionExplanation;
}

/** One word extracted from a passage for the "New Vocabulary" section. */
export interface ReadingVocabularyItem {
  term: string; // French
  translation: string; // in the feedback language
  definition: string; // in the feedback language
  exampleSentence: string; // French
}

export interface ReadingSet {
  id: string;
  level: DelfLevel;
  mode: ReadingMode;
  passages: ReadingPassage[];
  questions: ReadingQuestion[];
  vocabulary: ReadingVocabularyItem[];
}

export interface ReadingAnswer {
  questionId: string;
  /** Empty array means unanswered. */
  selectedOptionIds: string[];
}

export interface ReadingQuestionResult {
  questionId: string;
  selectedOptionIds: string[];
  correctOptionIds: string[];
  isCorrect: boolean;
}

/** reading = time before the first answer selection; answering = from the
 * first selection to submit; total = the whole session. Computed purely
 * from real timestamps — see lib/reading/timing.ts. */
export interface ReadingTiming {
  readingTimeSeconds: number;
  answeringTimeSeconds: number;
  totalTimeSeconds: number;
  recommendedMinutes: number;
  /** total vs recommended, as a ratio (1 = exactly on pace). */
  paceRatio: number;
}

/** Computed purely from the student's actual selected answers compared
 * against each question's real correctOptionIds — never a random or
 * placeholder score. See lib/reading/scoring.ts. */
export interface ReadingResult {
  setId: string;
  level: DelfLevel;
  mode: ReadingMode;
  score: number;
  scoreOutOf: number;
  percentage: number;
  passed: boolean;
  accuracy: number;
  timing: ReadingTiming;
  questionResults: ReadingQuestionResult[];
}

/** One skill's score + a brief explanation grounded in this session's real
 * numbers (correct/total, or timing ratio for "speed"). */
export interface ReadingSkillScore {
  skill: ReadingSkillTag | "speed";
  label: string;
  scorePercent: number; // 0-100
  explanation: string;
}

export interface ReadingFeedback {
  overallPerformance: string;
  skills: ReadingSkillScore[];
  strongestSkills: string[];
  weakestSkills: string[];
  /** Personalized coaching sentences explaining WHY points were lost —
   * always derived from this session's real skill/timing numbers, never
   * random or templated independent of the data. See
   * lib/reading/feedback.ts#synthesizeReadingStrategy. */
  strategyInsights: string[];
  estimatedDelfReadiness: string;
}

/** One completed Reading session's real numbers — used for Personal Best and
 * Progress Comparison. Never seeded with placeholder data. */
export interface ReadingSessionRecord {
  date: string; // yyyy-mm-dd
  level: DelfLevel;
  mode: ReadingMode;
  score: number;
  scoreOutOf: number;
  percentage: number;
  accuracy: number;
  timeSpentSeconds: number;
  wordsPerMinute: number;
  newVocabularyCount: number;
}

export interface ReadingProgressComparison {
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

export interface ReadingPersonalBest {
  bestScorePercent: number | null;
  averageScorePercent: number | null;
  readingStreakDays: number;
  sessionsCompleted: number;
}
