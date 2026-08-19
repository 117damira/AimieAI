"use client";

import { useCallback, useState } from "react";
import { Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, Button } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { resolvePracticeLevel } from "@/lib/utils/level";
import { DELF_READING_LEVELS } from "@/config/delf-reading";
import { pickDailyChallengePassageIds } from "@/lib/reading/rotation";
import { scoreReadingSet } from "@/lib/reading/scoring";
import { computeReadingTiming } from "@/lib/reading/timing";
import { synthesizeReadingFeedback } from "@/lib/reading/feedback";
import { computeReadingPersonalBest, computeReadingProgressComparison } from "@/lib/reading/stats";
import { ReadingLevelDashboard } from "@/components/reading/ReadingLevelDashboard";
import { ReadingModeSelect } from "@/components/reading/ReadingModeSelect";
import { ReadingPersonalBestBar } from "@/components/reading/ReadingPersonalBestBar";
import { ReadingPassageViewer } from "@/components/reading/ReadingPassageViewer";
import { ReadingQuestionCard } from "@/components/reading/ReadingQuestionCard";
import { ReadingResultsSummary } from "@/components/reading/ReadingResultsSummary";
import { ReadingSkillBreakdown, ReadingStrategyCard } from "@/components/reading/ReadingSkillBreakdown";
import { ReadingVocabularyCard } from "@/components/reading/ReadingVocabularyCard";
import { ReadingProgressComparison } from "@/components/reading/ReadingProgressComparison";
import { ReadingQuestionReview } from "@/components/reading/ReadingQuestionReview";
import { ReadingTipsCard } from "@/components/reading/ReadingTipsCard";
import type {
  ReadingFeedback,
  ReadingMode,
  ReadingResult,
  ReadingSessionRecord,
  ReadingSet,
  ReadingVocabularyItem,
} from "@/types/reading";

type Phase = "home" | "loading" | "practice" | "results";

export default function ReadingPracticePage() {
  const { profile, recordActivity, recordReadingCompletion, addVocabularyWord } = useUserProfile();
  const { t, language } = useLanguage();

  const [phase, setPhase] = useState<Phase>("home");
  const [set, setSet] = useState<ReadingSet | null>(null);
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<ReadingResult | null>(null);
  const [feedback, setFeedback] = useState<ReadingFeedback | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [sessionStartMs, setSessionStartMs] = useState<number | null>(null);
  const [firstAnswerMs, setFirstAnswerMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleToggleOption = useCallback((questionId: string, optionId: string, isMultiSelect: boolean) => {
    setFirstAnswerMs((prev) => prev ?? Date.now());
    setAnswers((prev) => {
      const current = prev[questionId] ?? [];
      if (isMultiSelect) {
        const next = current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];
        return { ...prev, [questionId]: next };
      }
      return { ...prev, [questionId]: current.includes(optionId) ? [] : [optionId] };
    });
  }, []);

  if (!profile) return null;
  const level = resolvePracticeLevel(profile.targetLevel);
  const config = DELF_READING_LEVELS[level];
  const todaysDailyChallengePassageIds = pickDailyChallengePassageIds(level);
  const readingHistoryForLevel = profile.readingHistory[level] ?? [];
  const dailyChallengeCompleted = todaysDailyChallengePassageIds.every((id) => readingHistoryForLevel.includes(id));
  const savedWords = new Set((profile.vocabularyProgress ?? []).map((e) => e.word.toLowerCase()));
  const personalBest = computeReadingPersonalBest(profile.stats.readingSessionHistory ?? []);

  async function startSession(mode: ReadingMode) {
    setError(null);
    setPhase("loading");
    try {
      const res = await fetch("/api/reading/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level,
          mode,
          language,
          history: profile?.readingHistory[level] ?? [],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.common.somethingWentWrong);
      setSet(data.set as ReadingSet);
      setCurrentPassageIndex(0);
      setAnswers({});
      setResult(null);
      setFeedback(null);
      setShowReview(false);
      setSessionStartMs(Date.now());
      setFirstAnswerMs(null);
      setPhase("practice");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.somethingWentWrong);
      setPhase("home");
    }
  }

  function handleSubmit() {
    if (!set || !profile || sessionStartMs === null) return;
    const submitMs = Date.now();
    const timing = computeReadingTiming(sessionStartMs, firstAnswerMs, submitMs, config.durationMinutes);
    const answerList = set.questions.map((q) => ({ questionId: q.id, selectedOptionIds: answers[q.id] ?? [] }));
    const nextResult = scoreReadingSet(set, answerList, timing);

    const totalWords = set.passages.reduce((sum, p) => sum + p.estimatedWordCount, 0);
    const minutes = timing.totalTimeSeconds / 60;
    const wordsPerMinute = minutes > 0 ? Math.round(totalWords / minutes) : totalWords;

    const nextFeedback = synthesizeReadingFeedback(set, nextResult, wordsPerMinute, language);

    const alreadyKnownWords = new Set((profile.vocabularyProgress ?? []).map((e) => e.word.toLowerCase()));
    const newVocabCount = set.vocabulary.filter((v) => !alreadyKnownWords.has(v.term.toLowerCase())).length;

    setResult(nextResult);
    setFeedback(nextFeedback);

    const sessionRecord: ReadingSessionRecord = {
      date: new Date().toISOString().slice(0, 10),
      level,
      mode: set.mode,
      score: nextResult.score,
      scoreOutOf: nextResult.scoreOutOf,
      percentage: nextResult.percentage,
      accuracy: nextResult.accuracy,
      timeSpentSeconds: timing.totalTimeSeconds,
      wordsPerMinute,
      newVocabularyCount: newVocabCount,
    };

    recordReadingCompletion(
      level,
      set.passages.map((p) => p.id),
      sessionRecord
    );
    recordActivity("reading", Math.round((nextResult.score / nextResult.scoreOutOf) * 100));
    setPhase("results");
  }

  function handleBackToModes() {
    setSet(null);
    setResult(null);
    setFeedback(null);
    setShowReview(false);
    setError(null);
    setPhase("home");
  }

  function handleSaveVocabulary(item: ReadingVocabularyItem) {
    addVocabularyWord(item.term, { en: item.definition, ru: item.definition, kz: item.definition });
  }

  const allQuestionsAnswered = set ? set.questions.every((q) => (answers[q.id]?.length ?? 0) > 0) : false;
  const currentPassage = set?.passages[currentPassageIndex] ?? null;
  const currentPassageQuestions =
    set && currentPassage ? set.questions.filter((q) => q.passageId === currentPassage.id) : [];
  const isLastPassage = set ? currentPassageIndex === set.passages.length - 1 : false;
  const answeredInCurrentPassage = currentPassageQuestions.every((q) => (answers[q.id]?.length ?? 0) > 0);

  const pointsPossible = result && set ? result.scoreOutOf / set.questions.length : 0;

  const progressComparison =
    result && phase === "results"
      ? computeReadingProgressComparison(profile.stats.readingSessionHistory ?? [])
      : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t.reading.pageTitle}
        description={t.reading.pageDescription}
        onBack={phase !== "home" ? handleBackToModes : undefined}
        backLabel={phase !== "home" ? t.reading.session.backToModes : undefined}
      />

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-danger-500/20 bg-danger-50 px-4 py-3 text-sm text-danger-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {phase === "home" && (
        <>
          <ReadingPersonalBestBar personalBest={personalBest} />
          <ReadingLevelDashboard config={config} />
          <ReadingModeSelect onSelectMode={startSession} dailyChallengeCompleted={dailyChallengeCompleted} />
          <ReadingTipsCard />
        </>
      )}

      {phase === "loading" && (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center gap-3 py-12 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t.reading.session.generating}
          </CardContent>
        </Card>
      )}

      {phase === "practice" && set && currentPassage && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-muted">
            <span>{t.reading.session.passageLabel(currentPassageIndex + 1, set.passages.length)}</span>
          </div>

          <ReadingPassageViewer passage={currentPassage} />

          {currentPassageQuestions.map((q) => (
            <ReadingQuestionCard
              key={q.id}
              question={q}
              questionNumber={set.questions.findIndex((sq) => sq.id === q.id) + 1}
              selectedOptionIds={answers[q.id] ?? []}
              onToggle={(optionId) => handleToggleOption(q.id, optionId, q.type === "multi-select")}
            />
          ))}

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentPassageIndex((i) => Math.max(0, i - 1))}
              disabled={currentPassageIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              {t.reading.session.previous}
            </Button>
            {isLastPassage ? (
              <Button onClick={handleSubmit} disabled={!allQuestionsAnswered}>
                {t.reading.session.submit}
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentPassageIndex((i) => i + 1)}
                disabled={!answeredInCurrentPassage}
              >
                {t.reading.session.next}
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {phase === "results" && result && feedback && set && (
        <div className="flex flex-col gap-6">
          <ReadingResultsSummary result={result} />
          <ReadingSkillBreakdown feedback={feedback} />
          <ReadingStrategyCard feedback={feedback} />
          <ReadingVocabularyCard vocabulary={set.vocabulary} savedWords={savedWords} onSave={handleSaveVocabulary} />
          {progressComparison && <ReadingProgressComparison comparison={progressComparison} />}

          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => setShowReview((s) => !s)}>
              {showReview ? t.reading.results.hideReview : t.reading.results.reviewAnswers}
            </Button>
            <Button onClick={handleBackToModes}>{t.reading.results.newSession}</Button>
          </div>

          {showReview && (
            <div className="flex flex-col gap-4">
              {set.questions.map((q, i) => {
                const qResult = result.questionResults.find((qr) => qr.questionId === q.id);
                if (!qResult) return null;
                const passageForQuestion = set.passages.find((p) => p.id === q.passageId);
                return (
                  <ReadingQuestionReview
                    key={q.id}
                    question={q}
                    questionNumber={i + 1}
                    selectedOptionIds={qResult.selectedOptionIds}
                    isCorrect={qResult.isCorrect}
                    pointsEarned={qResult.isCorrect ? Math.round(pointsPossible * 10) / 10 : 0}
                    pointsPossible={Math.round(pointsPossible * 10) / 10}
                    passage={passageForQuestion}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
