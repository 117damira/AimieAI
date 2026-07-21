"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle, Volume2, LogOut } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { resolvePracticeLevel } from "@/lib/utils/level";
import { DELF_SPEAKING_LEVELS } from "@/config/delf-speaking";
import { speak, EXAM_SPEECH_LOCALE, FEEDBACK_SPEECH_LOCALES } from "@/lib/utils/voice";
import type {
  CompletedTurn,
  GeneratedSpeakingQuestion,
  GeneratedTopicChoice,
  SpeakingExaminerReport,
  TurnFeedback,
} from "@/types/speaking-evaluation";
import type { DelfLevel, FeedbackLanguage } from "@/types/writing-evaluation";
import { SpeakingModeSelect } from "@/components/speaking/SpeakingModeSelect";
import { SpeakingProgressStepper } from "@/components/speaking/SpeakingProgressStepper";
import { SpeakingQuestionCard } from "@/components/speaking/SpeakingQuestionCard";
import { SpeakingResponseInput } from "@/components/speaking/SpeakingResponseInput";
import { SpeakingTurnFeedback } from "@/components/speaking/SpeakingTurnFeedback";
import { SpeakingExaminerReport as SpeakingExaminerReportView } from "@/components/speaking/SpeakingExaminerReport";
import { SpeakingWelcomeScreen } from "@/components/speaking/SpeakingWelcomeScreen";
import { SpeakingPreparationTimer } from "@/components/speaking/SpeakingPreparationTimer";
import { SpeakingTopicChoice } from "@/components/speaking/SpeakingTopicChoice";
import { SpeakingExitExamDialog } from "@/components/speaking/SpeakingExitExamDialog";

type Mode = "select" | "live" | "written";
type Phase =
  | "welcome"
  | "topic-choice"
  | "preparing"
  | "asking"
  | "evaluating-turn"
  | "turn-feedback"
  | "compiling-report"
  | "report";

interface QueueItem extends GeneratedSpeakingQuestion {
  questionId: string;
}

interface TurnRequestBody {
  partId: string;
  partLabel: string;
  questionId: string;
  prompt: string;
  transcript: string;
  recognitionConfidence: number | null;
  previousCoachingTips: string[];
}

function withQuestionIds(questions: GeneratedSpeakingQuestion[]): QueueItem[] {
  return questions.map((q, i) => ({ ...q, questionId: `${q.partId}-${i}` }));
}

export default function SpeakingPracticePage() {
  return (
    <Suspense fallback={null}>
      <SpeakingPracticePageContent />
    </Suspense>
  );
}

function SpeakingPracticePageContent() {
  const { profile, recordActivity } = useUserProfile();
  const { t, language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const level: DelfLevel = profile ? resolvePracticeLevel(profile.targetLevel) : "A1";
  const levelConfig = DELF_SPEAKING_LEVELS[level];

  // Mode is driven by the URL (not local state) so entering a mode pushes a
  // real browser-history entry: pressing the browser's own Back button while
  // in "live"/"written" lands back on mode-select within Speaking, instead
  // of skipping straight past it to whatever page preceded /speaking.
  const modeParam = searchParams.get("mode");
  const mode: Mode = modeParam === "live" || modeParam === "written" ? modeParam : "select";
  const [phase, setPhase] = useState<Phase>("asking");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [topicChoices, setTopicChoices] = useState<GeneratedTopicChoice[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [completedTurns, setCompletedTurns] = useState<CompletedTurn[]>([]);
  const [currentFeedback, setCurrentFeedback] = useState<TurnFeedback | null>(null);
  const [report, setReport] = useState<SpeakingExaminerReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);

  const lastTurnRequestRef = useRef<TurnRequestBody | null>(null);
  const prevLanguageRef = useRef(language);
  const lastSpokenQuestionIdRef = useRef<string | null>(null);
  const currentItem = queue[currentIndex];

  async function fetchSessionQuestions(
    lvl: DelfLevel,
    lang: FeedbackLanguage,
    topic?: string
  ): Promise<QueueItem[]> {
    const res = await fetch("/api/speaking/generate-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "questions", level: lvl, language: lang, topic }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || t.common.somethingWentWrong);
    return withQuestionIds(data.questions as GeneratedSpeakingQuestion[]);
  }

  async function fetchB2Topics(lang: FeedbackLanguage): Promise<GeneratedTopicChoice[]> {
    const res = await fetch("/api/speaking/generate-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "topics", level: "B2", language: lang }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || t.common.somethingWentWrong);
    return data.topics as GeneratedTopicChoice[];
  }

  async function fetchTurnFeedback(
    body: TurnRequestBody,
    lang: FeedbackLanguage
  ): Promise<{ feedback: TurnFeedback; followUpQuestion: { prompt: string; translation: string } | null }> {
    const res = await fetch("/api/speaking/evaluate-turn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level, ...body, language: lang }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || t.speaking.evaluationFailed);
    return { feedback: data.feedback as TurnFeedback, followUpQuestion: data.followUpQuestion ?? null };
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

  async function loadQuestions(topic?: string) {
    try {
      const questions = await fetchSessionQuestions(level, language, topic);
      setQueue(questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.somethingWentWrong);
    }
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

  // Live mode: speak each new question aloud in French exactly once, as soon
  // as it first appears — during "preparing" (B1/B2, prompt shown before the
  // timer) if there is prep time, or "asking" directly (A1/A2, no prep time).
  useEffect(() => {
    if (mode !== "live" || !currentItem) return;
    if (phase !== "preparing" && phase !== "asking") return;
    if (lastSpokenQuestionIdRef.current === currentItem.questionId) return;
    lastSpokenQuestionIdRef.current = currentItem.questionId;
    void speak(currentItem.prompt, EXAM_SPEECH_LOCALE);
  }, [mode, phase, currentItem]);

  // Live mode: speak the feedback summary aloud once — the student always
  // clicks "Next Question" themselves; nothing auto-advances.
  useEffect(() => {
    if (mode !== "live" || phase !== "turn-feedback" || !currentFeedback) return;
    const spokenSummary = [
      currentFeedback.relevance ? t.speaking.answeredQuestion : t.speaking.needsMoreDevelopment,
      currentFeedback.encouragement,
    ].join(". ");
    void speak(spokenSummary, FEEDBACK_SPEECH_LOCALES[language]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, phase, currentFeedback]);

  // Re-fetch feedback/report in the newly selected global UI language if the
  // learner switches it (via Topbar) mid-session.
  useEffect(() => {
    if (prevLanguageRef.current === language) return;
    prevLanguageRef.current = language;
    if (phase === "turn-feedback" && lastTurnRequestRef.current) {
      const requestBody = lastTurnRequestRef.current;
      void (async () => {
        try {
          const { feedback } = await fetchTurnFeedback(requestBody, language);
          setCurrentFeedback(feedback);
          setCompletedTurns((prev) =>
            prev.length === 0 ? prev : [...prev.slice(0, -1), { ...prev[prev.length - 1], feedback }]
          );
        } catch {
          // Keep showing the previous-language feedback rather than erroring out.
        }
      })();
    } else if (phase === "report") {
      void (async () => {
        try {
          const nextReport = await fetchReport(completedTurns, language);
          setReport(nextReport);
        } catch {
          // Keep showing the previous-language report rather than erroring out.
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

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
      previousCoachingTips: completedTurns.map((t) => t.feedback.coachingTip),
    };
    lastTurnRequestRef.current = requestBody;
    try {
      const { feedback: rawFeedback, followUpQuestion } = await fetchTurnFeedback(requestBody, language);
      const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length;
      // A follow-up question means this isn't actually the last question
      // anymore; only override the "let's move on" message when nothing
      // else is queued up after this turn.
      const isLastQuestion = !followUpQuestion && currentIndex + 1 >= queue.length;
      const feedback: TurnFeedback = isLastQuestion
        ? { ...rawFeedback, encouragement: t.speaking.feedback.sessionCompleteEncouragement }
        : rawFeedback;
      setCompletedTurns((prev) => [
        ...prev,
        { partId: currentItem.partId, questionId: currentItem.questionId, transcript, wordCount, feedback },
      ]);
      if (followUpQuestion) {
        const followUpItem: QueueItem = {
          partId: currentItem.partId,
          partLabel: currentItem.partLabel,
          prompt: followUpQuestion.prompt,
          translation: followUpQuestion.translation,
          suggestedDurationSeconds: 30,
          questionId: `${currentItem.questionId}-followup`,
        };
        setQueue((prev) => {
          const next = [...prev];
          next.splice(currentIndex + 1, 0, followUpItem);
          return next;
        });
      }
      setCurrentFeedback(feedback);
      setPhase("turn-feedback");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.somethingWentWrong);
      setPhase("asking");
    }
  }

  function handleRepeatQuestion() {
    if (currentItem) void speak(currentItem.prompt, EXAM_SPEECH_LOCALE);
  }

  function resetSession() {
    setCurrentIndex(0);
    setQueue([]);
    setTopicChoices([]);
    setCompletedTurns([]);
    setCurrentFeedback(null);
    setReport(null);
    setError(null);
    lastTurnRequestRef.current = null;
    lastSpokenQuestionIdRef.current = null;
  }

  function handleSelectMode(next: "live" | "written") {
    resetSession();
    router.push(`/speaking?mode=${next}`);
    if (next === "live") {
      setPhase("welcome");
      if (level !== "B2") {
        void loadQuestions();
      }
    } else {
      setPhase("asking");
      void loadQuestions();
    }
  }

  /** Always returns to Speaking's own mode-selection screen — never to
   * Vocabulary, Dashboard, or any other page. */
  function handleBackToModeSelect() {
    resetSession();
    router.push("/speaking");
  }

  /** DELF has no preparation time at A1/A2 — go straight to the question;
   * B1/B2 show the prompt during a real preparation countdown first. */
  function proceedPastWelcome() {
    setPhase(levelConfig.prepTimeMinutes > 0 ? "preparing" : "asking");
  }

  function handleStartExam() {
    if (level === "B2") {
      setPhase("topic-choice");
      setIsLoadingTopics(true);
      fetchB2Topics(language)
        .then(setTopicChoices)
        .catch((err) => setError(err instanceof Error ? err.message : t.common.somethingWentWrong))
        .finally(() => setIsLoadingTopics(false));
    } else {
      proceedPastWelcome();
    }
  }

  function handleSelectTopic(topic: GeneratedTopicChoice) {
    void loadQuestions(topic.title);
    proceedPastWelcome();
  }

  function handlePreparationDone() {
    setPhase("asking");
  }

  function handleRestart() {
    handleBackToModeSelect();
  }

  if (!profile) return null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t.speaking.pageTitle}
        description={t.speaking.pageDescription}
        onBack={mode !== "select" ? handleBackToModeSelect : undefined}
        backLabel={mode !== "select" ? t.common.back : undefined}
        action={
          mode !== "select" && phase !== "report" ? (
            <Button variant="outline" size="sm" onClick={() => setIsExitDialogOpen(true)}>
              <LogOut className="h-4 w-4" />
              {t.speaking.exitExam}
            </Button>
          ) : undefined
        }
      />

      <SpeakingExitExamDialog
        open={isExitDialogOpen}
        onClose={() => setIsExitDialogOpen(false)}
        onConfirm={() => {
          setIsExitDialogOpen(false);
          handleBackToModeSelect();
        }}
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

      {mode === "live" && phase === "welcome" && (
        <SpeakingWelcomeScreen levelConfig={levelConfig} onStart={handleStartExam} />
      )}

      {mode === "live" && phase === "topic-choice" && (
        isLoadingTopics ? (
          <Card className="border-dashed">
            <CardContent className="flex items-center justify-center gap-3 py-12 text-sm text-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t.speaking.generatingQuestions}
            </CardContent>
          </Card>
        ) : (
          <SpeakingTopicChoice topics={topicChoices} onSelect={handleSelectTopic} />
        )
      )}

      {mode !== "select" &&
        phase !== "welcome" &&
        phase !== "topic-choice" &&
        phase !== "report" && (
          <div className="flex flex-col gap-6">
            {currentItem && (
              <SpeakingProgressStepper
                currentIndex={currentIndex}
                total={queue.length}
                partLabel={currentItem.partLabel}
              />
            )}

            {!currentItem && (
              <Card className="border-dashed">
                <CardContent className="flex items-center justify-center gap-3 py-12 text-sm text-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.speaking.generatingQuestions}
                </CardContent>
              </Card>
            )}

            {currentItem && phase === "preparing" && (
              <>
                <SpeakingQuestionCard
                  partLabel={currentItem.partLabel}
                  prompt={currentItem.prompt}
                  translation={currentItem.translation}
                  suggestedDurationSeconds={currentItem.suggestedDurationSeconds}
                />
                <Button variant="secondary" size="sm" className="self-start" onClick={handleRepeatQuestion}>
                  <Volume2 className="h-4 w-4" />
                  {t.speaking.repeatQuestion}
                </Button>
                <SpeakingPreparationTimer
                  totalMinutes={levelConfig.prepTimeMinutes}
                  onSkip={handlePreparationDone}
                  onComplete={handlePreparationDone}
                />
              </>
            )}

            {currentItem && (phase === "asking" || phase === "evaluating-turn") && (
              <>
                <SpeakingQuestionCard
                  partLabel={currentItem.partLabel}
                  prompt={currentItem.prompt}
                  translation={currentItem.translation}
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
                showPronunciationWords={mode === "live"}
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
            <CardHeader>
              <CardTitle>{t.speaking.examinerReport}</CardTitle>
              <CardDescription>
                {mode === "live" ? t.speaking.modeLive : t.speaking.modeWritten} · {levelConfig.label}
              </CardDescription>
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
