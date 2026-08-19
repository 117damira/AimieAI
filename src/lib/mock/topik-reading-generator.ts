import type { TopikLevel, FeedbackLanguage, TopikReadingMode, TopikReadingSet } from "@/types/topik-reading";
import {
  TOPIK_READING_CONTENT_BANK,
  TOPIK_READING_QUESTIONS_BY_PASSAGE,
  TOPIK_READING_VOCABULARY_BY_PASSAGE,
} from "@/config/topik-reading-content";
import { pickTopikDailyChallengePassageIds, pickNextTopikPassageIds } from "@/lib/topik/reading-rotation";

/**
 * Assembles a TopikReadingSet from the hand-authored offline content bank
 * — used whenever no ANTHROPIC_API_KEY is configured (see
 * lib/ai/topik-reading-generator.ts for the real Claude path), and always
 * for the Daily Challenge regardless of API key (see the route for why).
 * Mirrors lib/mock/reading-generator.ts.
 */
function assembleSet(
  level: TopikLevel,
  mode: TopikReadingMode,
  passageIds: string[],
  language: FeedbackLanguage
): TopikReadingSet {
  const pool = TOPIK_READING_CONTENT_BANK[level];
  const passages = passageIds
    .map((id) => pool.find((p) => p.id === id))
    .filter((p): p is (typeof pool)[number] => p !== undefined);

  const questions = passages.flatMap((p) => TOPIK_READING_QUESTIONS_BY_PASSAGE[p.id]?.[language] ?? []);
  const vocabulary = passages.flatMap((p) => TOPIK_READING_VOCABULARY_BY_PASSAGE[p.id]?.[language] ?? []);

  return {
    id: `topik-${level}-${mode}-${passageIds.join("-")}-${Date.now()}`,
    level,
    mode,
    passages,
    questions,
    vocabulary,
  };
}

export function generateMockTopikReadingSet(
  level: TopikLevel,
  mode: TopikReadingMode,
  language: FeedbackLanguage,
  history: string[]
): TopikReadingSet {
  if (mode === "daily-challenge") {
    return assembleSet(level, mode, pickTopikDailyChallengePassageIds(level), language);
  }
  const passageIds = pickNextTopikPassageIds(level, mode, history);
  return assembleSet(level, mode, passageIds, language);
}
