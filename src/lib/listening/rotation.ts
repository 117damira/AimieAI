import type { DelfLevel, ListeningMode } from "@/types/listening";
import { LISTENING_CONTENT_BANK } from "@/config/delf-listening-content";

/**
 * Content rotation for Listening — mirrors lib/writing/topicRotation.ts's
 * established pattern. Practice sessions avoid repeating the
 * most-recently-completed recording(s); the Daily Challenge is a pure
 * function of level + calendar date (no per-user state), so every student
 * at the same level sees the same set on the same day with no server or
 * shared storage required.
 */

const HISTORY_LENGTH_TO_KEEP = 3;

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

/** Picks the recording(s) for a new session. "practice-by-part" returns
 * exactly one recording, never the one most recently completed while an
 * unused alternative exists. "full-exam" returns every recording in the
 * level's pool, ordered so never-completed recordings come first. */
export function pickNextRecordingIds(
  level: DelfLevel,
  mode: Exclude<ListeningMode, "daily-challenge">,
  history: string[]
): string[] {
  const pool = LISTENING_CONTENT_BANK[level];

  if (mode === "full-exam") {
    return [...pool]
      .sort((a, b) => history.indexOf(a.id) - history.indexOf(b.id))
      .map((r) => r.id);
  }

  const lastUsedId = history[history.length - 1];
  const neverUsed = pool.filter((r) => !history.includes(r.id));
  const candidates = neverUsed.length > 0 ? neverUsed : pool.filter((r) => r.id !== lastUsedId);
  const eligible = candidates.length > 0 ? candidates : pool;
  const picked = eligible[Math.floor(Math.random() * eligible.length)];
  return [picked.id];
}

/** Deterministic per calendar day and level — every student at this level
 * gets the identical challenge today, and a different one automatically
 * once the date rolls over, with no shared server state needed. */
export function pickDailyChallengeRecordingId(level: DelfLevel, date: Date = new Date()): string {
  const pool = LISTENING_CONTENT_BANK[level];
  return pool[dayOfYear(date) % pool.length].id;
}

/** Appends completed recording ids to history, capped so old entries
 * eventually roll off and become eligible to repeat again once the pool is
 * otherwise exhausted. */
export function recordListeningHistory(history: string[], recordingIds: string[]): string[] {
  const next = [...history.filter((id) => !recordingIds.includes(id)), ...recordingIds];
  return next.slice(-HISTORY_LENGTH_TO_KEEP);
}
