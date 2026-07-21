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
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => {
          const isComplete = s < step;
          const isActive = s === step;
          const dotClass = isComplete
            ? "bg-primary-600 text-white"
            : isActive
              ? "bg-primary-500 text-white ring-4 ring-primary-100"
              : "border border-border bg-background text-muted";
          return (
            <span
              key={s}
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold transition-all duration-300 ease-out ${dotClass}`}
            >
              {isComplete ? "✓" : s}
            </span>
          );
        })}
      </div>
      <ProgressBar
        value={step}
        max={totalSteps}
        label={t.onboarding.stepLabel(step, totalSteps)}
        colorClassName="bg-primary-500"
      />
    </div>
  );
}
