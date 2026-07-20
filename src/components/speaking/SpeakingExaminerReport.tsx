"use client";

import {
  SpellCheck,
  MicVocal,
  Gauge,
  ListChecks,
  Repeat,
  MessageSquareWarning,
  Award,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { SpeakingExaminerReport as ReportData } from "@/types/speaking-evaluation";

export function SpeakingExaminerReport({ report }: { report: ReportData }) {
  const { t } = useLanguage();
  const r = t.speaking.report;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ListChecks className="h-[18px] w-[18px] text-primary-500" />
            <CardTitle>{r.taskCompletion}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted">{report.taskCompletion.summary}</p>
          <div className="flex flex-wrap gap-2">
            {report.taskCompletion.partsCompleted.map((part) => (
              <Badge key={part} variant="success">
                {part}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <SpellCheck className="h-[18px] w-[18px] text-primary-500" />
            <CardTitle>{r.grammar}</CardTitle>
          </div>
          <CardDescription>{report.grammar.summary}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {report.grammar.commonErrors.length === 0 ? (
            <p className="text-sm text-muted">{r.noRecurringMistakes}</p>
          ) : (
            report.grammar.commonErrors.map((err, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 rounded-xl border border-border bg-background p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-foreground line-through decoration-danger-500">
                    {err.original}
                  </span>
                  <span className="text-sm font-medium text-success-600">{err.correction}</span>
                </div>
                <p className="text-xs text-muted">
                  <span className="font-medium text-foreground">{r.whyWrong}: </span>
                  {err.whyWrong}
                </p>
                <p className="text-xs text-muted">
                  <span className="font-medium text-foreground">{r.howToFix}: </span>
                  {err.howToFix}
                </p>
                <p className="text-xs text-muted">
                  <span className="font-medium text-foreground">{r.betterExample}: </span>
                  <span className="text-success-600">{err.betterExample}</span>
                </p>
                <p className="text-xs text-muted">
                  <span className="font-medium text-foreground">{r.howToAvoid}: </span>
                  {err.howToAvoid}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{r.vocabulary}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FeedbackItem label={r.range} value={report.vocabulary.summary} />
          <FeedbackItem label={r.notes} value={report.vocabulary.rangeNote} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MicVocal className="h-[18px] w-[18px] text-primary-500" />
            <CardTitle>{r.pronunciation}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FeedbackItem label={r.overall} value={report.pronunciation.summary} />
          <FeedbackItem label={r.notes} value={report.pronunciation.note} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Gauge className="h-[18px] w-[18px] text-primary-500" />
            <CardTitle>{r.fluency}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FeedbackItem label={r.overall} value={report.fluency.summary} />
          <FeedbackItem label={r.pace} value={report.fluency.pace} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Repeat className="h-[18px] w-[18px] text-warning-600" />
            <CardTitle>{r.repeatedMistakes}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {report.repeatedMistakes.length === 0 ? (
            <p className="text-sm text-muted">
              {r.noRepeatedMistakes}
            </p>
          ) : (
            <ul className="flex flex-col gap-1.5 text-sm text-foreground">
              {report.repeatedMistakes.map((m, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning-500" />
                  {m}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquareWarning className="h-[18px] w-[18px] text-warning-600" />
            <CardTitle>{r.fillerWords}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <span className="font-display text-2xl font-semibold text-foreground">
            {report.fillerWords.count}
          </span>
          {report.fillerWords.examples.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {report.fillerWords.examples.map((word) => (
                <Badge key={word} variant="neutral">
                  {word}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award className="h-[18px] w-[18px] text-warning-600" />
            <CardTitle>{r.examReadiness}</CardTitle>
          </div>
          <CardDescription>
            {r.examReadinessDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl font-semibold text-foreground">
                {report.estimatedScore}
              </span>
              <span className="text-sm text-muted">/ {report.scoreOutOf}</span>
            </div>
            <p className="text-sm text-muted">{report.scoreExplanation}</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FeedbackList title={r.strengths} items={report.strengths} tone="success" noneNoted={r.noneNoted} />
            <FeedbackList title={r.weaknesses} items={report.weaknesses} tone="danger" noneNoted={r.noneNoted} />
            <FeedbackList title={r.suggestions} items={report.suggestions} tone="primary" noneNoted={r.noneNoted} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FeedbackItem({ label, value }: { label: string; value: string }) {
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
