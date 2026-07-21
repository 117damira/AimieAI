"use client";

import { CheckCircle2, XCircle, Circle, Square, CheckSquare } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { ListeningQuestion } from "@/types/listening";

/**
 * Selecting an option only ever marks it as selected (a filled checkmark) —
 * correctness is NEVER revealed here. Real DELF exam behavior: nothing is
 * graded until the whole set is submitted (see the page's "results" phase,
 * which is the only place `showResult` is ever passed as true — this card
 * is used unselected/ungraded throughout the entire practice phase).
 */
export function ListeningQuestionCard({
  question,
  questionNumber,
  selectedOptionIds,
  onToggle,
  showResult = false,
}: {
  question: ListeningQuestion;
  questionNumber: number;
  selectedOptionIds: string[];
  onToggle: (optionId: string) => void;
  showResult?: boolean;
}) {
  const { t } = useLanguage();
  const isMultiSelect = question.type === "multi-select";

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="neutral">{t.listening.session.questionBadge(questionNumber)}</Badge>
          {isMultiSelect && <Badge variant="primary">{t.listening.session.selectAllThatApply}</Badge>}
        </div>
        <CardTitle className="mt-1 text-base">{question.prompt}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {question.options.map((option) => {
          const isSelected = selectedOptionIds.includes(option.id);
          const isCorrectOption = question.correctOptionIds.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onToggle(option.id)}
              disabled={showResult}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                showResult
                  ? isCorrectOption
                    ? "border-success-500/40 bg-success-50 text-success-700"
                    : isSelected
                      ? "border-danger-500/40 bg-danger-50 text-danger-700"
                      : "border-border bg-background text-foreground opacity-70"
                  : isSelected
                    ? "border-primary-400 bg-primary-50 text-foreground"
                    : "border-border bg-background text-foreground hover:border-primary-300 hover:bg-primary-50/50",
                showResult ? "cursor-not-allowed" : "cursor-pointer"
              )}
            >
              {showResult ? (
                isCorrectOption ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success-600" />
                ) : isSelected ? (
                  <XCircle className="h-4 w-4 shrink-0 text-danger-600" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-muted" />
                )
              ) : isMultiSelect ? (
                isSelected ? (
                  <CheckSquare className="h-4 w-4 shrink-0 text-primary-600" />
                ) : (
                  <Square className="h-4 w-4 shrink-0 text-muted" />
                )
              ) : isSelected ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-600" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-muted" />
              )}
              {option.text}
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
