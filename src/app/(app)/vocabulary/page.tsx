"use client";

import { CheckCircle2, XCircle, Quote, Sparkles } from "lucide-react";
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
import { getWordOfTheDay, VOCABULARY_HISTORY } from "@/lib/mock/word-of-the-day";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useUserProfile } from "@/lib/profile/UserProfileContext";

const MASTERY_VARIANT = {
  new: "primary",
  learning: "warning",
  mastered: "success",
} as const;

export default function VocabularyPage() {
  const { t, language } = useLanguage();
  const { profile } = useUserProfile();

  if (!profile) return null;
  const wordOfTheDay = getWordOfTheDay(profile.targetLevel);

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
              placeholder={t.vocabulary.sentencePlaceholder(wordOfTheDay.word)}
              className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
            />
            <Button className="self-start" disabled>
              {t.vocabulary.getAiFeedback}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-[18px] w-[18px] text-primary-500" />
              <CardTitle>{t.vocabulary.aiFeedback}</CardTitle>
              <Badge variant="neutral">{t.common.comingSoon}</Badge>
            </div>
            <CardDescription>
              {t.vocabulary.aiFeedbackDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-border bg-background text-center text-sm text-muted">
              {t.vocabulary.aiFeedbackEmptyState}
            </div>
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
          {VOCABULARY_HISTORY.map((entry) => (
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
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
