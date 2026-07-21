"use client";

import { ONBOARDING_LEVEL_ORDER, ONBOARDING_LEVEL_LABELS } from "@/config/onboarding";
import { cn } from "@/lib/utils/cn";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { OnboardingLevel } from "@/types/user";

export function LevelStep({
  value,
  onChange,
}: {
  value: OnboardingLevel | null;
  onChange: (level: OnboardingLevel) => void;
}) {
  const { language } = useLanguage();
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {ONBOARDING_LEVEL_ORDER.map((level) => {
        const selected = level === value;
        const meta = ONBOARDING_LEVEL_LABELS[level];
        return (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            aria-pressed={selected}
            className={cn(
              "flex flex-col items-start gap-1 rounded-2xl border px-4 py-3 text-left transition-all duration-300 transition-smooth",
              selected
                ? "border-primary-400 bg-primary-50 shadow-card-hover"
                : "border-border bg-background hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-card-hover"
            )}
          >
            <span className="font-display text-base font-semibold text-foreground">
              {meta.label}
            </span>
            <span className="text-xs text-muted">{meta.description[language]}</span>
          </button>
        );
      })}
    </div>
  );
}
