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
  const f = t.speaking.feedback;
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

        <FeedbackRow label={f.taskCompletionLabel} value={feedback.taskCompletionNote} />
        <FeedbackRow label={f.coherenceLabel} value={feedback.coherenceNote} />

        {feedback.grammarErrors.length > 0 && (
          <div className="flex flex-col gap-3">
            {feedback.grammarErrors.map((err, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 rounded-xl border border-border bg-background p-3"
              >
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-foreground line-through decoration-danger-500">
                    {err.original}
                  </span>
                  <span className="font-medium text-success-600">{err.correction}</span>
                </div>
                <MistakeDetail label={f.whyWrong} value={err.whyWrong} />
                <MistakeDetail label={f.howToFix} value={err.howToFix} />
                <MistakeDetail label={f.betterExample} value={err.betterExample} emphasize />
                <MistakeDetail label={f.howToAvoid} value={err.howToAvoid} />
              </div>
            ))}
          </div>
        )}

        <FeedbackRow label={f.pronunciationLabel} value={feedback.pronunciationNote} />
        <FeedbackRow label={f.fluencyLabel} value={feedback.fluencyNote} />
        <FeedbackRow label={f.vocabularyLabel} value={feedback.vocabularyNote} />

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

function FeedbackRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm text-muted">
      <span className="font-medium text-foreground">{label}: </span>
      {value}
    </p>
  );
}

function MistakeDetail({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <p className="text-xs text-muted">
      <span className="font-medium text-foreground">{label}: </span>
      <span className={cn(emphasize && "text-success-600")}>{value}</span>
    </p>
  );
}
