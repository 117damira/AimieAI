"use client";

import { CheckCircle2, XCircle, Sparkles, Volume2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { speak, EXAM_SPEECH_LOCALE } from "@/lib/utils/voice";
import type { TurnFeedback } from "@/types/speaking-evaluation";

export function SpeakingTurnFeedback({
  feedback,
  onContinue,
  continueLabel,
  showPronunciationWords,
}: {
  feedback: TurnFeedback;
  onContinue: () => void;
  continueLabel: string;
  showPronunciationWords: boolean;
}) {
  const { t } = useLanguage();
  const f = t.speaking.feedback;

  function handlePlayWord(word: string) {
    void speak(word, EXAM_SPEECH_LOCALE);
  }

  return (
    <Card className="border-dashed">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-[18px] w-[18px] text-primary-500" />
          <CardTitle>{t.speaking.examinerFeedback}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium",
            feedback.relevance ? "bg-success-50 text-success-600" : "bg-danger-50 text-danger-600"
          )}
        >
          {feedback.relevance ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0" />
          )}
          {feedback.relevance ? t.speaking.answeredQuestion : t.speaking.needsMoreDevelopment}
        </div>

        <FeedbackRow label={f.taskCompletionLabel} value={feedback.taskCompletionNote} />
        <FeedbackRow label={f.coherenceLabel} value={feedback.coherenceNote} />

        {feedback.grammarErrors.length > 0 ? (
          <div className="flex flex-col gap-3">
            {feedback.grammarErrors.map((err, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 rounded-xl border border-border bg-background p-4"
              >
                <HighlightedMistakeSentence sentence={err.sentence} original={err.original} correction={err.correction} />
                <MistakeDetail label={f.whyWrong} value={err.whyWrong} />
                <MistakeDetail label={f.howToFix} value={err.howToFix} />
                <MistakeDetail label={f.betterExample} value={err.betterExample} emphasize />
                <MistakeDetail label={f.howToAvoid} value={err.howToAvoid} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-success-600">{f.noGrammarMistakes}</p>
        )}

        <FeedbackRow label={f.vocabularyLabel} value={feedback.vocabularyNote} />
        <FeedbackRow label={f.sentenceVarietyLabel} value={feedback.sentenceVarietyNote} />
        <FeedbackRow label={f.fluencyLabel} value={feedback.fluencyNote} />
        <FeedbackRow label={f.pronunciationLabel} value={feedback.pronunciationNote} />

        {showPronunciationWords && feedback.mispronuncedWords.length > 0 && (
          <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-background p-4">
            <span className="text-xs font-medium text-foreground">{f.mispronuncedWordsTitle}</span>
            {feedback.mispronuncedWords.map((mw, i) => (
              <div key={i} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePlayWord(mw.word)}
                  aria-label={f.playPronunciation}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 transition-colors duration-200 hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                </button>
                <p className="text-xs text-muted">
                  <span className="font-medium text-foreground">{mw.word}</span> — {mw.note}
                </p>
              </div>
            ))}
          </div>
        )}

        <FeedbackRow label={f.naturalnessLabel} value={feedback.naturalnessNote} />
        <FeedbackRow label={f.answerStructureLabel} value={feedback.structureNote} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FeedbackList title={f.strengthsTitle} items={feedback.strengths} tone="success" />
          <FeedbackList title={f.areasForImprovementTitle} items={feedback.areasForImprovement} tone="danger" />
          <FeedbackList title={f.suggestionsTitle} items={feedback.suggestions} tone="primary" />
        </div>

        <div className="flex flex-col gap-1.5 rounded-xl bg-primary-50 p-4">
          <span className="text-xs font-semibold text-primary-700">{f.improvedAnswerTitle}</span>
          <p className="text-sm italic leading-6 text-foreground">&ldquo;{feedback.improvedAnswer}&rdquo;</p>
        </div>

        <div className="flex flex-col gap-1.5 rounded-xl bg-warning-50 p-4">
          <span className="text-xs font-semibold text-warning-600">{f.coachingTipTitle}</span>
          <p className="text-sm leading-6 text-foreground">{feedback.coachingTip}</p>
        </div>

        <p className="rounded-xl bg-background px-3.5 py-2.5 text-sm font-medium text-foreground">
          {feedback.encouragement}
        </p>

        <div className="flex justify-end">
          <Button onClick={onContinue}>{continueLabel}</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function FeedbackRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm text-muted">
      <span className="font-medium text-foreground">{label}: </span>
      {value}
    </p>
  );
}

/** Shows the mistake highlighted inside its real sentence (not as an
 * isolated phrase), followed by the corrected full sentence — falls back to
 * the old isolated-phrase display if `original` can't be located inside
 * `sentence` for any reason. */
function HighlightedMistakeSentence({
  sentence,
  original,
  correction,
}: {
  sentence: string;
  original: string;
  correction: string;
}) {
  const index = sentence.indexOf(original);
  if (index === -1) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-foreground line-through decoration-danger-500">{original}</span>
        <span className="font-medium text-success-600">{correction}</span>
      </div>
    );
  }
  const before = sentence.slice(0, index);
  const after = sentence.slice(index + original.length);
  const correctedSentence = `${before}${correction}${after}`;
  return (
    <div className="flex flex-col gap-1 text-sm">
      <p className="text-foreground">
        {before}
        <span className="font-medium text-danger-600 line-through decoration-danger-500">{original}</span>
        {after}
      </p>
      <p className="text-success-600">
        <span className="font-medium">→</span> {correctedSentence}
      </p>
    </div>
  );
}

function MistakeDetail({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <p className="text-xs text-muted">
      <span className="font-medium text-foreground">{label}: </span>
      <span className={cn(emphasize && "text-success-600")}>{value}</span>
    </p>
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
  if (items.length === 0) return null;
  const toneClass = {
    success: "text-success-600",
    danger: "text-danger-600",
    primary: "text-primary-600",
  }[tone];
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-background p-4">
      <span className={cn("text-xs font-semibold", toneClass)}>{title}</span>
      <ul className="flex flex-col gap-1.5 text-xs text-foreground">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-1.5">
            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-current opacity-60" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
