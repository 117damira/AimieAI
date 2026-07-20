import type { StudyPlanSkill } from "@/lib/study-plan/generatePlan";

/** Semi-transparent, Google-Calendar-style block colors per skill. */
export const STUDY_PLAN_SKILL_CLASSES: Record<StudyPlanSkill, string> = {
  writing: "bg-success-50 text-success-600 border border-success-500/30",
  reading: "bg-warning-50 text-warning-600 border border-warning-500/30",
  speaking: "bg-info-50 text-info-600 border border-info-500/30",
  listening: "bg-purple-50 text-purple-600 border border-purple-500/30",
  vocabulary: "bg-orange-50 text-orange-600 border border-orange-500/30",
};
