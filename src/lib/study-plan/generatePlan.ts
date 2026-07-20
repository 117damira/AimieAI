import type { User } from "@/types/user";
import type { FeedbackLanguage } from "@/types/writing-evaluation";

/**
 * Deterministic study-plan generator — a scheduling algorithm over the
 * student's real profile data (remaining days until their real exam date,
 * their real per-skill history), not a creative-content generator, so it
 * doesn't need Claude to be "personalized." Reading/listening have no real
 * score history anywhere in this app yet (only writing/speaking sessions
 * are tracked), so they're rotated in evenly rather than weighted by a
 * fabricated weakness signal.
 */

export type StudyPlanSkill = "writing" | "reading" | "speaking" | "listening" | "vocabulary";

export interface StudyPlanTask {
  skill: StudyPlanSkill;
  title: string;
}

export interface StudyPlanDay {
  date: string; // yyyy-mm-dd
  tasks: StudyPlanTask[];
}

const SKILL_TASK_TITLES: Record<StudyPlanSkill, Record<FeedbackLanguage, string>> = {
  writing: { en: "Writing Practice", ru: "Практика письма", kz: "Жазу жаттығуы" },
  reading: { en: "Reading Practice", ru: "Практика чтения", kz: "Оқу жаттығуы" },
  speaking: { en: "Speaking Practice", ru: "Практика говорения", kz: "Сөйлеу жаттығуы" },
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

function buildSkillPool(weights: Record<StudyPlanSkill, number>): StudyPlanSkill[] {
  const pool: StudyPlanSkill[] = [];
  (Object.keys(weights) as StudyPlanSkill[]).forEach((skill) => {
    for (let i = 0; i < weights[skill]; i++) pool.push(skill);
  });
  return pool;
}

export function generateStudyPlan(profile: User, language: FeedbackLanguage): StudyPlanDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let totalDays = DEFAULT_HORIZON_DAYS;
  if (profile.examDate) {
    const exam = new Date(profile.examDate);
    exam.setHours(0, 0, 0, 0);
    const diffDays = Math.round((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    totalDays = Math.max(1, Math.min(diffDays + 1, MAX_HORIZON_DAYS));
  }

  const writingAvg = average(profile.stats.history.filter((h) => h.activity === "writing").map((h) => h.score));
  const speakingAvg = average(profile.stats.history.filter((h) => h.activity === "speaking").map((h) => h.score));

  const weights: Record<StudyPlanSkill, number> = {
    writing: computeWeight(writingAvg),
    speaking: computeWeight(speakingAvg),
    reading: 2,
    listening: 2,
    vocabulary: 2,
  };

  const pool = buildSkillPool(weights);
  const days: StudyPlanDay[] = [];
  let cursor = 0;

  for (let i = 0; i < totalDays; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const tasksPerDay = 2 + (i % 2);
    const daySkills = new Set<StudyPlanSkill>();
    let attempts = 0;
    while (daySkills.size < tasksPerDay && attempts < pool.length * 2) {
      daySkills.add(pool[cursor % pool.length]);
      cursor++;
      attempts++;
    }
    days.push({
      date: toIso(date),
      tasks: [...daySkills].map((skill) => ({ skill, title: SKILL_TASK_TITLES[skill][language] })),
    });
  }

  return days;
}
