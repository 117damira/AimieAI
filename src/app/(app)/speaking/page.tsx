"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, AlertCircle, Volume2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { resolvePracticeLevel } from "@/lib/utils/level";
import { DELF_SPEAKING_LEVELS, flattenSpeakingParts } from "@/config/delf-speaking";
import { speak, EXAM_SPEECH_LOCALE, FEEDBACK_SPEECH_LOCALES } from "@/lib/utils/voice";
import type { CompletedTurn, SpeakingExaminerReport, TurnFeedback } from "@/types/speaking-evaluation";
import type { FeedbackLanguage } from "@/types/writing-evaluation";
import { SpeakingModeSelect } from "@/components/speaking/SpeakingModeSelect";
import { SpeakingProgressStepper } from "@/components/speaking/SpeakingProgressStepper";
import { SpeakingQuestionCard } from "@/components/speaking/SpeakingQuestionCard";
import { SpeakingResponseInput } from "@/components/speaking/SpeakingResponseInput";
import { SpeakingTurnFeedback } from "@/components/speaking/SpeakingTurnFeedback";
import { SpeakingExaminerReport as SpeakingExaminerReportView } from "@/components/speaking/SpeakingExaminerReport";
import { cn } from "@/lib/utils/cn";

const FEEDBACK_LANGUAGES: FeedbackLanguage[] = ["en", "ru", "kz"];
const LANGUAGE_LABELS: Record<FeedbackLanguage, string> = { en: "EN", ru: "RU", kz: "KZ" };

type Mode = "select" | "live" | "written";
type Phase = "asking" | "evaluating-turn" | "turn-feedback" | "compiling-report" | "report";

/** Short pause after the AI finishes speaking feedback, before auto-advancing. */
const LIVE_FEEDBACK_ADVANCE_BUFFER_MS = 900;

interface TurnRequestBody {
  partId: string;
  partLabel: string;
  questionId: string;
  prompt: string;
  transcript: string;
  recognitionConfidence: number | null;
}

export default function SpeakingPracticePage() {
  const { profile, recordActivity } = useUserProfile();
  const { t } = useLanguage();
  const level = profile ? resolvePracticeLevel(profile.targetLevel) : "A1";
  const levelConfig = DELF_SPEAKING_LEVELS[level];
  const queue = useMemo(() => flattenSpeakingParts(levelConfig), [levelConfig]);

  const [mode, setMode] = useState<Mode>("select");
  const [phase, setPhase] = useState<Phase>("asking");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [language, setLanguage] = useState<FeedbackLanguage>("en");
  const [completedTurns, setCompletedTurns] = useState<CompletedTurn[]>([]);
  const [currentFeedback, setCurrentFeedback] = useState<TurnFeedback | null>(null);
  const [report, setReport] = useState<SpeakingExaminerReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);

  const lastTurnRequestRef = useRef<TurnRequestBody | null>(null);
  const currentItem = queue[currentIndex];

  async function fetchTurnFeedback(body: TurnRequestBody, lang: FeedbackLanguage): Promise<TurnFeedback> {
    const res = await fetch("/api/speaking/evaluate-turn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level, ...body, language: lang }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || t.speaking.evaluationFailed);
    return data.feedback as TurnFeedback;
  }

  async function fetchReport(turns: CompletedTurn[], lang: FeedbackLanguage): Promise<SpeakingExaminerReport> {
    const res = await fetch("/api/speaking/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level, language: lang, completedTurns: turns }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || t.speaking.reportGenerationFailed);
    return data.report as SpeakingExaminerReport;
  }

  async function handleFinish(turns: CompletedTurn[]) {
    setPhase("compiling-report");
    setError(null);
    try {
      const nextReport = await fetchReport(turns, language);
      setReport(nextReport);
      setPhase("report");
      recordActivity("speaking", Math.round((nextReport.estimatedScore / nextReport.scoreOutOf) * 100));
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.somethingWentWrong);
      setPhase("turn-feedback");
    }
  }

  function handleContinue() {
    if (currentIndex + 1 < queue.length) {
      setCurrentIndex((i) => i + 1);
      setCurrentFeedback(null);
      setPhase("asking");
    } else {
      void handleFinish(completedTurns);
    }
  }

  // Live mode: speak each new question aloud in French as soon as it appears.
  useEffect(() => {
    if (mode === "live" && phase === "asking" && currentItem) {
      void speak(currentItem.prompt, EXAM_SPEECH_LOCALE);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, phase, currentIndex]);

  // Live mode: speak the feedback summary, then auto-advance once it finishes.
  useEffect(() => {
    if (mode !== "live" || phase !== "turn-feedback" || !currentFeedback) return;
    let cancelled = false;
    const spokenSummary = [
      currentFeedback.relevance ? t.speaking.answeredQuestion : t.speaking.needsMoreDevelopment,
      currentFeedback.encouragement,
    ].join(". ");
    speak(spokenSummary, FEEDBACK_SPEECH_LOCALES[language]).then(() => {
      if (cancelled) return;
      setTimeout(() => {
        if (!cancelled) handleContinue();
      }, LIVE_FEEDBACK_ADVANCE_BUFFER_MS);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, phase, currentFeedback]);

  async function handleSubmitTurn(transcript: string, confidence: number | null) {
    if (!currentItem) return;
    setPhase("evaluating-turn");
    setError(null);
    const requestBody: TurnRequestBody = {
      partId: currentItem.partId,
      partLabel: currentItem.partLabel,
      questionId: currentItem.questionId,
      prompt: currentItem.prompt,
      transcript,
      recognitionConfidence: confidence,
    };
    lastTurnRequestRef.current = requestBody;
    try {
      const feedback = await fetchTurnFeedback(requestBody, language);
      const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length;
      setCompletedTurns((prev) => [
        ...prev,
        { partId: currentItem.partId, questionId: currentItem.questionId, transcript, wordCount, feedback },
      ]);
      setCurrentFeedback(feedback);
      setPhase("turn-feedback");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.somethingWentWrong);
      setPhase("asking");
    }
  }

  async function handleLanguageChange(newLang: FeedbackLanguage) {
    setLanguage(newLang);
    if (phase === "turn-feedback" && lastTurnRequestRef.current) {
      setIsChangingLanguage(true);
      try {
        const feedback = await fetchTurnFeedback(lastTurnRequestRef.current, newLang);
        setCurrentFeedback(feedback);
        setCompletedTurns((prev) =>
          prev.length === 0 ? prev : [...prev.slice(0, -1), { ...prev[prev.length - 1], feedback }]
        );
      } catch {
        // Keep showing the previous-language feedback rather than erroring out.
      } finally {
        setIsChangingLanguage(false);
      }
    } else if (phase === "report") {
      setIsChangingLanguage(true);
      try {
        const nextReport = await fetchReport(completedTurns, newLang);
        setReport(nextReport);
      } catch {
        // Keep showing the previous-language report rather than erroring out.
      } finally {
        setIsChangingLanguage(false);
      }
    }
  }

  function handleRepeatQuestion() {
    if (currentItem) void speak(currentItem.prompt, EXAM_SPEECH_LOCALE);
  }

  function handleSelectMode(next: "live" | "written") {
    setMode(next);
    setPhase("asking");
    setCurrentIndex(0);
    setCompletedTurns([]);
    setCurrentFeedback(null);
    setReport(null);
    setError(null);
    lastTurnRequestRef.current = null;
  }

  function handleRestart() {
    setMode("select");
  }

  if (!profile) return null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t.speaking.pageTitle}
        description={t.speaking.pageDescription}
        onBack={mode !== "select" ? handleRestart : undefined}
        backLabel={t.common.back}
      />

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {mode === "select" && (
        <SpeakingModeSelect levelConfig={levelConfig} onSelectMode={handleSelectMode} />
      )}

      {mode !== "select" && currentItem && phase !== "report" && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <SpeakingProgressStepper
                currentIndex={currentIndex}
                total={queue.length}
                partLabel={currentItem.partLabel}
              />
            </div>
            <LanguagePicker
              language={language}
              onChange={handleLanguageChange}
              disabled={isChangingLanguage}
            />
          </div>

          {(phase === "asking" || phase === "evaluating-turn") && (
            <>
              <SpeakingQuestionCard
                partLabel={currentItem.partLabel}
                prompt={currentItem.prompt}
                suggestedDurationSeconds={currentItem.suggestedDurationSeconds}
              />
              {mode === "live" && phase === "asking" && (
                <Button variant="secondary" size="sm" className="self-start" onClick={handleRepeatQuestion}>
                  <Volume2 className="h-4 w-4" />
                  {t.speaking.repeatQuestion}
                </Button>
              )}
              <SpeakingResponseInput
                onSubmit={handleSubmitTurn}
                isSubmitting={phase === "evaluating-turn"}
              />
            </>
          )}

          {phase === "turn-feedback" && currentFeedback && (
            <SpeakingTurnFeedback
              feedback={currentFeedback}
              onContinue={handleContinue}
              continueLabel={
                currentIndex + 1 < queue.length
                  ? t.speaking.nextQuestion
                  : t.speaking.finishSeeReport
              }
              autoAdvancing={mode === "live"}
            />
          )}

          {phase === "compiling-report" && (
            <Card className="border-dashed">
              <CardContent className="flex items-center justify-center gap-3 py-12 text-sm text-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.speaking.compilingReport}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {phase === "report" && report && (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>{t.speaking.examinerReport}</CardTitle>
                <CardDescription>
                  {mode === "live" ? t.speaking.modeLive : t.speaking.modeWritten} ·{" "}
                  {levelConfig.label}
                </CardDescription>
              </div>
              <LanguagePicker
                language={language}
                onChange={handleLanguageChange}
                disabled={isChangingLanguage}
              />
            </CardHeader>
          </Card>
          <SpeakingExaminerReportView report={report} />
          <div className="flex justify-end">
            <Button variant="secondary" onClick={handleRestart}>
              {t.speaking.practiceAgain}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function LanguagePicker({
  language,
  onChange,
  disabled,
}: {
  language: FeedbackLanguage;
  onChange: (lang: FeedbackLanguage) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-background p-1">
      {FEEDBACK_LANGUAGES.map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => onChange(lang)}
          disabled={disabled}
          aria-pressed={language === lang}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
            language === lang
              ? "bg-primary-600 text-white"
              : "text-muted hover:text-foreground"
          )}
        >
          {LANGUAGE_LABELS[lang]}
        </button>
      ))}
    </div>
  );
}
