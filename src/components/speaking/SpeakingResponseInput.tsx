"use client";

import { Mic, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function SpeakingResponseInput({
  value,
  onChange,
  onSubmit,
  isSubmitting,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  const { t } = useLanguage();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.speaking.yourAnswer}</CardTitle>
        <CardDescription>
          {t.speaking.typeResponseBelow}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-center">
          <button
            type="button"
            disabled
            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-white opacity-60"
            aria-label={t.speaking.voiceComingSoon}
          >
            <Mic className="h-5 w-5" />
          </button>
        </div>
        <textarea
          rows={5}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={t.speaking.responsePlaceholder}
          className="w-full resize-none rounded-2xl border border-border bg-surface px-4 py-3 text-sm leading-6 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
        />
        <div className="flex justify-end">
          <Button onClick={onSubmit} disabled={!value.trim() || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.speaking.analyzing}
              </>
            ) : (
              t.speaking.submitAnswer
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
