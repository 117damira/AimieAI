import type { OnboardingLevel } from "@/types/user";

export const ONBOARDING_LEVEL_ORDER: OnboardingLevel[] = [
  "Beginner",
  "A1",
  "A2",
  "B1",
  "B2",
];

export const ONBOARDING_LEVEL_LABELS: Record<
  OnboardingLevel,
  { label: string; description: string }
> = {
  Beginner: { label: "Beginner", description: "Just starting out" },
  A1: { label: "A1", description: "Discovery" },
  A2: { label: "A2", description: "Survival" },
  B1: { label: "B1", description: "Threshold" },
  B2: { label: "B2", description: "Independent" },
};

export const DAILY_GOAL_PRESETS: number[] = [10, 15, 20, 30, 45, 60];
