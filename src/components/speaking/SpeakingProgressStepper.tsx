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
    <ProgressBar
      value={currentIndex + 1}
      max={total}
      label={t.speaking.questionProgress(currentIndex + 1, total, partLabel)}
      colorClassName="bg-primary-500"
    />
  );
}
