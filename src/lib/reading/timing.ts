import type { ReadingTiming } from "@/types/reading";

/**
 * Splits one Reading session into reading time (before the first answer
 * selection), answering time (from the first selection to submit), and
 * total time — all computed purely from real timestamps captured by the
 * page, never estimated or randomized. Compares the total against the
 * level's official recommended DELF timing (see config/delf-reading.ts).
 */
export function computeReadingTiming(
  sessionStartMs: number,
  firstAnswerMs: number | null,
  submitMs: number,
  recommendedMinutes: number
): ReadingTiming {
  const totalTimeSeconds = Math.max(0, Math.round((submitMs - sessionStartMs) / 1000));
  const readingTimeSeconds =
    firstAnswerMs === null
      ? totalTimeSeconds
      : Math.max(0, Math.round((firstAnswerMs - sessionStartMs) / 1000));
  const answeringTimeSeconds = Math.max(0, totalTimeSeconds - readingTimeSeconds);
  const recommendedSeconds = recommendedMinutes * 60;
  const paceRatio = recommendedSeconds > 0 ? totalTimeSeconds / recommendedSeconds : 1;

  return {
    readingTimeSeconds,
    answeringTimeSeconds,
    totalTimeSeconds,
    recommendedMinutes,
    paceRatio,
  };
}

export type PaceTier = "fast" | "onPace" | "slow";

/** < 85% of recommended time = fast (risk of rushing/guessing), 85-115% =
 * on pace, > 115% = slow (risk of over-translating word by word). */
export function classifyPace(paceRatio: number): PaceTier {
  if (paceRatio < 0.85) return "fast";
  if (paceRatio > 1.15) return "slow";
  return "onPace";
}
