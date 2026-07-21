export type DelfLevel = "A1" | "A2" | "B1" | "B2";

/** Language the AI evaluation feedback is written in. The exam prompt and
 * the student's own response always stay in French — this only controls
 * the language of the generated feedback text. */
export type FeedbackLanguage = "en" | "ru" | "kz";

export type DelfDifficulty =
  | "Beginner"
  | "Elementary"
  | "Intermediate"
  | "Upper-Intermediate";

export interface WritingTopicPrompt {
  /** Stable id, unique within a level — used to track topic rotation
   * history so the same prompt isn't shown twice in a row. */
  id: string;
  title: string;
  delfExercise: string;
  instructions: string;
}

export interface DelfLevelConfig {
  level: DelfLevel;
  label: string;
  /** Describes the exercise format in the UI's language — not exam content. */
  taskType: Record<FeedbackLanguage, string>;
  expectedStructure: Record<FeedbackLanguage, string[]>;
  minWords: number;
  maxWords: number;
  difficulty: DelfDifficulty;
  evaluationCriteria: string[];
  /** A pool of real DELF-style prompts for this level — rotated so a
   * learner doesn't see the same topic every session (see
   * lib/writing/topicRotation.ts). */
  samplePrompts: WritingTopicPrompt[];
}

export interface TaskCompletionFeedback {
  addressedPrompt: boolean;
  respectedFormat: boolean;
  notes: string;
  /** Concrete, itemized list of what's missing from the response (e.g.
   * "a greeting", "your age") — never a vague restatement of addressedPrompt. */
  missingElements: string[];
}

export interface RelevanceFeedback {
  /** Whether the response genuinely engages with the actual prompt's
   * subject matter — distinct from taskCompletion, which covers format/
   * length/required-elements rather than topical relevance. */
  isRelevant: boolean;
  notes: string;
}

export interface CoherenceFeedback {
  /** Whether ideas connect logically (via connectors, sentence-to-sentence
   * flow) rather than just being present (that's structure's job). */
  isCoherent: boolean;
  notes: string;
}

export interface StructureFeedback {
  hasIntroduction: boolean;
  hasMainIdeas: boolean;
  hasConclusion: boolean;
  conclusionRequired: boolean;
  paragraphOrganization: string;
}

export interface GrammarError {
  original: string;
  correction: string;
  explanation: string;
  category: "verb" | "agreement" | "sentence-structure" | "other";
}

export interface LanguageAccuracyFeedback {
  errors: GrammarError[];
  summary: string;
}

export interface VocabularyFeedback {
  wordChoice: string;
  variety: string;
  levelAppropriateness: string;
}

export interface ExamReadinessFeedback {
  estimatedScore: number;
  scoreOutOf: number;
  strengths: string[];
  weaknesses: string[];
  improvementTips: string[];
  scoreExplanation: string;
}

export interface WritingEvaluation {
  level: DelfLevel;
  wordCount: number;
  taskCompletion: TaskCompletionFeedback;
  relevance: RelevanceFeedback;
  structure: StructureFeedback;
  coherence: CoherenceFeedback;
  languageAccuracy: LanguageAccuracyFeedback;
  vocabulary: VocabularyFeedback;
  examReadiness: ExamReadinessFeedback;
  /** A corrected/lightly-expanded version of the student's OWN response —
   * real grammar fixes applied, plus formulaic scaffolding (greeting/
   * closing) and bracketed placeholders for missing required info. Never
   * invents personal facts the student didn't provide. */
  improvedVersion: string;
}

export interface WritingEvaluationRequest {
  level: DelfLevel;
  prompt: string;
  response: string;
  language: FeedbackLanguage;
}
