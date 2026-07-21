import type { VocabularyEntry } from "@/types/vocabulary";
import type { FeedbackLanguage } from "@/types/writing-evaluation";
import { getAllDefinitions } from "@/lib/mock/word-of-the-day";

/**
 * Builds the Weekly Quiz entirely from vocabulary the student has actually
 * practiced (profile.vocabularyProgress) — never a static, preloaded word
 * list. A brand-new account with no practiced words gets zero questions;
 * the page shows an honest empty state instead of demo content.
 */

export interface VocabQuizQuestion {
  id: string;
  word: string;
  correctAnswer: string;
  options: string[];
}

const MAX_QUESTIONS = 10;
const OPTION_COUNT = 4;

/** Deterministic string hash (djb2) — seeds the shuffle below so option
 * order is stable across re-renders instead of jumping around every time
 * React re-renders the page, while still varying question-to-question. */
function hashString(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function generateVocabularyQuiz(
  vocabularyProgress: VocabularyEntry[],
  language: FeedbackLanguage
): VocabQuizQuestion[] {
  if (vocabularyProgress.length === 0) return [];

  const practicedDefinitions = vocabularyProgress.map((e) => e.definition[language]);
  const fillerPool = getAllDefinitions(language).filter((d) => !practicedDefinitions.includes(d));

  const entries = seededShuffle(vocabularyProgress, hashString("quiz-order")).slice(0, MAX_QUESTIONS);

  return entries.map((entry) => {
    const correctAnswer = entry.definition[language];
    const otherPracticedDefinitions = practicedDefinitions.filter((d) => d !== correctAnswer);
    const candidatePool = [...new Set([...otherPracticedDefinitions, ...fillerPool])];
    const distractors = seededShuffle(candidatePool, hashString(entry.id)).slice(0, OPTION_COUNT - 1);
    const options = seededShuffle([correctAnswer, ...distractors], hashString(`${entry.id}-options`));
    return { id: entry.id, word: entry.word, correctAnswer, options };
  });
}
