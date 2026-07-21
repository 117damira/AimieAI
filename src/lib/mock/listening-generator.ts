import type { DelfLevel, FeedbackLanguage, ListeningMode, ListeningSet } from "@/types/listening";
import { LISTENING_CONTENT_BANK, LISTENING_QUESTIONS_BY_RECORDING } from "@/config/delf-listening-content";
import { pickDailyChallengeRecordingId, pickNextRecordingIds } from "@/lib/listening/rotation";

/**
 * Assembles a ListeningSet from the hand-authored offline content bank —
 * used whenever no ANTHROPIC_API_KEY is configured (see
 * lib/ai/listening-generator.ts for the real Claude path), and always for
 * the Daily Challenge regardless of API key (see the route for why).
 */
function assembleSet(
  level: DelfLevel,
  mode: ListeningMode,
  recordingIds: string[],
  language: FeedbackLanguage
): ListeningSet {
  const pool = LISTENING_CONTENT_BANK[level];
  const recordings = recordingIds
    .map((id) => pool.find((r) => r.id === id))
    .filter((r): r is (typeof pool)[number] => r !== undefined);

  const questions = recordings.flatMap((r) => LISTENING_QUESTIONS_BY_RECORDING[r.id]?.[language] ?? []);

  return {
    id: `${level}-${mode}-${recordingIds.join("-")}-${Date.now()}`,
    level,
    mode,
    recordings,
    questions,
  };
}

export function generateMockListeningSet(
  level: DelfLevel,
  mode: ListeningMode,
  language: FeedbackLanguage,
  history: string[]
): ListeningSet {
  if (mode === "daily-challenge") {
    return assembleSet(level, mode, [pickDailyChallengeRecordingId(level)], language);
  }
  const recordingIds = pickNextRecordingIds(level, mode, history);
  return assembleSet(level, mode, recordingIds, language);
}
