import type { TopikLevel, TopikTrack } from "@/types/topik";
import type { User } from "@/types/user";
import { defaultLevelForTrack } from "@/lib/utils/topikLevel";

/**
 * Deterministic mapping from a student's recent REAL average practice score
 * to the closest official TOPIK level within their track, using the
 * published official cutoffs:
 *
 *   TOPIK I  — total out of 200 (Listening 100 + Reading 100)
 *     Level 1: 80-139, Level 2: 140-200
 *   TOPIK II — total out of 300 (Listening 100 + Reading 100 + Writing 100)
 *     Level 3: 120-149, Level 4: 150-189, Level 5: 190-229, Level 6: 230-300
 *
 * This app's session scores (ActivityLogEntry.score) are normalized to
 * 0-100 per session, not a raw TOPIK total, so the student's average
 * percentage is projected onto the track's real total-point scale before
 * bucketing — e.g. an 75% average on TOPIK II projects to 225/300, which
 * falls in the Level 5 band. Never a random or fabricated number: with too
 * few real sessions to mean anything, this falls back to
 * profile.topikLevel (the level chosen/estimated at onboarding) instead of
 * guessing.
 */

const MIN_SESSIONS_FOR_ESTIMATE = 3;

interface LevelBand {
  level: TopikLevel;
  min: number;
  max: number;
}

const TOPIK_I_BANDS: LevelBand[] = [
  { level: "1", min: 80, max: 139 },
  { level: "2", min: 140, max: 200 },
];

const TOPIK_II_BANDS: LevelBand[] = [
  { level: "3", min: 120, max: 149 },
  { level: "4", min: 150, max: 189 },
  { level: "5", min: 190, max: 229 },
  { level: "6", min: 230, max: 300 },
];

const TRACK_MAX_TOTAL: Record<TopikTrack, number> = { I: 200, II: 300 };

function bandsForTrack(track: TopikTrack): LevelBand[] {
  return track === "I" ? TOPIK_I_BANDS : TOPIK_II_BANDS;
}

function bucketRawTotal(track: TopikTrack, rawTotal: number): TopikLevel {
  const bands = bandsForTrack(track);
  for (const band of bands) {
    if (rawTotal <= band.max) return band.level;
  }
  // Above the highest band's max (i.e. a perfect or near-perfect average) —
  // the highest level in the track.
  return bands[bands.length - 1].level;
}

/**
 * `recentScores` are real per-session exam-readiness scores (0-100) from
 * profile.topikStats.history — never include vocabulary-practice results,
 * since those aren't exam-section scores. `fallbackLevel` is normally
 * profile.topikLevel.
 */
export function estimateTopikLevel(
  track: TopikTrack,
  recentScores: number[],
  fallbackLevel: TopikLevel | null
): TopikLevel {
  if (recentScores.length < MIN_SESSIONS_FOR_ESTIMATE) {
    return fallbackLevel ?? defaultLevelForTrack(track);
  }
  const averagePercent = recentScores.reduce((sum, s) => sum + s, 0) / recentScores.length;
  const rawTotal = Math.round((averagePercent / 100) * TRACK_MAX_TOTAL[track]);
  return bucketRawTotal(track, rawTotal);
}

/**
 * Convenience wrapper around `estimateTopikLevel` for the common case of
 * "what level is this account really performing at right now" — reused by
 * both the Progress page's level badge and the Today's Word difficulty
 * selection, so the two never disagree and the estimate logic lives in one
 * place. Returns null only when the account has no TOPIK track selected.
 */
export function estimateCurrentTopikLevel(
  profile: Pick<User, "topikTrack" | "topikLevel" | "topikStats">
): TopikLevel | null {
  const track = profile.topikTrack;
  if (!track) return null;
  return estimateTopikLevel(
    track,
    profile.topikStats.history.map((entry) => entry.score),
    profile.topikLevel ?? defaultLevelForTrack(track)
  );
}
