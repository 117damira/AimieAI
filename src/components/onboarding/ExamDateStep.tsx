"use client";

import { Input, Button } from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function ExamDateStep({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (date: string | null) => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-4">
      <Input
        type="date"
        label={t.onboarding.examDateLabel}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value || null)}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="self-start -mt-1"
        onClick={() => onChange(null)}
      >
        {t.onboarding.notSureYet}
      </Button>
    </div>
  );
}
