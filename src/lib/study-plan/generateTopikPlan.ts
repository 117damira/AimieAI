import type { User } from "@/types/user";
import type { FeedbackLanguage } from "@/types/writing-evaluation";
import type { StudyPlanDay, StudyPlanSkill, StudyPlanTask } from "./generatePlan";

/**
 * TOPIK equivalent of lib/study-plan/generatePlan.ts — the exact same
 * deterministic weighted-scheduling algorithm, sourced from
 * profile.topikStats.history and profile.examDate (the shared exam-date
 * field) instead of DELF's profile.stats.history. TOPIK never has a
 * "speaking" skill; "writing" only enters the pool for TOPIK II (profile.
 * topikTrack === "II"). Fully independent of generateStudyPlan — never
 * reads or writes DELF's stats.
 */

export type TopikStudyPlanSkill = "listening" | "reading" | "vocabulary" | "writing";

const SKILL_TASK_TITLES: Record<TopikStudyPlanSkill, Record<FeedbackLanguage, string>> = {
  writing: { en: "Writing Practice", ru: "Практика письма", kz: "Жазу жаттығуы" },
  reading: { en: "Reading Practice", ru: "Практика чтения", kz: "Оқу жаттығуы" },
  listening: { en: "Listening Practice", ru: "Практика аудирования", kz: "Тыңдалым жаттығуы" },
  vocabulary: { en: "Vocabulary Review", ru: "Повторение словаря", kz: "Сөздікті қайталау" },
};

const DEFAULT_HORIZON_DAYS = 14;
const MAX_HORIZON_DAYS = 60;

function toIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function average(nums: number[]): number | null {
  return nums.length === 0 ? null : nums.reduce((a, b) => a + b, 0) / nums.length;
}

/** Lower readiness score -> higher weight (needs more practice). No data at
 * all -> a neutral weight, since there's nothing real to weight it by. */
function computeWeight(readiness: number | null): number {
  if (readiness === null) return 2;
  return Math.max(1, Math.round((100 - readiness) / 20));
}

function buildSkillPool(weights: Partial<Record<TopikStudyPlanSkill, number>>): TopikStudyPlanSkill[] {
  const pool: TopikStudyPlanSkill[] = [];
  (Object.keys(weights) as TopikStudyPlanSkill[]).forEach((skill) => {
    const weight = weights[skill] ?? 0;
    for (let i = 0; i < weight; i++) pool.push(skill);
  });
  return pool;
}

export function generateTopikStudyPlan(profile: User, language: FeedbackLanguage): StudyPlanDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let totalDays = DEFAULT_HORIZON_DAYS;
  if (profile.examDate) {
    const exam = new Date(profile.examDate);
    exam.setHours(0, 0, 0, 0);
    const diffDays = Math.round((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    totalDays = Math.max(1, Math.min(diffDays + 1, MAX_HORIZON_DAYS));
  }

  const history = profile.topikStats.history;
  const listeningAvg = average(history.filter((h) => h.activity === "listening").map((h) => h.score));
  const readingAvg = average(history.filter((h) => h.activity === "reading").map((h) => h.score));
  const writingAvg = average(history.filter((h) => h.activity === "writing").map((h) => h.score));

  const weights: Partial<Record<TopikStudyPlanSkill, number>> = {
    listening: computeWeight(listeningAvg),
    reading: computeWeight(readingAvg),
    vocabulary: 2,
  };
  // TOPIK I (Levels 1-2) has no Writing section at all — only TOPIK II
  // candidates get Writing tasks in their plan.
  if (profile.topikTrack === "II") {
    weights.writing = computeWeight(writingAvg);
  }

  const pool = buildSkillPool(weights);
  const days: StudyPlanDay[] = [];
  let cursor = 0;

  for (let i = 0; i < totalDays; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const tasksPerDay = 2 + (i % 2);
    const daySkills = new Set<TopikStudyPlanSkill>();
    let attempts = 0;
    while (daySkills.size < tasksPerDay && attempts < pool.length * 2) {
      daySkills.add(pool[cursor % pool.length]);
      cursor++;
      attempts++;
    }
    const tasks: StudyPlanTask[] = [...daySkills].map((skill) => ({
      skill: skill as StudyPlanSkill,
      title: SKILL_TASK_TITLES[skill][language],
    }));
    days.push({ date: toIso(date), tasks });
  }

  return days;
}
