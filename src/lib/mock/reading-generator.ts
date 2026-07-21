import type { DelfLevel, FeedbackLanguage, ReadingMode, ReadingSet } from "@/types/reading";
import {
  READING_CONTENT_BANK,
  READING_QUESTIONS_BY_PASSAGE,
  READING_VOCABULARY_BY_PASSAGE,
} from "@/config/delf-reading-content";
import { pickDailyChallengePassageIds, pickNextPassageIds } from "@/lib/reading/rotation";

/**
 * Assembles a ReadingSet from the hand-authored offline content bank — used
 * whenever no ANTHROPIC_API_KEY is configured (see lib/ai/reading-generator.ts
 * for the real Claude path), and always for the Daily Challenge regardless
 * of API key (see the route for why). Mirrors lib/mock/listening-generator.ts.
 */
function assembleSet(
  level: DelfLevel,
  mode: ReadingMode,
  passageIds: string[],
  language: FeedbackLanguage
): ReadingSet {
  const pool = READING_CONTENT_BANK[level];
  const passages = passageIds
    .map((id) => pool.find((p) => p.id === id))
    .filter((p): p is (typeof pool)[number] => p !== undefined);

  const questions = passages.flatMap((p) => READING_QUESTIONS_BY_PASSAGE[p.id]?.[language] ?? []);
  const vocabulary = passages.flatMap((p) => READING_VOCABULARY_BY_PASSAGE[p.id]?.[language] ?? []);

  return {
    id: `${level}-${mode}-${passageIds.join("-")}-${Date.now()}`,
    level,
    mode,
    passages,
    questions,
    vocabulary,
  };
}

export function generateMockReadingSet(
  level: DelfLevel,
  mode: ReadingMode,
  language: FeedbackLanguage,
  history: string[]
): ReadingSet {
  if (mode === "daily-challenge") {
    return assembleSet(level, mode, pickDailyChallengePassageIds(level), language);
  }
  const passageIds = pickNextPassageIds(level, mode, history);
  return assembleSet(level, mode, passageIds, language);
}
