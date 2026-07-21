import type { DelfLevel, ReadingMode } from "@/types/reading";
import { READING_CONTENT_BANK } from "@/config/delf-reading-content";
import { DELF_READING_LEVELS } from "@/config/delf-reading";

/**
 * Content rotation for Reading — direct copy of lib/listening/rotation.ts's
 * established pattern. Practice sessions avoid repeating the
 * most-recently-completed passage(s); the Daily Challenge is a pure
 * function of level + calendar date (no per-user state), so every student
 * at the same level sees the same set on the same day with no server or
 * shared storage required.
 */

const HISTORY_LENGTH_TO_KEEP = 6;
/** How many passages the Daily Challenge combines — more than a single
 * "Practice by Text" passage, so it feels like real daily practice rather
 * than a tiny demo, without ballooning to a full exam's length. */
const DAILY_CHALLENGE_PASSAGE_COUNT = 2;

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

/** Orders a pool so ids not in `history` come first, then the
 * least-recently-used of the rest — used to build a rotating subset. */
function orderByRecency<T extends { id: string }>(pool: T[], history: string[]): T[] {
  return [...pool].sort((a, b) => {
    const indexA = history.indexOf(a.id);
    const indexB = history.indexOf(b.id);
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return -1;
    if (indexB === -1) return 1;
    return indexA - indexB;
  });
}

/** Picks the passage(s) for a new session.
 * - "practice-by-text": exactly one passage, never the one most recently
 *   completed while an unused alternative exists.
 * - "full-exam": a rotating subset sized to the level's official passage
 *   count, ordered so never-completed passages are preferred. */
export function pickNextPassageIds(
  level: DelfLevel,
  mode: Exclude<ReadingMode, "daily-challenge">,
  history: string[]
): string[] {
  const pool = READING_CONTENT_BANK[level];

  if (mode === "full-exam") {
    const examSize = Math.min(DELF_READING_LEVELS[level].passageCountMin, pool.length);
    return orderByRecency(pool, history)
      .slice(0, examSize)
      .map((p) => p.id);
  }

  const lastUsedId = history[history.length - 1];
  const neverUsed = pool.filter((p) => !history.includes(p.id));
  const candidates = neverUsed.length > 0 ? neverUsed : pool.filter((p) => p.id !== lastUsedId);
  const eligible = candidates.length > 0 ? candidates : pool;
  const picked = eligible[Math.floor(Math.random() * eligible.length)];
  return [picked.id];
}

/** Deterministic per calendar day and level — every student at this level
 * gets identical Daily Challenge content today, and different content
 * automatically once the date rolls over, with no shared server state
 * needed. */
export function pickDailyChallengePassageIds(level: DelfLevel, date: Date = new Date()): string[] {
  const pool = READING_CONTENT_BANK[level];
  const count = Math.min(DAILY_CHALLENGE_PASSAGE_COUNT, pool.length);
  const startIndex = dayOfYear(date) % pool.length;
  const ids: string[] = [];
  for (let i = 0; i < count; i++) {
    ids.push(pool[(startIndex + i) % pool.length].id);
  }
  return ids;
}

/** Appends completed passage ids to history, capped so old entries
 * eventually roll off and become eligible to repeat again once the pool is
 * otherwise exhausted. */
export function recordReadingHistory(history: string[], passageIds: string[]): string[] {
  const next = [...history.filter((id) => !passageIds.includes(id)), ...passageIds];
  return next.slice(-HISTORY_LENGTH_TO_KEEP);
}
