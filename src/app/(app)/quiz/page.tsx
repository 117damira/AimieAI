"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ListChecks, CheckCircle2, XCircle, Circle } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  ProgressBar,
  buttonVariants,
} from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { generateVocabularyQuiz } from "@/lib/quiz/generateQuiz";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { cn } from "@/lib/utils/cn";

export default function WeeklyQuizPage() {
  const { t, language } = useLanguage();
  const { profile, recordQuizCompletion } = useUserProfile();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  // Always derived fresh from the live profile — never a preloaded/static
  // word list, so it can never show vocabulary the student hasn't actually
  // practiced.
  const questions = useMemo(
    () => generateVocabularyQuiz(profile?.vocabularyProgress ?? [], language),
    [profile?.vocabularyProgress, language]
  );

  if (!profile) return null;

  const answeredCount = Object.keys(answers).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;
  const correctCount = questions.filter((q) => answers[q.id] === q.correctAnswer).length;

  function handleSelect(questionId: string, option: string) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  }

  function handleSubmit() {
    if (!allAnswered) return;
    setSubmitted(true);
    recordQuizCompletion();
  }

  function handleRetry() {
    setAnswers({});
    setSubmitted(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t.quiz.pageTitle} description={t.quiz.pageDescription} />

      {questions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <ListChecks className="h-8 w-8 text-muted" />
            <CardTitle className="text-base">{t.quiz.emptyStateTitle}</CardTitle>
            <CardDescription>{t.quiz.emptyStateDescription}</CardDescription>
            <Link href="/vocabulary" className={buttonVariants({ variant: "primary", size: "sm" })}>
              {t.quiz.emptyStateCta}
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-warning-50 text-warning-600">
                  <ListChecks className="h-5 w-5" />
                </span>
                <div className="flex flex-col">
                  <span className="font-display font-semibold text-foreground">
                    {t.quiz.wordsToReview(questions.length)}
                  </span>
                  <span className="text-sm text-muted">{t.quiz.basedOnVocabulary}</span>
                </div>
              </div>
              <ProgressBar
                value={submitted ? correctCount : answeredCount}
                max={questions.length}
                label={t.quiz.progressLabel}
                className="w-full sm:w-56"
                showPercentage
              />
            </CardContent>
          </Card>

          <div className="flex flex-col gap-5">
            {questions.map((question, index) => {
              const selected = answers[question.id];
              return (
                <Card key={question.id}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral">{t.quiz.questionBadge(index + 1)}</Badge>
                      <Badge variant="primary">{question.word}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    {question.options.map((option) => {
                      const isSelected = selected === option;
                      const isCorrectOption = option === question.correctAnswer;
                      const showResult = submitted;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleSelect(question.id, option)}
                          disabled={submitted}
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
                            submitted ? "cursor-not-allowed" : "cursor-pointer"
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
                          ) : (
                            <Circle
                              className={cn(
                                "h-4 w-4 shrink-0",
                                isSelected ? "text-primary-500" : "text-muted"
                              )}
                            />
                          )}
                          {option}
                        </button>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
              {submitted ? (
                <>
                  <span className="font-display text-lg font-semibold text-foreground">
                    {t.quiz.scoreSummary(correctCount, questions.length)}
                  </span>
                  <Button variant="secondary" onClick={handleRetry}>
                    {t.quiz.tryAgain}
                  </Button>
                </>
              ) : (
                <Button onClick={handleSubmit} disabled={!allAnswered}>
                  {t.quiz.submitQuiz}
                </Button>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
