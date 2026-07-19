"use client";

import { useMemo, useState } from "react";
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
import {
  localizeEvaluation,
  type EvaluationSelection,
} from "@/lib/mock/writing-evaluation";
import type {
  FeedbackLanguage,
  GrammarError,
  WritingEvaluation,
} from "@/types/writing-evaluation";
import { cn } from "@/lib/utils/cn";
import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { resolvePracticeLevel } from "@/lib/utils/level";

const FEEDBACK_LANGUAGES: FeedbackLanguage[] = ["en", "ru", "kz"];
const LANGUAGE_LABELS: Record<FeedbackLanguage, string> = {
  en: "EN",
  ru: "RU",
  kz: "KZ",
};

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
  const { profile, recordActivity } = useUserProfile();
  const [language, setLanguage] = useState<FeedbackLanguage>("en");
  const [text, setText] = useState("");
  const [evaluation, setEvaluation] = useState<WritingEvaluation | null>(null);
  const [selection, setSelection] = useState<EvaluationSelection | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wordCount = useMemo(
    () => text.trim().split(/\s+/).filter(Boolean).length,
    [text]
  );

  if (!profile) return null;
  const level = resolvePracticeLevel(profile.targetLevel);
  const levelConfig = DELF_WRITING_LEVELS[level];
  const wordCountInRange =
    wordCount >= levelConfig.minWords && wordCount <= levelConfig.maxWords;

  function handleLanguageChange(next: FeedbackLanguage) {
    if (next === language) return;
    setLanguage(next);
    // Re-localize instantly on the client — no request, no loading state.
    // The underlying analysis (errors picked, score, structure flags)
    // stays exactly the same; only the feedback text changes language.
    if (selection) {
      const localized = localizeEvaluation(selection, next);
      setEvaluation({ level: selection.level, wordCount: selection.wordCount, ...localized });
    }
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);
    setEvaluation(null);
    setSelection(null);
    try {
      const res = await fetch("/api/writing/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level,
          prompt: levelConfig.samplePrompt.instructions,
          response: text,
          language,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Evaluation failed");
      }
      const nextEvaluation = data.evaluation as WritingEvaluation;
      setEvaluation(nextEvaluation);
      setSelection(data.selection as EvaluationSelection);
      const { estimatedScore, scoreOutOf } = nextEvaluation.examReadiness;
      recordActivity("writing", Math.round((estimatedScore / scoreOutOf) * 100));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Writing Practice"
        description="Draft a response to an exam-style prompt for your level and get AI feedback structured like official DELF scoring."
      />

      {/* Prompt */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary">
              <PenLine className="h-3.5 w-3.5" />
              {levelConfig.samplePrompt.delfExercise}
            </Badge>
            <Badge variant="neutral">{levelConfig.taskType}</Badge>
            <Badge variant="neutral">
              {levelConfig.minWords}–{levelConfig.maxWords} words
            </Badge>
          </div>
          <CardTitle className="mt-1">{levelConfig.samplePrompt.title}</CardTitle>
          <CardDescription>{levelConfig.samplePrompt.instructions}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1.5 rounded-2xl bg-background p-4">
            <span className="text-xs font-medium text-muted">Expected structure</span>
            <ul className="flex flex-col gap-1 text-sm text-foreground">
              {levelConfig.expectedStructure.map((s) => (
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
          <CardTitle>1. Your response</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">AI feedback:</span>
            <div className="flex items-center gap-1 rounded-full border border-border bg-background p-1">
              {FEEDBACK_LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => handleLanguageChange(lang)}
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
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <textarea
            rows={12}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Écrivez votre réponse ici..."
            className="w-full resize-none rounded-2xl border border-border bg-surface px-4 py-3 text-sm leading-6 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
          />
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "text-xs font-medium",
                wordCountInRange ? "text-success-600" : "text-warning-600"
              )}
            >
              {wordCount} / {levelConfig.minWords}–{levelConfig.maxWords} words
            </span>
            <Button onClick={handleSubmit} disabled={!text.trim() || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Evaluating...
                </>
              ) : (
                "Submit for Evaluation"
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
                <CardTitle>Task Completion</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-3">
                <StatusPill
                  ok={evaluation.taskCompletion.addressedPrompt}
                  label="Addressed the prompt"
                />
                <StatusPill
                  ok={evaluation.taskCompletion.respectedFormat}
                  label="Respected the format"
                />
              </div>
              <p className="text-sm text-muted">{evaluation.taskCompletion.notes}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <LayoutList className="h-[18px] w-[18px] text-primary-500" />
                <CardTitle>Structure</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-3">
                <StatusPill ok={evaluation.structure.hasIntroduction} label="Introduction" />
                <StatusPill ok={evaluation.structure.hasMainIdeas} label="Main ideas" />
                <StatusPill
                  ok={
                    !evaluation.structure.conclusionRequired ||
                    evaluation.structure.hasConclusion
                  }
                  label={
                    evaluation.structure.conclusionRequired
                      ? "Conclusion"
                      : "Conclusion (not required)"
                  }
                />
              </div>
              <p className="text-sm text-muted">{evaluation.structure.paragraphOrganization}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <SpellCheck className="h-[18px] w-[18px] text-primary-500" />
                <CardTitle>Language Accuracy</CardTitle>
              </div>
              <CardDescription>{evaluation.languageAccuracy.summary}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {evaluation.languageAccuracy.errors.length === 0 ? (
                <p className="text-sm text-muted">No grammar mistakes found.</p>
              ) : (
                evaluation.languageAccuracy.errors.map((err, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-1.5 rounded-xl border border-border bg-background p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="danger">
                        {GRAMMAR_CATEGORY_LABELS[err.category][language]}
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
                <CardTitle>Vocabulary</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <VocabItem label="Word choice" value={evaluation.vocabulary.wordChoice} />
              <VocabItem label="Variety" value={evaluation.vocabulary.variety} />
              <VocabItem
                label="Level appropriateness"
                value={evaluation.vocabulary.levelAppropriateness}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="h-[18px] w-[18px] text-warning-600" />
                <CardTitle>Exam Readiness</CardTitle>
              </div>
              <CardDescription>
                Estimated DELF Production Écrite score for this response.
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
                  title="Strengths"
                  items={evaluation.examReadiness.strengths}
                  tone="success"
                />
                <FeedbackList
                  title="Weaknesses"
                  items={evaluation.examReadiness.weaknesses}
                  tone="danger"
                />
                <FeedbackList
                  title="Improvement tips"
                  items={evaluation.examReadiness.improvementTips}
                  tone="primary"
                />
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="border-dashed">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-[18px] w-[18px] text-primary-500" />
              <CardTitle>AI Evaluation</CardTitle>
            </div>
            <CardDescription>
              Submit your response to get feedback on task completion, structure,
              language accuracy, vocabulary, and estimated DELF score.
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
}: {
  title: string;
  items: string[];
  tone: "success" | "danger" | "primary";
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
        <span className="text-xs text-muted">None noted.</span>
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
