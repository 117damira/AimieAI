"use client";

import { ProgressBar } from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function SpeakingProgressStepper({
  currentIndex,
  total,
  partLabel,
}: {
  currentIndex: number;
  total: number;
  partLabel: string;
}) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-card">
      <ProgressBar
        value={currentIndex + 1}
        max={total}
        label={t.speaking.questionProgress(currentIndex + 1, total, partLabel)}
        colorClassName="bg-primary-500"
      />
      {total > 1 && (
        <div className="flex items-center gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                i < currentIndex ? "bg-success-500" : i === currentIndex ? "bg-primary-500" : "bg-primary-50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
