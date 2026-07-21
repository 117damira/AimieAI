import type { DelfLevel, FeedbackLanguage } from "./writing-evaluation";

export type { DelfLevel, FeedbackLanguage };

/** How a listening set was requested — drives both content generation and
 * rotation/history behavior (see lib/listening/rotation.ts). */
export type ListeningMode = "full-exam" | "practice-by-part" | "daily-challenge";

export type ListeningSkillTag =
  | "mainIdea"
  | "detail"
  | "number"
  | "name"
  | "date"
  | "vocabulary";

export type ListeningDifficulty = "easy" | "medium" | "hard";

/** Official DELF Compréhension de l'Oral structure for one CEFR level —
 * the numbers the Listening Home dashboard displays, and what content
 * generation targets (recording count, max length). */
export interface DelfListeningLevelConfig {
  level: DelfLevel;
  label: string;
  durationMinutes: number;
  recordingCountLabel: string; // e.g. "3–4" or "3" — official DELF wording varies by level
  recordingCountMin: number;
  recordingCountMax: number;
  maxRecordingMinutes: number;
  scoreOutOf: number; // always 25
  minPassingScore: number; // always 5
  topics: Record<FeedbackLanguage, string[]>;
}

/** One listening document/recording — its transcript is what gets
 * synthesized as audio (see lib/utils/ttsPlayer.ts). Always genuinely
 * original content, never a copy of an official DELF recording. */
export interface ListeningRecording {
  id: string;
  partLabel: string; // e.g. "Document 1"
  topic: string; // in the feedback language, for display
  transcript: string; // French — the actual spoken content
  estimatedDurationSeconds: number;
}

export interface ListeningQuestionOption {
  id: string;
  text: string; // in the feedback language
}

/** Why a specific wrong option is wrong — never just "Incorrect": always a
 * real, specific reason tied to what that option actually claims. */
export interface ListeningOptionExplanation {
  optionId: string;
  reason: string;
}

/** The full educational breakdown shown when a question's explanation is
 * expanded — every field grounded in the recording's real transcript, never
 * generic filler. */
export interface ListeningQuestionExplanation {
  /** Where in the recording the answer is found, quoting the real
   * transcript sentence(s). */
  whereInRecording: string;
  /** The specific French keywords/expressions that signal the answer. */
  keywords: string;
  whyCorrect: string;
  /** Every incorrect option explained individually — never omitted, never
   * a bare "incorrect". */
  whyIncorrect: ListeningOptionExplanation[];
  vocabulary: { term: string; translation: string }[];
  grammarPattern: string;
  strategy: string;
}

export interface ListeningQuestion {
  id: string;
  recordingId: string;
  questionNumber: number;
  prompt: string; // in the feedback language
  options: ListeningQuestionOption[];
  correctOptionId: string;
  difficulty: ListeningDifficulty;
  skillTag: ListeningSkillTag;
  explanation: ListeningQuestionExplanation;
}

export interface ListeningSet {
  id: string;
  level: DelfLevel;
  mode: ListeningMode;
  recordings: ListeningRecording[];
  questions: ListeningQuestion[];
}

export interface ListeningAnswer {
  questionId: string;
  selectedOptionId: string | null;
}

export interface ListeningQuestionResult {
  questionId: string;
  selectedOptionId: string | null;
  correctOptionId: string;
  isCorrect: boolean;
}

/** Computed purely from the student's actual answers — never a random or
 * placeholder score. See lib/listening/scoring.ts. */
export interface ListeningResult {
  setId: string;
  level: DelfLevel;
  score: number;
  scoreOutOf: number;
  percentage: number;
  passed: boolean;
  timeSpentSeconds: number;
  accuracy: number;
  questionResults: ListeningQuestionResult[];
}

export interface ListeningFeedback {
  overallPerformance: string;
  strongestSkills: string[];
  weakestSkills: string[];
  listeningAccuracy: string;
  understandingMainIdeas: string;
  understandingDetails: string;
  understandingNumbers: string;
  understandingNames: string;
  understandingDates: string;
  vocabularyComprehension: string;
  recommendations: string[];
  estimatedDelfReadiness: string;
}
