"use client";

import { CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { TurnFeedback } from "@/types/speaking-evaluation";

export function SpeakingTurnFeedback({
  feedback,
  onContinue,
  continueLabel,
  autoAdvancing,
}: {
  feedback: TurnFeedback;
  onContinue: () => void;
  continueLabel: string;
  autoAdvancing: boolean;
}) {
  const { t } = useLanguage();
  return (
    <Card className="border-dashed">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-[18px] w-[18px] text-primary-500" />
          <CardTitle>{t.speaking.examinerFeedback}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm">
          {feedback.relevance ? (
            <CheckCircle2 className="h-4 w-4 text-success-600" />
          ) : (
            <XCircle className="h-4 w-4 text-danger-600" />
          )}
          <span className={cn(feedback.relevance ? "text-success-600" : "text-danger-600")}>
            {feedback.relevance ? t.speaking.answeredQuestion : t.speaking.needsMoreDevelopment}
          </span>
        </div>

        {feedback.grammarErrors.length > 0 && (
          <div className="flex flex-col gap-2">
            {feedback.grammarErrors.map((err, i) => (
              <div
                key={i}
                className="flex flex-col gap-1 rounded-xl border border-border bg-background p-3"
              >
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-foreground line-through decoration-danger-500">
                    {err.original}
                  </span>
                  <span className="font-medium text-success-600">{err.correction}</span>
                </div>
                <p className="text-xs text-muted">{err.explanation}</p>
              </div>
            ))}
          </div>
        )}

        <p className="text-sm text-muted">{feedback.fluencyNote}</p>
        <p className="text-sm text-muted">{feedback.vocabularyNote}</p>
        <p className="text-sm font-medium text-foreground">{feedback.encouragement}</p>

        {!autoAdvancing && (
          <div className="flex justify-end">
            <Button onClick={onContinue}>{continueLabel}</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
