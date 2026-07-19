import type { OnboardingLevel } from "@/types/user";
import type { FeedbackLanguage } from "@/types/writing-evaluation";

export const ONBOARDING_LEVEL_ORDER: OnboardingLevel[] = [
  "Beginner",
  "A1",
  "A2",
  "B1",
  "B2",
];

export const ONBOARDING_LEVEL_LABELS: Record<
  OnboardingLevel,
  { label: string; description: Record<FeedbackLanguage, string> }
> = {
  Beginner: {
    label: "Beginner",
    description: { en: "Just starting out", ru: "Только начинаю", kz: "Жаңа бастаушы" },
  },
  A1: {
    label: "A1",
    description: { en: "Discovery", ru: "Открытие", kz: "Танысу" },
  },
  A2: {
    label: "A2",
    description: { en: "Survival", ru: "Выживание", kz: "Күнделікті қажеттілік" },
  },
  B1: {
    label: "B1",
    description: { en: "Threshold", ru: "Пороговый уровень", kz: "Шекті деңгей" },
  },
  B2: {
    label: "B2",
    description: { en: "Independent", ru: "Независимый", kz: "Тәуелсіз" },
  },
};

export const DAILY_GOAL_PRESETS: number[] = [10, 15, 20, 30, 45, 60];
