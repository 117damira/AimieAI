import type { TopikLevel, TopikTrack } from "./topik";
import type { FeedbackLanguage } from "./writing-evaluation";

export type { TopikLevel, TopikTrack, FeedbackLanguage };

/** How a listening set was requested — drives both content generation and
 * rotation/history behavior (see lib/topik/listening-rotation.ts), and which
 * scoring system applies (see lib/topik/listening-scoring.ts): "full-exam"
 * uses the official 100-point TOPIK Listening section scale, the other two
 * modes are practice and are scored lightly out of their own question
 * count. Mirrors types/listening.ts's ListeningMode exactly. */
export type TopikListeningMode = "full-exam" | "practice-by-part" | "daily-challenge";

/** Per official TOPIK listening task concepts: identify the main idea,
 * identify the speaker's intention/purpose, identify a specific detail,
 * choose the statement matching the conversation/announcement, understand
 * numbers/dates/locations/situations, understand the relationship between
 * speakers, and infer meaning not stated directly. */
export type TopikListeningSkillTag =
  | "mainIdea"
  | "speakerIntention"
  | "detail"
  | "statementMatch"
  | "numberDateLocation"
  | "relationship"
  | "inference";

export type TopikListeningDifficulty = "easy" | "medium" | "hard";

/** "true-false" and "multiple-choice" are both single-answer (exactly one
 * correct option); "multi-select" requires choosing every option that
 * applies — see TopikListeningQuestion.correctOptionIds. */
export type TopikListeningQuestionType = "multiple-choice" | "true-false" | "multi-select";

/** One level's Listening section structure — the numbers the Listening Home
 * dashboard displays, and what content generation targets (recording count,
 * max length). TOPIK Listening is officially scored out of 100 within a
 * combined 200-point TOPIK I test (Levels 1-2) or 300-point TOPIK II test
 * (Levels 3-6) — see config/topik-listening.ts for how "passed" is treated
 * as a practice proxy here since this module scores Listening alone. */
export interface TopikListeningLevelConfig {
  level: TopikLevel;
  track: TopikTrack;
  label: string;
  durationMinutes: number;
  recordingCountLabel: string; // e.g. "4" or "6–8" — wording varies by level
  recordingCountMin: number;
  recordingCountMax: number;
  maxRecordingMinutes: number;
  scoreOutOf: number; // always 100 — the official Listening section scale
  minPassingScore: number; // practice proxy, NOT the real combined-level cutoff — see config comment
  topics: Record<FeedbackLanguage, string[]>;
}

/** One listening document/recording — its transcript is what gets
 * synthesized as audio (see lib/utils/ttsPlayer.ts). Always genuinely
 * original Korean content, never a copy of an official TOPIK recording and
 * never a translation of DELF French content. */
export interface TopikListeningRecording {
  id: string;
  partLabel: string; // e.g. "Recording 1"
  topic: string; // in the feedback language, for display
  transcript: string; // Korean — the actual spoken content
  estimatedDurationSeconds: number;
}

export interface TopikListeningQuestionOption {
  id: string;
  text: string; // in the feedback language
}

/** Why a specific wrong option is wrong — never just "Incorrect": always a
 * real, specific reason tied to what that option actually claims. */
export interface TopikListeningOptionExplanation {
  optionId: string;
  reason: string;
}

/** The full educational breakdown shown when a question's explanation is
 * expanded — every field grounded in the recording's real transcript, never
 * generic filler. */
export interface TopikListeningQuestionExplanation {
  /** Where in the recording the answer is found, quoting the real
   * transcript sentence(s). */
  whereInRecording: string;
  /** The specific Korean keywords/expressions that signal the answer. */
  keywords: string;
  whyCorrect: string;
  /** Every incorrect option explained individually — never omitted, never
   * a bare "incorrect". */
  whyIncorrect: TopikListeningOptionExplanation[];
  vocabulary: { term: string; translation: string }[];
  grammarPattern: string;
  strategy: string;
}

export interface TopikListeningQuestion {
  id: string;
  recordingId: string;
  questionNumber: number;
  type: TopikListeningQuestionType;
  prompt: string; // in the feedback language
  options: TopikListeningQuestionOption[];
  /** Every option id that counts as correct. Length 1 for "multiple-choice"
   * and "true-false"; length >= 1 for "multi-select". */
  correctOptionIds: string[];
  difficulty: TopikListeningDifficulty;
  skillTag: TopikListeningSkillTag;
  explanation: TopikListeningQuestionExplanation;
}

export interface TopikListeningSet {
  id: string;
  level: TopikLevel;
  mode: TopikListeningMode;
  recordings: TopikListeningRecording[];
  questions: TopikListeningQuestion[];
}

export interface TopikListeningAnswer {
  questionId: string;
  /** Empty array means unanswered. Single-answer question types are
   * constrained to at most one id by the UI, not by this shape. */
  selectedOptionIds: string[];
}

export interface TopikListeningQuestionResult {
  questionId: string;
  selectedOptionIds: string[];
  correctOptionIds: string[];
  isCorrect: boolean;
}

/** Computed purely from the student's actual answers — never a random or
 * placeholder score. See lib/topik/listening-scoring.ts. Full Exam scores
 * out of the official 100; practice modes (Practice by Part, Daily
 * Challenge) score out of their own question count and are never presented
 * as the 100-point scale. */
export interface TopikListeningResult {
  setId: string;
  level: TopikLevel;
  mode: TopikListeningMode;
  score: number;
  scoreOutOf: number;
  percentage: number;
  passed: boolean;
  timeSpentSeconds: number;
  accuracy: number;
  questionResults: TopikListeningQuestionResult[];
}

export interface TopikListeningFeedback {
  overallPerformance: string;
  strongestSkills: string[];
  weakestSkills: string[];
  listeningAccuracy: string;
  understandingMainIdea: string;
  understandingSpeakerIntention: string;
  understandingDetail: string;
  understandingStatementMatch: string;
  understandingNumberDateLocation: string;
  understandingRelationship: string;
  understandingInference: string;
  recommendations: string[];
  estimatedTopikReadiness: string;
}
