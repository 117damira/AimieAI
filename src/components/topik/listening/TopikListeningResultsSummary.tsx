"use client";

import { Award, Clock, Target, TrendingUp, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from "@/components/ui";
import { formatTime } from "@/lib/utils/ttsPlayer";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { TOPIK_LISTENING_SKILL_LABELS } from "@/lib/topik/listening-feedback";
import type { TopikListeningFeedback, TopikListeningResult } from "@/types/topik-listening";

/** Mirrors components/listening/ListeningResultsSummary.tsx's
 * ListeningResultsSummary — every label reused verbatim from
 * t.listening.results since none of them mention DELF. */
export function TopikListeningResultsSummary({ result }: { result: TopikListeningResult }) {
  const { t } = useLanguage();
  const r = t.listening.results;
  const isOfficialExam = result.mode === "full-exam";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Award className="h-[18px] w-[18px] text-warning-600" />
          <CardTitle>{r.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div
          className={`flex flex-wrap items-end justify-between gap-4 rounded-2xl p-4 ${
            result.passed ? "bg-success-50" : isOfficialExam ? "bg-danger-50" : "bg-warning-50"
          }`}
        >
          <div className="flex flex-col gap-1">
            <span className="font-display text-4xl font-semibold text-foreground">
              {result.score}
              <span className="ml-1 text-base font-normal text-muted">/ {result.scoreOutOf}</span>
            </span>
            <span className="text-sm text-muted">{isOfficialExam ? r.scoreLabel : r.practiceScoreLabel}</span>
          </div>
          {isOfficialExam ? (
            <Badge variant={result.passed ? "success" : "danger"}>{result.passed ? r.pass : r.needsImprovement}</Badge>
          ) : (
            <Badge variant={result.passed ? "success" : "warning"}>
              {result.passed ? r.practiceGood : r.practiceNeedsWork}
            </Badge>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat icon={TrendingUp} label={r.percentageLabel} value={`${result.percentage}%`} />
          <Stat icon={Target} label={r.accuracyLabel} value={`${Math.round(result.accuracy * 100)}%`} />
          <Stat icon={Clock} label={r.timeSpentLabel} value={formatTime(result.timeSpentSeconds)} />
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-background p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <div className="flex flex-col">
        <span className="font-display text-lg font-semibold text-foreground">{value}</span>
        <span className="text-xs text-muted">{label}</span>
      </div>
    </div>
  );
}

/** Mirrors components/listening/ListeningResultsSummary.tsx's
 * ListeningFeedbackCard. TOPIK has 7 skill tags (vs. DELF's 6), which don't
 * line up with translations.ts's fixed DELF-shaped per-skill labels
 * (understandingNumbers/understandingNames/understandingDates/
 * vocabularyComprehension don't correspond to TOPIK's speakerIntention/
 * statementMatch/numberDateLocation/relationship/inference) — so per-skill
 * row labels come from TOPIK_LISTENING_SKILL_LABELS
 * (lib/topik/listening-feedback.ts) instead. Every other label (title,
 * overallPerformance, strongestSkills, weakestSkills, listeningAccuracy,
 * recommendations, noneNoted) reuses t.listening.feedback verbatim since
 * those never mention DELF. The readiness label uses
 * t.topik.listening.estimatedReadiness instead of
 * t.listening.feedback.estimatedDelfReadiness, which literally says "DELF". */
export function TopikListeningFeedbackCard({ feedback }: { feedback: TopikListeningFeedback }) {
  const { t, language } = useLanguage();
  const f = t.listening.feedback;

  const rows: { label: string; value: string }[] = [
    { label: f.listeningAccuracy, value: feedback.listeningAccuracy },
    { label: TOPIK_LISTENING_SKILL_LABELS.mainIdea[language], value: feedback.understandingMainIdea },
    { label: TOPIK_LISTENING_SKILL_LABELS.speakerIntention[language], value: feedback.understandingSpeakerIntention },
    { label: TOPIK_LISTENING_SKILL_LABELS.detail[language], value: feedback.understandingDetail },
    { label: TOPIK_LISTENING_SKILL_LABELS.statementMatch[language], value: feedback.understandingStatementMatch },
    { label: TOPIK_LISTENING_SKILL_LABELS.numberDateLocation[language], value: feedback.understandingNumberDateLocation },
    { label: TOPIK_LISTENING_SKILL_LABELS.relationship[language], value: feedback.understandingRelationship },
    { label: TOPIK_LISTENING_SKILL_LABELS.inference[language], value: feedback.understandingInference },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-[18px] w-[18px] text-primary-500" />
          <CardTitle>{f.title}</CardTitle>
        </div>
        <CardDescription>{feedback.overallPerformance}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SkillList title={f.strongestSkills} items={feedback.strongestSkills} tone="success" noneNoted={f.noneNoted} />
          <SkillList title={f.weakestSkills} items={feedback.weakestSkills} tone="danger" noneNoted={f.noneNoted} />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {rows.map((row) => (
            <div key={row.label} className="flex flex-col gap-1 rounded-2xl bg-background p-4">
              <span className="text-xs font-medium text-muted">{row.label}</span>
              <span className="text-sm text-foreground">{row.value}</span>
            </div>
          ))}
        </div>

        <SkillList title={f.recommendations} items={feedback.recommendations} tone="primary" noneNoted={f.noneNoted} />

        <div className="flex flex-col gap-1 rounded-2xl bg-primary-50 p-4">
          <span className="text-xs font-medium text-primary-700">{t.topik.listening.estimatedReadiness}</span>
          <span className="text-sm text-primary-900">{feedback.estimatedTopikReadiness}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function SkillList({
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
  const toneClass = { success: "text-success-600", danger: "text-danger-600", primary: "text-primary-600" }[tone];
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-background p-4">
      <span className={`text-xs font-semibold ${toneClass}`}>{title}</span>
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
