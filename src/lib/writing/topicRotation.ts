import { DELF_WRITING_LEVELS } from "@/config/delf-writing";
import type { DelfLevel, WritingTopicPrompt } from "@/types/writing-evaluation";

/** How many recent prompt ids to remember per level before they become
 * eligible to repeat again — kept below the pool size so rotation always
 * has room to pick something unseen for a while, but never grows unbounded. */
const HISTORY_LENGTH_TO_KEEP = 3;

/**
 * Picks the next writing prompt for a level given the ids used recently.
 * Prefers a prompt never seen before; once every prompt in the pool has
 * been seen, falls back to the least-recently-used one. Either way, it
 * never repeats the immediately previous prompt when the pool has more
 * than one option — deterministic given history, no randomness needed for
 * correctness (a stable rotation), but the actual pick is chosen at random
 * among equally-eligible candidates so two learners at the same level
 * don't all see prompts in the same fixed order.
 */
export function pickNextWritingPrompt(level: DelfLevel, history: string[]): WritingTopicPrompt {
  const pool = DELF_WRITING_LEVELS[level].samplePrompts;
  const lastUsedId = history[history.length - 1];

  const neverSeen = pool.filter((p) => !history.includes(p.id));
  const candidates = neverSeen.length > 0 ? neverSeen : pool.filter((p) => p.id !== lastUsedId);
  const eligible = candidates.length > 0 ? candidates : pool;

  return eligible[Math.floor(Math.random() * eligible.length)];
}

/** Appends a used prompt id to history, capped so old entries eventually
 * roll off and become eligible to repeat again. */
export function recordWritingTopicHistory(history: string[], promptId: string): string[] {
  const next = [...history.filter((id) => id !== promptId), promptId];
  return next.slice(-HISTORY_LENGTH_TO_KEEP);
}
