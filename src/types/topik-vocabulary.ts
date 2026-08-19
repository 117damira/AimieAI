import type { FeedbackLanguage } from "./writing-evaluation";

/**
 * TOPIK equivalent of vocabulary.ts's WordOfTheDay — a completely separate
 * word bank shape for Korean vocabulary. Adds `romanization` (Revised
 * Romanization of Korean) alongside the Hangul `word`, since a Korean
 * learner needs both the script and a pronunciation-friendly transliteration
 * (French's WordOfTheDay only needed an IPA `pronunciation` string).
 */
export interface TopikWordOfTheDay {
  id: string;
  /** The Korean word itself, in Hangul. */
  word: string;
  /** Revised Romanization of Korean, e.g. "annyeonghaseyo". */
  romanization: string;
  partOfSpeech: string;
  /** Definition and usage notes explain the Korean word in the UI's
   * language — only `word`, `romanization`, and `exampleSentences` are
   * actual Korean-script/romanized content. */
  definition: Record<FeedbackLanguage, string>;
  icon: string;
  goodContexts: Record<FeedbackLanguage, string[]>;
  badContexts: Record<FeedbackLanguage, string[]>;
  exampleSentences: string[];
}
