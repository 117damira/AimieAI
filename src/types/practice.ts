import type { FeedbackLanguage } from "./writing-evaluation";

export interface WritingPrompt {
  id: string;
  title: string;
  prompt: string;
  minWords: number;
  delfExercise: string;
}

export interface QuizQuestion {
  id: string;
  word: string;
  /** Question wording in the UI's language — the answer options may mix
   * French example sentences (kept identical across languages) with
   * translated English explanations. */
  question: Record<FeedbackLanguage, string>;
  options: Record<FeedbackLanguage, string[]>;
}
