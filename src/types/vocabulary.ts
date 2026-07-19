import type { FeedbackLanguage } from "./writing-evaluation";

export interface WordOfTheDay {
  id: string;
  word: string;
  partOfSpeech: string;
  pronunciation: string;
  /** Definition and usage notes explain the French word in the UI's
   * language — only `word` and `exampleSentences` are actual French content. */
  definition: Record<FeedbackLanguage, string>;
  icon: string;
  goodContexts: Record<FeedbackLanguage, string[]>;
  badContexts: Record<FeedbackLanguage, string[]>;
  exampleSentences: string[];
}

export interface VocabularyEntry {
  id: string;
  word: string;
  definition: Record<FeedbackLanguage, string>;
  learnedOn: string;
  mastery: "new" | "learning" | "mastered";
}
