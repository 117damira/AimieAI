import type { FeedbackLanguage, TopikLevel, TopikListeningMode, TopikListeningSet } from "@/types/topik-listening";
import { TOPIK_LISTENING_CONTENT_BANK, TOPIK_LISTENING_QUESTIONS_BY_RECORDING } from "@/config/topik-listening-content";
import { pickDailyTopikChallengeRecordingIds, pickNextTopikRecordingIds } from "@/lib/topik/listening-rotation";

/**
 * Assembles a TopikListeningSet from the hand-authored offline content bank
 * — used whenever no ANTHROPIC_API_KEY is configured (see
 * lib/ai/topik-listening-generator.ts for the real Claude path), and always
 * for the Daily Challenge regardless of API key (see the route for why).
 * Mirrors lib/mock/listening-generator.ts exactly.
 */
function assembleSet(
  level: TopikLevel,
  mode: TopikListeningMode,
  recordingIds: string[],
  language: FeedbackLanguage
): TopikListeningSet {
  const pool = TOPIK_LISTENING_CONTENT_BANK[level];
  const recordings = recordingIds
    .map((id) => pool.find((r) => r.id === id))
    .filter((r): r is (typeof pool)[number] => r !== undefined);

  const questions = recordings.flatMap((r) => TOPIK_LISTENING_QUESTIONS_BY_RECORDING[r.id]?.[language] ?? []);

  return {
    id: `${level}-${mode}-${recordingIds.join("-")}-${Date.now()}`,
    level,
    mode,
    recordings,
    questions,
  };
}

export function generateMockTopikListeningSet(
  level: TopikLevel,
  mode: TopikListeningMode,
  language: FeedbackLanguage,
  history: string[]
): TopikListeningSet {
  if (mode === "daily-challenge") {
    return assembleSet(level, mode, pickDailyTopikChallengeRecordingIds(level), language);
  }
  const recordingIds = pickNextTopikRecordingIds(level, mode, history);
  return assembleSet(level, mode, recordingIds, language);
}
