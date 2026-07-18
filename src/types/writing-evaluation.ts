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

export interface DelfLevelConfig {
  level: DelfLevel;
  label: string;
  taskType: string;
  expectedStructure: string[];
  minWords: number;
  maxWords: number;
  difficulty: DelfDifficulty;
  evaluationCriteria: string[];
  samplePrompt: {
    title: string;
    delfExercise: string;
    instructions: string;
  };
}

export interface TaskCompletionFeedback {
  addressedPrompt: boolean;
  respectedFormat: boolean;
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
  structure: StructureFeedback;
  languageAccuracy: LanguageAccuracyFeedback;
  vocabulary: VocabularyFeedback;
  examReadiness: ExamReadinessFeedback;
}

export interface WritingEvaluationRequest {
  level: DelfLevel;
  prompt: string;
  response: string;
  language: FeedbackLanguage;
}
