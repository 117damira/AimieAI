"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  PenLine,
  Sparkles,
  SpellCheck,
  BookOpenText,
  LayoutList,
  Award,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
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
import { DELF_WRITING_LEVELS } from "@/config/delf-writing";
import type {
  FeedbackLanguage,
  GrammarError,
  WritingEvaluation,
  WritingTopicPrompt,
} from "@/types/writing-evaluation";
import { cn } from "@/lib/utils/cn";
import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { resolvePracticeLevel } from "@/lib/utils/level";
import { pickNextWritingPrompt } from "@/lib/writing/topicRotation";

const GRAMMAR_CATEGORY_LABELS: Record<GrammarError["category"], Record<FeedbackLanguage, string>> = {
  verb: { en: "verb", ru: "глагол", kz: "етістік" },
  agreement: { en: "agreement", ru: "согласование", kz: "келісім" },
  "sentence-structure": {
    en: "sentence structure",
    ru: "структура предложения",
    kz: "сөйлем құрылымы",
  },
  other: { en: "other", ru: "другое", kz: "басқа" },
};

export default function WritingPracticePage() {
  const { profile, recordActivity, recordWritingTopic } = useUserProfile();
  const { t, language: uiLanguage } = useLanguage();
  const [text, setText] = useState("");
  const [evaluation, setEvaluation] = useState<WritingEvaluation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<WritingTopicPrompt | null>(null);
  const [pickedForProfileId, setPickedForProfileId] = useState<string | null>(null);
  const recordedTopicIdRef = useRef<string | null>(null);
  const lastRequestRef = useRef<{ level: string; prompt: string; response: string } | null>(null);
  const prevLanguageRef = useRef(uiLanguage);

  // Picks a rotated topic as soon as the profile becomes available. Setting
  // state directly in the render body (React's documented pattern for
  // "adjusting state when a prop/derived value changes") rather than in a
  // useEffect, so the pick is ready on the same render it becomes possible —
  // guarded so it only fires once per profile, not on every render.
  if (profile && pickedForProfileId !== profile.id) {
    const level = resolvePracticeLevel(profile.targetLevel);
    const history = profile.writingTopicHistory?.[level] ?? [];
    setCurrentPrompt(pickNextWritingPrompt(level, history));
    setPickedForProfileId(profile.id);
  }

  // Persists the pick into the user's topic history — an external side
  // effect (mutates profile via context), so it belongs in an effect, not
  // the render body above. Guarded so each pick is only recorded once.
  useEffect(() => {
    if (!profile || !currentPrompt) return;
    if (recordedTopicIdRef.current === currentPrompt.id) return;
    recordedTopicIdRef.current = currentPrompt.id;
    recordWritingTopic(resolvePracticeLevel(profile.targetLevel), currentPrompt.id);
  }, [profile, currentPrompt, recordWritingTopic]);

  const wordCount = useMemo(
    () => text.trim().split(/\s+/).filter(Boolean).length,
    [text]
  );

  // Re-fetch in the newly selected language if the learner switches it
  // mid-review — the evaluation can come from a real Claude call (already
  // localized server-side, no client-side re-localization available) or
  // the mock, so both paths just re-request rather than assuming a
  // language-neutral selection is available to re-render locally.
  useEffect(() => {
    if (prevLanguageRef.current === uiLanguage) return;
    prevLanguageRef.current = uiLanguage;
    const lastRequest = lastRequestRef.current;
    if (!lastRequest) return;
    void (async () => {
      try {
        const res = await fetch("/api/writing/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...lastRequest, language: uiLanguage }),
        });
        const data = await res.json();
        if (res.ok) setEvaluation(data.evaluation as WritingEvaluation);
      } catch {
        // Keep showing the previous-language evaluation rather than erroring out.
      }
    })();
  }, [uiLanguage]);

  if (!profile || !currentPrompt) return null;
  const level = resolvePracticeLevel(profile.targetLevel);
  const levelConfig = DELF_WRITING_LEVELS[level];
  const wordCountInRange =
    wordCount >= levelConfig.minWords && wordCount <= levelConfig.maxWords;

  function startNewTopic() {
    if (!profile) return;
    const history = profile.writingTopicHistory?.[level] ?? [];
    const prompt = pickNextWritingPrompt(level, history);
    recordedTopicIdRef.current = prompt.id;
    setCurrentPrompt(prompt);
    recordWritingTopic(level, prompt.id);
    setText("");
    setEvaluation(null);
    setError(null);
  }

  async function handleSubmit() {
    const prompt = currentPrompt;
    if (!prompt) return;
    setIsSubmitting(true);
    setError(null);
    setEvaluation(null);
    const requestBody = {
      level,
      prompt: prompt.instructions,
      response: text,
    };
    lastRequestRef.current = requestBody;
    try {
      const res = await fetch("/api/writing/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...requestBody, language: uiLanguage }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t.writing.evaluationFailed);
      }
      const nextEvaluation = data.evaluation as WritingEvaluation;
      setEvaluation(nextEvaluation);
      const { estimatedScore, scoreOutOf } = nextEvaluation.examReadiness;
      recordActivity("writing", Math.round((estimatedScore / scoreOutOf) * 100));
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.somethingWentWrong);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t.writing.pageTitle}
        description={t.writing.pageDescription}
      />

      {/* Prompt */}
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary">
                <PenLine className="h-3.5 w-3.5" />
                {currentPrompt.delfExercise}
              </Badge>
              <Badge variant="neutral">{levelConfig.taskType[uiLanguage]}</Badge>
              <Badge variant="neutral">
                {levelConfig.minWords}–{levelConfig.maxWords} {t.writing.wordsUnit}
              </Badge>
            </div>
            <CardTitle className="mt-1">{currentPrompt.title}</CardTitle>
            <CardDescription>{currentPrompt.instructions}</CardDescription>
          </div>
          <Button variant="secondary" onClick={startNewTopic} disabled={isSubmitting}>
            {t.writing.newTopic}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1.5 rounded-2xl bg-background p-4">
            <span className="text-xs font-medium text-muted">{t.writing.expectedStructure}</span>
            <ul className="flex flex-col gap-1 text-sm text-foreground">
              {levelConfig.expectedStructure[uiLanguage].map((s) => (
                <li key={s} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-400" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Editor */}
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4">
          <CardTitle>{t.writing.yourResponse}</CardTitle>
          <span className="text-xs text-muted">{t.writing.aiFeedbackLabel}</span>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <textarea
            rows={12}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.writing.responsePlaceholder}
            className="w-full resize-none rounded-2xl border border-border bg-surface px-4 py-3 text-sm leading-6 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
          />
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "text-xs font-medium",
                wordCountInRange ? "text-success-600" : "text-warning-600"
              )}
            >
              {wordCount} / {levelConfig.minWords}–{levelConfig.maxWords} {t.writing.wordsUnit}
            </span>
            <Button onClick={handleSubmit} disabled={!text.trim() || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.writing.evaluating}
                </>
              ) : (
                t.writing.submitForEvaluation
              )}
            </Button>
          </div>
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {evaluation ? (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-[18px] w-[18px] text-primary-500" />
                <CardTitle>{t.writing.taskCompletion}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-3">
                <StatusPill
                  ok={evaluation.taskCompletion.addressedPrompt}
                  label={t.writing.addressedPrompt}
                />
                <StatusPill
                  ok={evaluation.taskCompletion.respectedFormat}
                  label={t.writing.respectedFormat}
                />
              </div>
              <p className="text-sm text-muted">{evaluation.taskCompletion.notes}</p>
              {evaluation.taskCompletion.missingElements.length > 0 && (
                <div className="flex flex-col gap-1.5 rounded-xl bg-background p-3">
                  <span className="text-xs font-medium text-muted">{t.writing.missingElements}</span>
                  <ul className="flex flex-col gap-1 text-sm text-foreground">
                    {evaluation.taskCompletion.missingElements.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-[18px] w-[18px] text-primary-500" />
                <CardTitle>{t.writing.relevance}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-3">
                <StatusPill ok={evaluation.relevance.isRelevant} label={t.writing.relevance} />
              </div>
              <p className="text-sm text-muted">{evaluation.relevance.notes}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <LayoutList className="h-[18px] w-[18px] text-primary-500" />
                <CardTitle>{t.writing.structure}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-3">
                <StatusPill ok={evaluation.structure.hasIntroduction} label={t.writing.introduction} />
                <StatusPill ok={evaluation.structure.hasMainIdeas} label={t.writing.mainIdeas} />
                <StatusPill
                  ok={
                    !evaluation.structure.conclusionRequired ||
                    evaluation.structure.hasConclusion
                  }
                  label={
                    evaluation.structure.conclusionRequired
                      ? t.writing.conclusion
                      : t.writing.conclusionNotRequired
                  }
                />
              </div>
              <p className="text-sm text-muted">{evaluation.structure.paragraphOrganization}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <LayoutList className="h-[18px] w-[18px] text-primary-500" />
                <CardTitle>{t.writing.coherence}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-3">
                <StatusPill ok={evaluation.coherence.isCoherent} label={t.writing.coherence} />
              </div>
              <p className="text-sm text-muted">{evaluation.coherence.notes}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <SpellCheck className="h-[18px] w-[18px] text-primary-500" />
                <CardTitle>{t.writing.languageAccuracy}</CardTitle>
              </div>
              <CardDescription>{evaluation.languageAccuracy.summary}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {evaluation.languageAccuracy.errors.length === 0 ? (
                <p className="text-sm text-muted">{t.writing.noGrammarMistakes}</p>
              ) : (
                evaluation.languageAccuracy.errors.map((err, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-1.5 rounded-xl border border-border bg-background p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="danger">
                        {GRAMMAR_CATEGORY_LABELS[err.category][uiLanguage]}
                      </Badge>
                      <span className="text-sm text-foreground line-through decoration-danger-500">
                        {err.original}
                      </span>
                      <span className="text-sm font-medium text-success-600">
                        {err.correction}
                      </span>
                    </div>
                    <p className="text-xs text-muted">{err.explanation}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpenText className="h-[18px] w-[18px] text-primary-500" />
                <CardTitle>{t.writing.vocabularyTitle}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <VocabItem label={t.writing.wordChoice} value={evaluation.vocabulary.wordChoice} />
              <VocabItem label={t.writing.variety} value={evaluation.vocabulary.variety} />
              <VocabItem
                label={t.writing.levelAppropriateness}
                value={evaluation.vocabulary.levelAppropriateness}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="h-[18px] w-[18px] text-warning-600" />
                <CardTitle>{t.writing.examReadiness}</CardTitle>
              </div>
              <CardDescription>
                {t.writing.examReadinessDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-3xl font-semibold text-foreground">
                    {evaluation.examReadiness.estimatedScore}
                  </span>
                  <span className="text-sm text-muted">
                    / {evaluation.examReadiness.scoreOutOf}
                  </span>
                </div>
                <p className="text-sm text-muted">{evaluation.examReadiness.scoreExplanation}</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FeedbackList
                  title={t.writing.strengths}
                  items={evaluation.examReadiness.strengths}
                  tone="success"
                  noneNoted={t.writing.noneNoted}
                />
                <FeedbackList
                  title={t.writing.weaknesses}
                  items={evaluation.examReadiness.weaknesses}
                  tone="danger"
                  noneNoted={t.writing.noneNoted}
                />
                <FeedbackList
                  title={t.writing.improvementTips}
                  items={evaluation.examReadiness.improvementTips}
                  tone="primary"
                  noneNoted={t.writing.noneNoted}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <PenLine className="h-[18px] w-[18px] text-primary-500" />
                <CardTitle>{t.writing.improvedVersion}</CardTitle>
              </div>
              <CardDescription>{t.writing.improvedVersionDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line rounded-2xl bg-background p-4 text-sm leading-6 text-foreground">
                {evaluation.improvedVersion}
              </p>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="border-dashed">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-[18px] w-[18px] text-primary-500" />
              <CardTitle>{t.writing.aiEvaluationTitle}</CardTitle>
            </div>
            <CardDescription>
              {t.writing.aiEvaluationDescription}
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
        ok ? "bg-success-50 text-success-600" : "bg-danger-50 text-danger-600"
      )}
    >
      {ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
}

function VocabItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl bg-background p-4">
      <span className="text-xs font-medium text-muted">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}

function FeedbackList({
  title,
  items,
  tone,
  noneNoted,
}: {
  title: string;
  items: string[];
  tone: "success" | "danger" | "primary";
  noneNoted: string;
}) {
  const toneClass = {
    success: "text-success-600",
    danger: "text-danger-600",
    primary: "text-primary-600",
  }[tone];
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-background p-4">
      <span className={cn("text-xs font-semibold", toneClass)}>{title}</span>
      {items.length === 0 ? (
        <span className="text-xs text-muted">{noneNoted}</span>
      ) : (
        <ul className="flex flex-col gap-1.5 text-xs text-foreground">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-current opacity-60" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
