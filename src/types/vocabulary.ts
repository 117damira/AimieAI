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
  /** How many times the student has submitted an AI-graded sentence using
   * this word — real usage, never preloaded. Drives the new/learning/
   * mastered transitions in UserProfileContext.recordVocabularyPractice. */
  timesPracticed: number;
  timesCorrect: number;
}

/** Feedback on a student's own example sentence using a target vocabulary
 * word — evaluates real usage, never a generic "good job". */
export interface VocabularySentenceFeedback {
  /** Whether the target word was actually used, and used correctly. */
  usedCorrectly: boolean;
  /** The student's sentence with real grammar mistakes corrected (or, if
   * the word wasn't used at all, a natural example sentence using it). */
  correctedSentence: string;
  /** What was wrong and why — null when there was nothing to correct. */
  whyWrong: string | null;
  /** A more natural phrasing suggestion — null when the sentence already
   * reads naturally. */
  naturalSuggestion: string | null;
  explanation: string;
  encouragement: string;
}
