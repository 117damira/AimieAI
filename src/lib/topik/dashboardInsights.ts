import type { User } from "@/types/user";

/**
 * Shared, deterministic "how is this student actually doing" computation —
 * used by both the Dashboard's Recommendation card and the Aimie Buddy
 * chat context, so the two always agree (Buddy never contradicts what the
 * Recommendation card already told the student). Never randomized; every
 * value is derived from profile.topikStats.history, the same real session
 * data the Progress page uses.
 */

export type TopikSkill = "listening" | "reading" | "writing";

export interface TopikSkillAverages {
  listening: number | null;
  reading: number | null;
  writing: number | null;
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

export function computeTopikSkillAverages(profile: Pick<User, "topikStats">): TopikSkillAverages {
  const history = profile.topikStats.history;
  return {
    listening: average(history.filter((h) => h.activity === "listening").map((h) => h.score)),
    reading: average(history.filter((h) => h.activity === "reading").map((h) => h.score)),
    writing: average(history.filter((h) => h.activity === "writing").map((h) => h.score)),
  };
}

/** Lowest-scoring skill with real data, restricted to Writing only when the
 * account is TOPIK II (Writing doesn't exist for TOPIK I). Null when there's
 * no session data yet for any in-scope skill. */
export function weakestTopikSkill(
  averages: TopikSkillAverages,
  isTrackII: boolean
): TopikSkill | null {
  const candidates: { skill: TopikSkill; value: number }[] = [];
  if (averages.listening !== null) candidates.push({ skill: "listening", value: averages.listening });
  if (averages.reading !== null) candidates.push({ skill: "reading", value: averages.reading });
  if (isTrackII && averages.writing !== null) candidates.push({ skill: "writing", value: averages.writing });
  if (candidates.length === 0) return null;
  return candidates.reduce((min, c) => (c.value < min.value ? c : min)).skill;
}

export function daysUntilExamDate(examDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exam = new Date(examDate);
  exam.setHours(0, 0, 0, 0);
  return Math.round((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
