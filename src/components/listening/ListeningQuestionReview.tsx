"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, Info, MapPin, KeyRound, BookText, AlertTriangle, Sparkles, Compass } from "lucide-react";
import { Card, CardHeader, CardTitle, Badge, CardContent } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { ListeningQuestion } from "@/types/listening";

export function ListeningQuestionReview({
  question,
  questionNumber,
  selectedOptionId,
  isCorrect,
}: {
  question: ListeningQuestion;
  questionNumber: number;
  selectedOptionId: string | null;
  isCorrect: boolean;
}) {
  const { t } = useLanguage();
  const r = t.listening.review;
  const [expanded, setExpanded] = useState(false);

  const selectedOption = question.options.find((o) => o.id === selectedOptionId);
  const correctOption = question.options.find((o) => o.id === question.correctOptionId);
  const wrongOptions = question.options.filter((o) => o.id !== question.correctOptionId);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="neutral">{t.listening.session.questionBadge(questionNumber)}</Badge>
          {isCorrect ? (
            <Badge variant="success">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </Badge>
          ) : (
            <Badge variant="danger">
              <XCircle className="h-3.5 w-3.5" />
            </Badge>
          )}
        </div>
        <CardTitle className="mt-1 text-base">{question.prompt}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5 text-sm">
          <span className="text-muted">
            {r.correctAnswer}: <span className="font-medium text-success-700">{correctOption?.text}</span>
          </span>
          <span className="text-muted">
            {r.yourAnswer}:{" "}
            <span className={cn("font-medium", isCorrect ? "text-success-700" : "text-danger-700")}>
              {selectedOption?.text ?? "—"}
            </span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center justify-between gap-2 rounded-xl border border-border bg-background px-4 py-3 text-left text-sm font-medium text-primary-700 transition-colors hover:bg-primary-50"
        >
          <span className="flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0" />
            {r.whyCorrectQuestion}
          </span>
          {expanded ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
        </button>

        {expanded && (
          <div className="flex flex-col gap-4 rounded-xl bg-background p-4">
            <ExplanationSection icon={MapPin} label={r.whereInRecording} text={question.explanation.whereInRecording} />
            <ExplanationSection icon={KeyRound} label={r.keywords} text={question.explanation.keywords} />
            <ExplanationSection icon={CheckCircle2} label={r.whyCorrect} text={question.explanation.whyCorrect} tone="success" />

            <div className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <AlertTriangle className="h-3.5 w-3.5 text-danger-600" />
                {r.whyIncorrect}
              </span>
              <ul className="flex flex-col gap-1.5">
                {wrongOptions.map((option) => {
                  const explanation = question.explanation.whyIncorrect.find((w) => w.optionId === option.id);
                  return (
                    <li key={option.id} className="rounded-lg border border-border bg-surface p-2.5 text-xs">
                      <span className="font-medium text-foreground">{option.text}</span>
                      {explanation && <p className="mt-0.5 text-muted">{explanation.reason}</p>}
                    </li>
                  );
                })}
              </ul>
            </div>

            {question.explanation.vocabulary.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <BookText className="h-3.5 w-3.5 text-primary-600" />
                  {r.vocabulary}
                </span>
                <ul className="flex flex-wrap gap-2">
                  {question.explanation.vocabulary.map((v) => (
                    <li
                      key={v.term}
                      className="rounded-lg border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs text-primary-700"
                    >
                      <span className="font-medium">{v.term}</span> — {v.translation}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <ExplanationSection icon={Sparkles} label={r.grammarPattern} text={question.explanation.grammarPattern} />
            <ExplanationSection icon={Compass} label={r.strategy} text={question.explanation.strategy} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ExplanationSection({
  icon: Icon,
  label,
  text,
  tone = "default",
}: {
  icon: typeof Info;
  label: string;
  text: string;
  tone?: "default" | "success";
}) {
  return (
    <div className="flex flex-col gap-1">
      <span
        className={cn(
          "flex items-center gap-1.5 text-xs font-semibold",
          tone === "success" ? "text-success-700" : "text-foreground"
        )}
      >
        <Icon className={cn("h-3.5 w-3.5", tone === "success" ? "text-success-600" : "text-primary-600")} />
        {label}
      </span>
      <p className="text-sm text-muted">{text}</p>
    </div>
  );
}
