import { TOPIK_WRITING_LEVELS } from "@/config/topik-writing";
import type { TopikWritingLevel, TopikWritingPrompt } from "@/types/topik-writing";

/** How many recent prompt ids to remember per level before they become
 * eligible to repeat again — kept below the pool size so rotation always
 * has room to pick something unseen for a while, but never grows unbounded.
 * Mirrors lib/writing/topicRotation.ts (DELF) exactly; kept as a separate
 * TOPIK-only module operating on TOPIK_WRITING_LEVELS so the two exam
 * tracks' rotation never share content or state. */
const HISTORY_LENGTH_TO_KEEP = 3;

/**
 * Picks the next writing prompt for a TOPIK II level given the ids used
 * recently. Prefers a prompt never seen before; once every prompt in the
 * pool has been seen, falls back to the least-recently-used one. Either
 * way, it never repeats the immediately previous prompt when the pool has
 * more than one option — the actual pick among equally-eligible candidates
 * is randomized so two learners at the same level don't all see prompts in
 * the same fixed order.
 */
export function pickNextTopikWritingPrompt(
  level: TopikWritingLevel,
  history: string[]
): TopikWritingPrompt {
  const pool = TOPIK_WRITING_LEVELS[level].samplePrompts;
  const lastUsedId = history[history.length - 1];

  const neverSeen = pool.filter((p) => !history.includes(p.id));
  const candidates = neverSeen.length > 0 ? neverSeen : pool.filter((p) => p.id !== lastUsedId);
  const eligible = candidates.length > 0 ? candidates : pool;

  return eligible[Math.floor(Math.random() * eligible.length)];
}

/** Appends a used prompt id to history, capped so old entries eventually
 * roll off and become eligible to repeat again. Signature-identical to
 * lib/writing/topicRotation.ts's recordWritingTopicHistory — that DELF
 * helper is already generic over plain string arrays/ids, which is why
 * UserProfileContext's recordTopikWritingTopic reuses it directly rather
 * than importing this copy; kept here too so this module is a complete,
 * drop-in equivalent on its own. */
export function recordWritingTopicHistory(history: string[], promptId: string): string[] {
  const next = [...history.filter((id) => id !== promptId), promptId];
  return next.slice(-HISTORY_LENGTH_TO_KEEP);
}
