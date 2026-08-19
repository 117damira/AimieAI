"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
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
  BarChart3,
  ShieldCheck,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  ProgressBar,
} from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { TOPIK_TASK_TYPE_LABELS, TOPIK_TASK_TYPE_STRUCTURE } from "@/config/topik-writing";
import type {
  FeedbackLanguage,
  GrammarError,
  TopikWritingEvaluation,
  TopikWritingLevel,
  TopikWritingPrompt,
} from "@/types/topik-writing";
import type { TopikLevel } from "@/types/topik";
import { cn } from "@/lib/utils/cn";
import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { pickNextTopikWritingPrompt } from "@/lib/topik/writing-rotation";

/** TOPIK Writing only exists for TOPIK II (Levels 3-6) — the caller of this
 * component already guarantees profile.topikTrack === "II" before
 * rendering it, but topikLevel itself can still be null (not chosen yet)
 * or, defensively, outside 3-6. Falls back to Level 3, the entry point of
 * TOPIK II, exactly like defaultLevelForTrack("II") in
 * lib/utils/topikLevel.ts. */
function resolveWritingLevel(topikLevel: TopikLevel | null): TopikWritingLevel {
  if (topikLevel === "3" || topikLevel === "4" || topikLevel === "5" || topikLevel === "6") return topikLevel;
  return "3";
}

const CHARACTERS_UNIT: Record<FeedbackLanguage, string> = {
  en: "characters",
  ru: "символов",
  kz: "таңба",
};

const DATA_LABEL: Record<FeedbackLanguage, string> = {
  en: "Data to describe",
  ru: "Данные для описания",
  kz: "Сипаттайтын деректер",
};

const ORGANIZATION_LABELS: Record<"wellOrganized" | "matchesStructure", Record<FeedbackLanguage, string>> = {
  wellOrganized: {
    en: "Well organized",
    ru: "Хорошо структурирован",
    kz: "Жақсы құрылымдалған",
  },
  matchesStructure: {
    en: "Matches expected structure",
    ru: "Соответствует ожидаемой структуре",
    kz: "Күтілетін құрылымға сай",
  },
};

const REGISTER_COPY = {
  title: { en: "Register", ru: "Регистр", kz: "Регистр" } as Record<FeedbackLanguage, string>,
  label: {
    en: "Formal register (격식체)",
    ru: "Формальный регистр (격식체)",
    kz: "Ресми регистр (격식체)",
  } as Record<FeedbackLanguage, string>,
};

const ACCURACY_COPY = {
  title: { en: "Accuracy", ru: "Точность", kz: "Дәлдік" } as Record<FeedbackLanguage, string>,
  label: {
    en: "Accurately reflects the task/data",
    ru: "Точно отражает задание/данные",
    kz: "Тапсырма/деректерді дәл көрсетеді",
  } as Record<FeedbackLanguage, string>,
};

const POINTS_UNIT: Record<FeedbackLanguage, string> = {
  en: "points",
  ru: "баллов",
  kz: "балл",
};

const FULL_SCALE_NOTE = (taskPoints: number, taskMaxPoints: number, scoreOutOf: number): Record<FeedbackLanguage, string> => ({
  en: `This task is worth ${taskMaxPoints} of the ${scoreOutOf} points on the full TOPIK II Writing exam.`,
  ru: `Это задание оценивается в ${taskMaxPoints} из ${scoreOutOf} баллов на письменной части экзамена TOPIK II.`,
  kz: `Бұл тапсырма TOPIK II жазбаша емтиханының ${scoreOutOf} баллынан ${taskMaxPoints} баллын құрайды.`,
});

const GRAMMAR_CATEGORY_LABELS: Record<GrammarError["category"], Record<FeedbackLanguage, string>> = {
  particle: { en: "particle", ru: "частица/падеж", kz: "жалғау" },
  conjugation: { en: "conjugation", ru: "спряжение", kz: "жіктелу" },
  formality: { en: "formality", ru: "регистр", kz: "регистр" },
  spacing: { en: "spacing", ru: "написание с пробелами", kz: "бос орын" },
  "sentence-structure": {
    en: "sentence structure",
    ru: "структура предложения",
    kz: "сөйлем құрылымы",
  },
  other: { en: "other", ru: "другое", kz: "басқа" },
};

export function TopikWritingPage() {
  const { profile, recordTopikActivity, recordTopikWritingTopic } = useUserProfile();
  const { t, language: uiLanguage } = useLanguage();
  const [text, setText] = useState("");
  const [evaluation, setEvaluation] = useState<TopikWritingEvaluation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<TopikWritingPrompt | null>(null);
  const [pickedForProfileId, setPickedForProfileId] = useState<string | null>(null);
  const recordedTopicIdRef = useRef<string | null>(null);
  const lastRequestRef = useRef<{
    level: TopikWritingLevel;
    taskType: TopikWritingPrompt["taskType"];
    prompt: string;
    dataText: string | null;
    response: string;
  } | null>(null);
  const prevLanguageRef = useRef(uiLanguage);
  const shouldReduceMotion = useReducedMotion();

  // Picks a rotated topic as soon as the profile becomes available. Setting
  // state directly in the render body (React's documented pattern for
  // "adjusting state when a prop/derived value changes") rather than in a
  // useEffect, so the pick is ready on the same render it becomes possible —
  // guarded so it only fires once per profile, not on every render.
  if (profile && pickedForProfileId !== profile.id) {
    const level = resolveWritingLevel(profile.topikLevel);
    const history = profile.topikWritingTopicHistory?.[level] ?? [];
    setCurrentPrompt(pickNextTopikWritingPrompt(level, history));
    setPickedForProfileId(profile.id);
  }

  // Persists the pick into the user's topic history — an external side
  // effect (mutates profile via context), so it belongs in an effect, not
  // the render body above. Guarded so each pick is only recorded once.
  useEffect(() => {
    if (!profile || !currentPrompt) return;
    if (recordedTopicIdRef.current === currentPrompt.id) return;
    recordedTopicIdRef.current = currentPrompt.id;
    recordTopikWritingTopic(resolveWritingLevel(profile.topikLevel), currentPrompt.id);
  }, [profile, currentPrompt, recordTopikWritingTopic]);

  const charCount = useMemo(() => text.trim().length, [text]);

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
        const res = await fetch("/api/topik/writing/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...lastRequest, language: uiLanguage }),
        });
        const data = await res.json();
        if (res.ok) setEvaluation(data.evaluation as TopikWritingEvaluation);
      } catch {
        // Keep showing the previous-language evaluation rather than erroring out.
      }
    })();
  }, [uiLanguage]);

  if (!profile || !currentPrompt) return null;
  const level = resolveWritingLevel(profile.topikLevel);
  const taskTypeLabel = TOPIK_TASK_TYPE_LABELS[currentPrompt.taskType][uiLanguage];
  const expectedStructure = TOPIK_TASK_TYPE_STRUCTURE[currentPrompt.taskType][uiLanguage];
  const charCountInRange = charCount >= currentPrompt.minChars && charCount <= currentPrompt.maxChars;

  function startNewTopic() {
    if (!profile) return;
    const history = profile.topikWritingTopicHistory?.[level] ?? [];
    const prompt = pickNextTopikWritingPrompt(level, history);
    recordedTopicIdRef.current = prompt.id;
    setCurrentPrompt(prompt);
    recordTopikWritingTopic(level, prompt.id);
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
      taskType: prompt.taskType,
      prompt: prompt.instructions,
      dataText: prompt.dataText,
      response: text,
    };
    lastRequestRef.current = requestBody;
    try {
      const res = await fetch("/api/topik/writing/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...requestBody, language: uiLanguage }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t.writing.evaluationFailed);
      }
      const nextEvaluation = data.evaluation as TopikWritingEvaluation;
      setEvaluation(nextEvaluation);
      const { estimatedScore, scoreOutOf } = nextEvaluation.examReadiness;
      recordTopikActivity("writing", Math.round((estimatedScore / scoreOutOf) * 100));
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.somethingWentWrong);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t.writing.pageTitle} description={t.topik.writing.pageDescription} />

      {/* Prompt */}
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary">
                <PenLine className="h-3.5 w-3.5" />
                {currentPrompt.topikTask}
              </Badge>
              <Badge variant="neutral">{taskTypeLabel}</Badge>
              <Badge variant="neutral">
                {currentPrompt.minChars}–{currentPrompt.maxChars} {CHARACTERS_UNIT[uiLanguage]}
              </Badge>
            </div>
            <CardTitle className="mt-1">{currentPrompt.title}</CardTitle>
            <CardDescription className="whitespace-pre-line">{currentPrompt.instructions}</CardDescription>
          </div>
          <Button variant="secondary" onClick={startNewTopic} disabled={isSubmitting}>
            {t.writing.newTopic}
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {currentPrompt.dataText && (
            <div className="flex flex-col gap-1.5 rounded-2xl bg-background p-4">
              <span className="text-xs font-medium text-muted">{DATA_LABEL[uiLanguage]}</span>
              <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-foreground">
                {currentPrompt.dataText}
              </pre>
            </div>
          )}
          <div className="flex flex-col gap-1.5 rounded-2xl bg-background p-4">
            <span className="text-xs font-medium text-muted">{t.writing.expectedStructure}</span>
            <ul className="flex flex-col gap-1 text-sm text-foreground">
              {expectedStructure.map((s) => (
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
            className="w-full resize-none rounded-2xl border border-border bg-surface px-5 py-4 text-[15px] leading-7 text-foreground placeholder:text-muted transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400"
          />
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "text-xs font-medium",
                charCountInRange ? "text-success-600" : "text-warning-600"
              )}
            >
              {charCount} / {currentPrompt.minChars}–{currentPrompt.maxChars} {CHARACTERS_UNIT[uiLanguage]}
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
        <motion.div
          className="flex flex-col gap-6"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
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
                  ok={evaluation.taskCompletion.addressedTask}
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
                <LayoutList className="h-[18px] w-[18px] text-primary-500" />
                <CardTitle>{t.writing.structure}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-3">
                <StatusPill
                  ok={evaluation.organization.isWellOrganized}
                  label={ORGANIZATION_LABELS.wellOrganized[uiLanguage]}
                />
                <StatusPill
                  ok={evaluation.organization.matchesExpectedStructure}
                  label={ORGANIZATION_LABELS.matchesStructure[uiLanguage]}
                />
              </div>
              <p className="text-sm text-muted">{evaluation.organization.notes}</p>
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
                <ShieldCheck className="h-[18px] w-[18px] text-primary-500" />
                <CardTitle>{REGISTER_COPY.title[uiLanguage]}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-3">
                <StatusPill ok={evaluation.register.isAppropriate} label={REGISTER_COPY.label[uiLanguage]} />
              </div>
              <p className="text-sm text-muted">{evaluation.register.notes}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-[18px] w-[18px] text-primary-500" />
                <CardTitle>{ACCURACY_COPY.title[uiLanguage]}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-3">
                <StatusPill ok={evaluation.accuracy.isAccurate} label={ACCURACY_COPY.label[uiLanguage]} />
              </div>
              <p className="text-sm text-muted">{evaluation.accuracy.notes}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <SpellCheck className="h-[18px] w-[18px] text-primary-500" />
                <CardTitle>{t.writing.languageAccuracy}</CardTitle>
              </div>
              <CardDescription>{evaluation.grammar.summary}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {evaluation.grammar.errors.length === 0 ? (
                <p className="text-sm text-muted">{t.writing.noGrammarMistakes}</p>
              ) : (
                evaluation.grammar.errors.map((err, i) => (
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
              <CardDescription>{t.topik.writing.examReadinessDescription}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <div className="flex items-baseline gap-2">
                  <span
                    className={cn(
                      "font-display text-4xl font-bold tabular-nums",
                      scoreToneClass(evaluation.examReadiness.taskPoints, evaluation.examReadiness.taskMaxPoints)
                    )}
                  >
                    {evaluation.examReadiness.taskPoints}
                  </span>
                  <span className="text-sm text-muted">
                    / {evaluation.examReadiness.taskMaxPoints} {POINTS_UNIT[uiLanguage]}
                  </span>
                </div>
                <ProgressBar
                  value={evaluation.examReadiness.taskPoints}
                  max={evaluation.examReadiness.taskMaxPoints}
                  colorClassName={scoreToneBarClass(evaluation.examReadiness.taskPoints, evaluation.examReadiness.taskMaxPoints)}
                />
                <p className="text-xs text-muted">
                  {FULL_SCALE_NOTE(
                    evaluation.examReadiness.taskPoints,
                    evaluation.examReadiness.taskMaxPoints,
                    evaluation.examReadiness.scoreOutOf
                  )[uiLanguage]}
                </p>
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
        </motion.div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50">
              <Sparkles className="h-5 w-5 text-primary-500" />
            </span>
            <div className="flex flex-col gap-1">
              <CardTitle>{t.writing.aiEvaluationTitle}</CardTitle>
              <CardDescription>{t.topik.writing.aiEvaluationDescription}</CardDescription>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function scoreToneClass(score: number, outOf: number): string {
  const ratio = outOf > 0 ? score / outOf : 0;
  if (ratio >= 0.8) return "text-success-600";
  if (ratio >= 0.6) return "text-warning-600";
  return "text-danger-600";
}

function scoreToneBarClass(score: number, outOf: number): string {
  const ratio = outOf > 0 ? score / outOf : 0;
  if (ratio >= 0.8) return "bg-success-500";
  if (ratio >= 0.6) return "bg-warning-500";
  return "bg-danger-500";
}

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors duration-200",
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
