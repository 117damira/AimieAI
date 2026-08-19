import type { TopikReadingTiming } from "@/types/topik-reading";

/**
 * Splits one Reading session into reading time (before the first answer
 * selection), answering time (from the first selection to submit), and
 * total time — all computed purely from real timestamps captured by the
 * page, never estimated or randomized. Compares the total against the
 * level's official recommended TOPIK timing (see config/topik-reading.ts).
 * Mirrors lib/reading/timing.ts exactly.
 */
export function computeTopikReadingTiming(
  sessionStartMs: number,
  firstAnswerMs: number | null,
  submitMs: number,
  recommendedMinutes: number
): TopikReadingTiming {
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

export type TopikPaceTier = "fast" | "onPace" | "slow";

/** < 85% of recommended time = fast (risk of rushing/guessing), 85-115% =
 * on pace, > 115% = slow (risk of over-translating word by word). Same
 * thresholds as lib/reading/timing.ts#classifyPace — the ratio is relative
 * to the level's own recommended time, so it needs no language-specific
 * tuning. */
export function classifyTopikPace(paceRatio: number): TopikPaceTier {
  if (paceRatio < 0.85) return "fast";
  if (paceRatio > 1.15) return "slow";
  return "onPace";
}

/** Reference reading pace for TOPIK-level Korean text, expressed in 어절
 * (space-separated word-units) per minute — the standard informal way
 * Korean passage length/pace is measured, analogous to WPM for
 * space-delimited languages. This is a rough documentation-only estimate
 * for a comfortable intermediate reader; actual per-session pace is always
 * computed live from real timestamps and the passage's own word count
 * (see the caller in components/topik/TopikReadingPage.tsx), never assumed
 * to equal this constant. */
export const REFERENCE_KOREAN_WORDS_PER_MINUTE = 110;
