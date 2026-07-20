"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Quote, Sparkles, Loader2, AlertCircle } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
} from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { getWordOfTheDay } from "@/lib/mock/word-of-the-day";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useUserProfile } from "@/lib/profile/UserProfileContext";
import type { VocabularySentenceFeedback } from "@/types/vocabulary";

const MASTERY_VARIANT = {
  new: "primary",
  learning: "warning",
  mastered: "success",
} as const;

export default function VocabularyPage() {
  const { t, language } = useLanguage();
  const { profile, recordVocabularyPractice } = useUserProfile();
  const [sentence, setSentence] = useState("");
  const [feedback, setFeedback] = useState<VocabularySentenceFeedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!profile) return null;
  const wordOfTheDay = getWordOfTheDay(profile.targetLevel);

  async function handleGetFeedback() {
    if (!sentence.trim() || isSubmitting || !profile) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/vocabulary/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: wordOfTheDay.word,
          definition: wordOfTheDay.definition[language],
          sentence,
          level: profile.targetLevel,
          language,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.vocabulary.aiFeedbackErrorGeneric);
      const nextFeedback = data.feedback as VocabularySentenceFeedback;
      setFeedback(nextFeedback);
      recordVocabularyPractice(wordOfTheDay.word, wordOfTheDay.definition, nextFeedback.usedCorrectly);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.vocabulary.aiFeedbackErrorGeneric);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t.vocabulary.pageTitle}
        description={t.vocabulary.pageDescription}
      />

      {/* Word card */}
      <Card>
        <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-primary-50 text-4xl">
            {wordOfTheDay.icon}
          </span>
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                {wordOfTheDay.word}
              </h2>
              <Badge variant="neutral">{wordOfTheDay.partOfSpeech}</Badge>
              <span className="text-sm text-muted">
                {wordOfTheDay.pronunciation}
              </span>
            </div>
            <p className="text-sm leading-6 text-muted">
              {wordOfTheDay.definition[language]}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contexts */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-[18px] w-[18px] text-success-600" />
              <CardTitle>{t.vocabulary.useItWhen}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3">
              {wordOfTheDay.goodContexts[language].map((context) => (
                <li key={context} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-600" />
                  {context}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-[18px] w-[18px] text-danger-600" />
              <CardTitle>{t.vocabulary.avoidItWhen}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3">
              {wordOfTheDay.badContexts[language].map((context) => (
                <li key={context} className="flex items-start gap-2 text-sm text-foreground">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger-600" />
                  {context}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Example sentences */}
      <Card>
        <CardHeader>
          <CardTitle>{t.vocabulary.exampleSentences}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {wordOfTheDay.exampleSentences.map((sentence) => (
            <div
              key={sentence}
              className="flex items-start gap-3 rounded-2xl bg-background p-4"
            >
              <Quote className="mt-0.5 h-4 w-4 shrink-0 text-primary-400" />
              <p className="text-sm leading-6 text-foreground">{sentence}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Student's own sentence + AI feedback placeholder */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t.vocabulary.yourTurn}</CardTitle>
            <CardDescription>
              {t.vocabulary.yourTurnDescription(wordOfTheDay.word)}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <textarea
              rows={4}
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              placeholder={t.vocabulary.sentencePlaceholder(wordOfTheDay.word)}
              className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
            />
            {error && (
              <div className="flex items-center gap-2 text-sm text-danger-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            <Button
              className="self-start"
              onClick={handleGetFeedback}
              disabled={!sentence.trim() || isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t.vocabulary.getAiFeedback}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-[18px] w-[18px] text-primary-500" />
              <CardTitle>{t.vocabulary.aiFeedback}</CardTitle>
              {feedback && (
                <Badge variant={feedback.usedCorrectly ? "success" : "danger"}>
                  {feedback.usedCorrectly ? t.vocabulary.usedCorrectlyBadge : t.vocabulary.notUsedBadge}
                </Badge>
              )}
            </div>
            <CardDescription>{t.vocabulary.aiFeedbackDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            {feedback ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-foreground">
                    {t.vocabulary.correctedSentenceLabel}
                  </span>
                  <p className="rounded-xl bg-background p-3 text-sm italic text-foreground">
                    &ldquo;{feedback.correctedSentence}&rdquo;
                  </p>
                </div>
                {feedback.whyWrong && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-foreground">{t.vocabulary.whyWrongLabel}</span>
                    <p className="text-sm text-muted">{feedback.whyWrong}</p>
                  </div>
                )}
                {feedback.naturalSuggestion && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-foreground">
                      {t.vocabulary.naturalSuggestionLabel}
                    </span>
                    <p className="text-sm text-muted">{feedback.naturalSuggestion}</p>
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-foreground">{t.vocabulary.explanationLabel}</span>
                  <p className="text-sm text-muted">{feedback.explanation}</p>
                </div>
                <p className="text-sm font-medium text-primary-600">{feedback.encouragement}</p>
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-border bg-background text-center text-sm text-muted">
                {t.vocabulary.aiFeedbackEmptyState}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vocabulary history */}
      <Card>
        <CardHeader>
          <CardTitle>{t.vocabulary.yourVocabulary}</CardTitle>
          <CardDescription>
            {t.vocabulary.yourVocabularyDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {profile.vocabularyProgress.length === 0 ? (
            <div className="flex h-24 items-center justify-center text-center text-sm text-muted">
              {t.vocabulary.yourVocabularyEmptyState}
            </div>
          ) : (
            profile.vocabularyProgress.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{entry.word}</span>
                <span className="text-sm text-muted">{entry.definition[language]}</span>
              </div>
              <Badge variant={MASTERY_VARIANT[entry.mastery]}>
                {t.vocabulary.masteryLabels[entry.mastery]}
              </Badge>
            </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
