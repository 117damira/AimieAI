"use client";

import { ListChecks, Circle } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  ProgressBar,
} from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { QUIZ_QUESTIONS } from "@/lib/mock/practice";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function WeeklyQuizPage() {
  const { t, language } = useLanguage();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t.quiz.pageTitle}
        description={t.quiz.pageDescription}
      />

      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-warning-50 text-warning-600">
              <ListChecks className="h-5 w-5" />
            </span>
            <div className="flex flex-col">
              <span className="font-display font-semibold text-foreground">
                {t.quiz.wordsToReview(QUIZ_QUESTIONS.length)}
              </span>
              <span className="text-sm text-muted">
                {t.quiz.basedOnVocabulary}
              </span>
            </div>
          </div>
          <ProgressBar
            value={0}
            max={QUIZ_QUESTIONS.length}
            label={t.quiz.progressLabel}
            className="w-full sm:w-56"
            showPercentage
          />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-5">
        {QUIZ_QUESTIONS.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge variant="neutral">{t.quiz.questionBadge(index + 1)}</Badge>
                <Badge variant="primary">{question.word}</Badge>
              </div>
              <CardTitle className="mt-1 text-base">
                {question.question[language]}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {question.options[language].map((option) => (
                <button
                  key={option}
                  type="button"
                  disabled
                  className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-left text-sm text-foreground opacity-90 disabled:cursor-not-allowed"
                >
                  <Circle className="h-4 w-4 shrink-0 text-muted" />
                  {option}
                </button>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          <CardDescription>
            {t.quiz.comingSoonMessage}
          </CardDescription>
          <Button disabled>{t.quiz.submitQuiz}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
