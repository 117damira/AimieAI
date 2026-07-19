import type { OnboardingLevel } from "@/types/user";
import type { DelfLevel } from "@/types/writing-evaluation";

/**
 * Only DELF A1-B2 have real practice content. This is the single place
 * that narrows a user's 5-value onboarding level down to the 4-value
 * DelfLevel that actually drives Writing/Speaking exercises — every
 * practice-facing read should go through this, never an inline cast.
 */
export function resolvePracticeLevel(level: OnboardingLevel): DelfLevel {
  if (level === "Beginner") return "A1";
  return level;
}
