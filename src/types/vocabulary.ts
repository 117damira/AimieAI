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

/** One real grammar mistake found in the student's actual sentence. */
export interface VocabularyMistake {
  original: string;
  correction: string;
  /** What was wrong, why, and which grammar rule applies — one paragraph. */
  whyWrong: string;
}

/** Feedback on a student's own example sentence using a target vocabulary
 * word — evaluates real usage, never a generic "good job". `status` is only
 * ever decided after word-usage, semantic-fit, and grammar have all been
 * checked — never assumed correct by default. */
export interface VocabularySentenceFeedback {
  status: "correct" | "not-used" | "incorrect";
  /** The student's own sentence with every real mistake corrected — null
   * only when status is "correct" and nothing needed changing (the UI shows
   * "No corrections needed." instead of echoing the input back). When the
   * word wasn't used at all, this is a natural example sentence instead,
   * since there's nothing of the student's own to correct. */
  correctedSentence: string | null;
  /** Every real grammar mistake found — empty when there are none. */
  mistakes: VocabularyMistake[];
  /** A more natural phrasing suggestion — null when the sentence already
   * reads naturally. */
  naturalSuggestion: string | null;
  explanation: string;
  encouragement: string;
}
