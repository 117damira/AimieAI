"use client";

import { useState } from "react";
import { Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, Button } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { defaultLevelForTrack } from "@/lib/utils/topikLevel";
import { TOPIK_LISTENING_LEVELS } from "@/config/topik-listening";
import { pickDailyTopikChallengeRecordingIds } from "@/lib/topik/listening-rotation";
import { scoreTopikListeningSet } from "@/lib/topik/listening-scoring";
import { synthesizeTopikListeningFeedback } from "@/lib/topik/listening-feedback";
import { TopikListeningLevelDashboard } from "@/components/topik/listening/TopikListeningLevelDashboard";
import { TopikListeningModeSelect } from "@/components/topik/listening/TopikListeningModeSelect";
import { TopikListeningAudioPlayer } from "@/components/topik/listening/TopikListeningAudioPlayer";
import { TopikListeningQuestionCard } from "@/components/topik/listening/TopikListeningQuestionCard";
import {
  TopikListeningResultsSummary,
  TopikListeningFeedbackCard,
} from "@/components/topik/listening/TopikListeningResultsSummary";
import { TopikListeningQuestionReview } from "@/components/topik/listening/TopikListeningQuestionReview";
import { TopikListeningTipsCard } from "@/components/topik/listening/TopikListeningTipsCard";
import { TopikAnswerReviewModal } from "@/components/topik/TopikAnswerReviewModal";
import type {
  TopikListeningFeedback,
  TopikListeningMode,
  TopikListeningResult,
  TopikListeningSet,
} from "@/types/topik-listening";

type Phase = "home" | "loading" | "practice" | "results";

/**
 * Top-level TOPIK Listening assembly — mirrors app/(app)/listening/page.tsx
 * (now DelfListeningPage)'s state machine (home -> loading -> practice ->
 * results) exactly, but driven by profile.topikLevel/profile.topikTrack
 * instead of profile.targetLevel, and calling the TOPIK-specific profile
 * mutators (recordTopikListeningCompletion, recordTopikActivity) instead of
 * DELF's. Listening exists for both TOPIK I and TOPIK II, so unlike Writing
 * there is no ComingSoon branch here — every TOPIK account can practice it.
 */
export function TopikListeningPage() {
  const { profile, recordTopikActivity, recordTopikListeningCompletion } = useUserProfile();
  const { t, language } = useLanguage();

  const [phase, setPhase] = useState<Phase>("home");
  const [set, setSet] = useState<TopikListeningSet | null>(null);
  const [currentRecordingIndex, setCurrentRecordingIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<TopikListeningResult | null>(null);
  const [feedback, setFeedback] = useState<TopikListeningFeedback | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [sessionStartMs, setSessionStartMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!profile) return null;
  const level = profile.topikLevel ?? defaultLevelForTrack(profile.topikTrack ?? "I");
  const config = TOPIK_LISTENING_LEVELS[level];
  const todaysDailyRecordingIds = pickDailyTopikChallengeRecordingIds(level);
  const listeningHistoryForLevel = profile.topikListeningHistory[level] ?? [];
  const dailyChallengeCompleted = todaysDailyRecordingIds.every((id) => listeningHistoryForLevel.includes(id));

  async function startSession(mode: TopikListeningMode) {
    setError(null);
    setPhase("loading");
    try {
      const res = await fetch("/api/topik/listening/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level,
          mode,
          language,
          history: profile?.topikListeningHistory[level] ?? [],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.common.somethingWentWrong);
      setSet(data.set as TopikListeningSet);
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
    const nextResult = scoreTopikListeningSet(set, answerList, timeSpentSeconds);
    const nextFeedback = synthesizeTopikListeningFeedback(set, nextResult, language);
    setResult(nextResult);
    setFeedback(nextFeedback);
    recordTopikListeningCompletion(
      level,
      set.recordings.map((r) => r.id)
    );
    recordTopikActivity("listening", Math.round((nextResult.score / nextResult.scoreOutOf) * 100));
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
        description={t.topik.listening.pageDescription}
        onBack={phase !== "home" ? handleBackToModes : undefined}
        backLabel={phase !== "home" ? t.listening.session.backToModes : undefined}
      />

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-danger-500/20 bg-danger-50 px-4 py-3 text-sm text-danger-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {phase === "home" && (
        <>
          <TopikListeningLevelDashboard config={config} />
          <TopikListeningModeSelect onSelectMode={startSession} dailyChallengeCompleted={dailyChallengeCompleted} />
          <TopikListeningTipsCard />
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
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-muted">
            <span>{t.listening.session.recordingLabel(currentRecordingIndex + 1, set.recordings.length)}</span>
            <span className="font-medium text-foreground">
              {currentRecording.partLabel} — {currentRecording.topic}
            </span>
          </div>

          <TopikListeningAudioPlayer transcript={currentRecording.transcript} />

          {currentRecordingQuestions.map((q) => (
            <TopikListeningQuestionCard
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
          <TopikListeningResultsSummary result={result} />
          <TopikListeningFeedbackCard feedback={feedback} />

          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => setShowReview(true)}>
              {t.listening.results.reviewAnswers}
            </Button>
            <Button onClick={handleBackToModes}>{t.listening.results.newSession}</Button>
          </div>

          <TopikAnswerReviewModal
            open={showReview}
            onClose={() => setShowReview(false)}
            title={t.listening.results.reviewAnswers}
            hideLabel={t.listening.results.hideReview}
          >
            {set.questions.map((q, i) => {
              const qResult = result.questionResults.find((qr) => qr.questionId === q.id);
              if (!qResult) return null;
              return (
                <TopikListeningQuestionReview
                  key={q.id}
                  question={q}
                  questionNumber={i + 1}
                  selectedOptionIds={qResult.selectedOptionIds}
                  isCorrect={qResult.isCorrect}
                />
              );
            })}
          </TopikAnswerReviewModal>
        </div>
      )}
    </div>
  );
}
