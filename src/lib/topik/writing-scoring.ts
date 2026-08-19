import type { TopikWritingTaskType } from "@/types/topik-writing";

/**
 * Real TOPIK II Writing point values: Q51/Q52 (short-answer) are worth 10
 * points each, Q53 (data-description) 30 points, Q54 (essay) 50 points —
 * 100 points total across the whole exam. A single practice session grades
 * one task at a time, so that task's point ceiling is its real share of
 * the 100-point exam.
 */
export const TOPIK_TASK_MAX_POINTS: Record<TopikWritingTaskType, number> = {
  "short-answer": 10,
  "data-description": 30,
  essay: 50,
};

export interface TopikWritingScore {
  /** Points actually earned on this task, 0..taskMaxPoints. */
  taskPoints: number;
  /** This task's real point ceiling (10, 30, or 50). */
  taskMaxPoints: number;
  /** taskPoints expressed on the full 100-point TOPIK Writing scale. Since
   * each task's point value already is its real share of that 100-point
   * total, this always equals taskPoints. */
  estimatedScore: number;
  /** Always 100. */
  scoreOutOf: number;
}

/**
 * Deterministic point aggregation for a single task attempt: takes a 0-1
 * performance ratio — computed by the AI or mock evaluator from genuine
 * judged criteria, never randomized — and scales it onto this task's real
 * point ceiling. Never uses Math.random(); the same ratio always produces
 * the same score. Both lib/ai/topik-writing-evaluator.ts and
 * lib/mock/topik-writing-evaluation.ts funnel their judged performance
 * through this single function so the point ceilings and 100-point scale
 * stay consistent regardless of which evaluator produced the judgment.
 */
export function aggregateTopikWritingScore(
  taskType: TopikWritingTaskType,
  performanceRatio: number
): TopikWritingScore {
  const taskMaxPoints = TOPIK_TASK_MAX_POINTS[taskType];
  const clampedRatio = Math.max(0, Math.min(1, performanceRatio));
  const taskPoints = Math.round(clampedRatio * taskMaxPoints);

  return {
    taskPoints,
    taskMaxPoints,
    estimatedScore: taskPoints,
    scoreOutOf: 100,
  };
}
