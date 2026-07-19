"use client";

import { ProgressBar } from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function OnboardingStepper({
  step,
  totalSteps,
}: {
  step: number;
  totalSteps: number;
}) {
  const { t } = useLanguage();
  return (
    <ProgressBar
      value={step}
      max={totalSteps}
      label={t.onboarding.stepLabel(step, totalSteps)}
      colorClassName="bg-primary-500"
    />
  );
}
