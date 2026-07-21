"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Square, CheckSquare, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { ReadingQuestion } from "@/types/reading";

const DIFFICULTY_EMOJI = { easy: "🟢", medium: "🟡", hard: "🔴" } as const;

/**
 * Selecting an option only ever marks it as selected — correctness is
 * NEVER revealed here (mirrors ListeningQuestionCard's real-exam behavior).
 * The difficulty badge (Question Difficulty feature) is always visible.
 * The hint (Smart Hints feature) is collapsed by default and, when
 * expanded, shows only strategy-only guidance — never the answer.
 */
export function ReadingQuestionCard({
  question,
  questionNumber,
  selectedOptionIds,
  onToggle,
}: {
  question: ReadingQuestion;
  questionNumber: number;
  selectedOptionIds: string[];
  onToggle: (optionId: string) => void;
}) {
  const { t } = useLanguage();
  const s = t.reading.session;
  const isMultiSelect = question.type === "multi-select";
  const [hintOpen, setHintOpen] = useState(false);

  const difficultyLabel = {
    easy: s.difficultyEasy,
    medium: s.difficultyMedium,
    hard: s.difficultyHard,
  }[question.difficulty];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="neutral">{s.questionBadge(questionNumber)}</Badge>
          <Badge variant="neutral">
            {DIFFICULTY_EMOJI[question.difficulty]} {difficultyLabel}
          </Badge>
          {isMultiSelect && <Badge variant="primary">{s.selectAllThatApply}</Badge>}
        </div>
        <CardTitle className="mt-1 text-base">{question.prompt}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5">
        {question.options.map((option) => {
          const isSelected = selectedOptionIds.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onToggle(option.id)}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all duration-200 ease-out",
                isSelected
                  ? "border-primary-400 bg-primary-50 text-foreground shadow-sm"
                  : "border-border bg-background text-foreground hover:border-primary-300 hover:bg-primary-50/50 hover:-translate-y-0.5",
                "cursor-pointer"
              )}
            >
              {isMultiSelect ? (
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

        <button
          type="button"
          onClick={() => setHintOpen((open) => !open)}
          className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-warning-300 bg-warning-50/40 px-4 py-2.5 text-left text-sm font-medium text-warning-700 transition-colors duration-200 hover:bg-warning-50"
        >
          <span className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 shrink-0" />
            {hintOpen ? s.hideHint : s.getHint}
          </span>
          {hintOpen ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
        </button>
        {hintOpen && (
          <div className="rounded-xl bg-warning-50/60 px-4 py-3 text-sm text-warning-800">
            <span className="font-semibold">{s.hintLabel}: </span>
            {question.hint}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
