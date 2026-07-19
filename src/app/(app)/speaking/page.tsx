"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { resolvePracticeLevel } from "@/lib/utils/level";
import { DELF_SPEAKING_LEVELS, flattenSpeakingParts } from "@/config/delf-speaking";
import {
  localizeTurnFeedback,
  localizeReport,
  type TurnSelection,
  type ReportSelection,
} from "@/lib/mock/speaking-evaluation";
import type { FeedbackLanguage } from "@/types/writing-evaluation";
import { SpeakingModeSelect } from "@/components/speaking/SpeakingModeSelect";
import { SpeakingProgressStepper } from "@/components/speaking/SpeakingProgressStepper";
import { SpeakingQuestionCard } from "@/components/speaking/SpeakingQuestionCard";
import { SpeakingResponseInput } from "@/components/speaking/SpeakingResponseInput";
import { SpeakingTurnFeedback } from "@/components/speaking/SpeakingTurnFeedback";
import { SpeakingExaminerReport } from "@/components/speaking/SpeakingExaminerReport";
import { cn } from "@/lib/utils/cn";

const FEEDBACK_LANGUAGES: FeedbackLanguage[] = ["en", "ru", "kz"];
const LANGUAGE_LABELS: Record<FeedbackLanguage, string> = { en: "EN", ru: "RU", kz: "KZ" };

type Mode = "select" | "live" | "written";
type Phase = "asking" | "evaluating-turn" | "turn-feedback" | "compiling-report" | "report";

const LIVE_AUTO_ADVANCE_DELAY_MS = 2200;

export default function SpeakingPracticePage() {
  const { profile, recordActivity } = useUserProfile();
  const level = profile ? resolvePracticeLevel(profile.targetLevel) : "A1";
  const levelConfig = DELF_SPEAKING_LEVELS[level];
  const queue = useMemo(() => flattenSpeakingParts(levelConfig), [levelConfig]);

  const [mode, setMode] = useState<Mode>("select");
  const [phase, setPhase] = useState<Phase>("asking");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responseText, setResponseText] = useState("");
  const [language, setLanguage] = useState<FeedbackLanguage>("en");
  const [turnSelections, setTurnSelections] = useState<TurnSelection[]>([]);
  const [currentTurnSelection, setCurrentTurnSelection] = useState<TurnSelection | null>(null);
  const [reportSelection, setReportSelection] = useState<ReportSelection | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentItem = queue[currentIndex];
  const turnFeedback = currentTurnSelection
    ? localizeTurnFeedback(currentTurnSelection, language)
    : null;
  const report = reportSelection ? localizeReport(reportSelection, language) : null;

  async function handleFinish(selections: TurnSelection[]) {
    setPhase("compiling-report");
    setError(null);
    try {
      const res = await fetch("/api/speaking/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, language, turnSelections: selections }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Report generation failed");
      const nextSelection = data.selection as ReportSelection;
      setReportSelection(nextSelection);
      setPhase("report");
      recordActivity(
        "speaking",
        Math.round((nextSelection.estimatedScore / nextSelection.scoreOutOf) * 100)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPhase("turn-feedback");
    }
  }

  function handleContinue() {
    if (currentIndex + 1 < queue.length) {
      setCurrentIndex((i) => i + 1);
      setCurrentTurnSelection(null);
      setPhase("asking");
    } else {
      void handleFinish(turnSelections);
    }
  }

  useEffect(() => {
    if (mode === "live" && phase === "turn-feedback") {
      const timer = setTimeout(handleContinue, LIVE_AUTO_ADVANCE_DELAY_MS);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, phase]);

  async function handleSubmitTurn() {
    if (!responseText.trim() || !currentItem) return;
    setPhase("evaluating-turn");
    setError(null);
    try {
      const res = await fetch("/api/speaking/evaluate-turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level,
          partId: currentItem.partId,
          questionId: currentItem.questionId,
          responseText,
          language,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Evaluation failed");
      const selection = data.selection as TurnSelection;
      setTurnSelections((prev) => [...prev, selection]);
      setCurrentTurnSelection(selection);
      setResponseText("");
      setPhase("turn-feedback");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPhase("asking");
    }
  }

  function handleSelectMode(next: "live" | "written") {
    setMode(next);
    setPhase("asking");
    setCurrentIndex(0);
    setResponseText("");
    setTurnSelections([]);
    setCurrentTurnSelection(null);
    setReportSelection(null);
    setError(null);
  }

  function handleRestart() {
    setMode("select");
  }

  if (!profile) return null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Speaking Practice"
        description="Practice the official DELF speaking format for your level, with instant AI feedback."
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
            <LanguagePicker language={language} onChange={setLanguage} />
          </div>

          {(phase === "asking" || phase === "evaluating-turn") && (
            <>
              <SpeakingQuestionCard
                partLabel={currentItem.partLabel}
                prompt={currentItem.prompt}
                suggestedDurationSeconds={currentItem.suggestedDurationSeconds}
              />
              <SpeakingResponseInput
                value={responseText}
                onChange={setResponseText}
                onSubmit={handleSubmitTurn}
                isSubmitting={phase === "evaluating-turn"}
              />
            </>
          )}

          {phase === "turn-feedback" && turnFeedback && (
            <SpeakingTurnFeedback
              feedback={turnFeedback}
              onContinue={handleContinue}
              continueLabel={
                currentIndex + 1 < queue.length ? "Next question" : "Finish & see report"
              }
              autoAdvancing={mode === "live"}
            />
          )}

          {phase === "compiling-report" && (
            <Card className="border-dashed">
              <CardContent className="flex items-center justify-center gap-3 py-12 text-sm text-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
                Compiling your examiner report...
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
                <CardTitle>Examiner Report</CardTitle>
                <CardDescription>
                  {mode === "live" ? "AI Live Examiner" : "Written Speaking Practice"} ·{" "}
                  {levelConfig.label}
                </CardDescription>
              </div>
              <LanguagePicker language={language} onChange={setLanguage} />
            </CardHeader>
          </Card>
          <SpeakingExaminerReport report={report} />
          <div className="flex justify-end">
            <Button variant="secondary" onClick={handleRestart}>
              Practice again
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
}: {
  language: FeedbackLanguage;
  onChange: (lang: FeedbackLanguage) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-background p-1">
      {FEEDBACK_LANGUAGES.map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => onChange(lang)}
          aria-pressed={language === lang}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
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
