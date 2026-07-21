"use client";

import { useState } from "react";
import { Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, Button } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { resolvePracticeLevel } from "@/lib/utils/level";
import { DELF_LISTENING_LEVELS } from "@/config/delf-listening";
import { pickDailyChallengeRecordingIds } from "@/lib/listening/rotation";
import { scoreListeningSet } from "@/lib/listening/scoring";
import { synthesizeListeningFeedback } from "@/lib/listening/feedback";
import { ListeningLevelDashboard } from "@/components/listening/ListeningLevelDashboard";
import { ListeningModeSelect } from "@/components/listening/ListeningModeSelect";
import { ListeningAudioPlayer } from "@/components/listening/ListeningAudioPlayer";
import { ListeningQuestionCard } from "@/components/listening/ListeningQuestionCard";
import { ListeningResultsSummary, ListeningFeedbackCard } from "@/components/listening/ListeningResultsSummary";
import { ListeningQuestionReview } from "@/components/listening/ListeningQuestionReview";
import { ListeningTipsCard } from "@/components/listening/ListeningTipsCard";
import type { ListeningFeedback, ListeningMode, ListeningResult, ListeningSet } from "@/types/listening";

type Phase = "home" | "loading" | "practice" | "results";

export default function ListeningPracticePage() {
  const { profile, recordActivity, recordListeningCompletion } = useUserProfile();
  const { t, language } = useLanguage();

  const [phase, setPhase] = useState<Phase>("home");
  const [set, setSet] = useState<ListeningSet | null>(null);
  const [currentRecordingIndex, setCurrentRecordingIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<ListeningResult | null>(null);
  const [feedback, setFeedback] = useState<ListeningFeedback | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [sessionStartMs, setSessionStartMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!profile) return null;
  const level = resolvePracticeLevel(profile.targetLevel);
  const config = DELF_LISTENING_LEVELS[level];
  const todaysDailyRecordingIds = pickDailyChallengeRecordingIds(level);
  const listeningHistoryForLevel = profile.listeningHistory[level] ?? [];
  const dailyChallengeCompleted = todaysDailyRecordingIds.every((id) => listeningHistoryForLevel.includes(id));

  async function startSession(mode: ListeningMode) {
    setError(null);
    setPhase("loading");
    try {
      const res = await fetch("/api/listening/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level,
          mode,
          language,
          history: profile?.listeningHistory[level] ?? [],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.common.somethingWentWrong);
      setSet(data.set as ListeningSet);
      setCurrentRecordingIndex(0);
      setAnswers({});
      setResult(null);
      setFeedback(null);
      setShowReview(false);
      setSessionStartMs(Date.now());
      setPhase("practice");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.somethingWentWrong);
      setPhase("home");
    }
  }

  function handleToggleOption(questionId: string, optionId: string, isMultiSelect: boolean) {
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
  }

  function handleSubmit() {
    if (!set || sessionStartMs === null) return;
    const timeSpentSeconds = Math.round((Date.now() - sessionStartMs) / 1000);
    const answerList = set.questions.map((q) => ({ questionId: q.id, selectedOptionIds: answers[q.id] ?? [] }));
    const nextResult = scoreListeningSet(set, answerList, timeSpentSeconds);
    const nextFeedback = synthesizeListeningFeedback(set, nextResult, language);
    setResult(nextResult);
    setFeedback(nextFeedback);
    recordListeningCompletion(
      level,
      set.recordings.map((r) => r.id)
    );
    recordActivity("listening", Math.round((nextResult.score / nextResult.scoreOutOf) * 100));
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

  const allQuestionsAnswered = set ? set.questions.every((q) => (answers[q.id]?.length ?? 0) > 0) : false;
  const currentRecording = set?.recordings[currentRecordingIndex] ?? null;
  const currentRecordingQuestions =
    set && currentRecording ? set.questions.filter((q) => q.recordingId === currentRecording.id) : [];
  const isLastRecording = set ? currentRecordingIndex === set.recordings.length - 1 : false;
  const answeredInCurrentRecording = currentRecordingQuestions.every((q) => (answers[q.id]?.length ?? 0) > 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t.listening.pageTitle}
        description={t.listening.pageDescription}
        onBack={phase !== "home" ? handleBackToModes : undefined}
        backLabel={phase !== "home" ? t.listening.session.backToModes : undefined}
      />

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {phase === "home" && (
        <>
          <ListeningLevelDashboard config={config} />
          <ListeningModeSelect onSelectMode={startSession} dailyChallengeCompleted={dailyChallengeCompleted} />
          <ListeningTipsCard />
        </>
      )}

      {phase === "loading" && (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center gap-3 py-12 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t.listening.session.generating}
          </CardContent>
        </Card>
      )}

      {phase === "practice" && set && currentRecording && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between text-sm text-muted">
            <span>{t.listening.session.recordingLabel(currentRecordingIndex + 1, set.recordings.length)}</span>
            <span className="font-medium text-foreground">
              {currentRecording.partLabel} — {currentRecording.topic}
            </span>
          </div>

          <ListeningAudioPlayer transcript={currentRecording.transcript} />

          {currentRecordingQuestions.map((q) => (
            <ListeningQuestionCard
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
              onClick={() => setCurrentRecordingIndex((i) => Math.max(0, i - 1))}
              disabled={currentRecordingIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              {t.listening.session.previous}
            </Button>
            {isLastRecording ? (
              <Button onClick={handleSubmit} disabled={!allQuestionsAnswered}>
                {t.listening.session.submit}
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentRecordingIndex((i) => i + 1)}
                disabled={!answeredInCurrentRecording}
              >
                {t.listening.session.next}
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {phase === "results" && result && feedback && set && (
        <div className="flex flex-col gap-6">
          <ListeningResultsSummary result={result} />
          <ListeningFeedbackCard feedback={feedback} />

          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => setShowReview((s) => !s)}>
              {showReview ? t.listening.results.hideReview : t.listening.results.reviewAnswers}
            </Button>
            <Button onClick={handleBackToModes}>{t.listening.results.newSession}</Button>
          </div>

          {showReview && (
            <div className="flex flex-col gap-4">
              {set.questions.map((q, i) => {
                const qResult = result.questionResults.find((qr) => qr.questionId === q.id);
                if (!qResult) return null;
                return (
                  <ListeningQuestionReview
                    key={q.id}
                    question={q}
                    questionNumber={i + 1}
                    selectedOptionIds={qResult.selectedOptionIds}
                    isCorrect={qResult.isCorrect}
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
