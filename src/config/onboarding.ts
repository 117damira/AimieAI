import type { OnboardingLevel, StudyDay } from "@/types/user";
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

/** Display order (Monday-first, matching the DELF study-week convention),
 * independent of the Sunday-first index used by `weekdaysShort`/`Date.getDay()`. */
export const STUDY_DAY_ORDER: StudyDay[] = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
];

/** Maps each StudyDay onto `Dictionary.weekdaysShort`'s Sunday-first index. */
export const STUDY_DAY_WEEKDAY_INDEX: Record<StudyDay, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

/** Every account starts studying every day until they narrow it down. */
export const DEFAULT_STUDY_DAYS: StudyDay[] = [...STUDY_DAY_ORDER];
