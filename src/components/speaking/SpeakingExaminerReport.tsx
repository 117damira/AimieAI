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
import type { SpeakingExaminerReport as ReportData } from "@/types/speaking-evaluation";

export function SpeakingExaminerReport({ report }: { report: ReportData }) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ListChecks className="h-[18px] w-[18px] text-primary-500" />
            <CardTitle>Task Completion</CardTitle>
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
            <CardTitle>Grammar</CardTitle>
          </div>
          <CardDescription>{report.grammar.summary}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {report.grammar.commonErrors.length === 0 ? (
            <p className="text-sm text-muted">No recurring grammar mistakes found.</p>
          ) : (
            report.grammar.commonErrors.map((err, i) => (
              <div
                key={i}
                className="flex flex-col gap-1.5 rounded-xl border border-border bg-background p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-foreground line-through decoration-danger-500">
                    {err.original}
                  </span>
                  <span className="text-sm font-medium text-success-600">{err.correction}</span>
                </div>
                <p className="text-xs text-muted">{err.explanation}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vocabulary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FeedbackItem label="Range" value={report.vocabulary.summary} />
          <FeedbackItem label="Notes" value={report.vocabulary.rangeNote} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MicVocal className="h-[18px] w-[18px] text-primary-500" />
            <CardTitle>Pronunciation</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FeedbackItem label="Overall" value={report.pronunciation.summary} />
          <FeedbackItem label="Notes" value={report.pronunciation.note} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Gauge className="h-[18px] w-[18px] text-primary-500" />
            <CardTitle>Fluency</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FeedbackItem label="Overall" value={report.fluency.summary} />
          <FeedbackItem label="Pace" value={report.fluency.pace} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Repeat className="h-[18px] w-[18px] text-warning-600" />
            <CardTitle>Repeated Mistakes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {report.repeatedMistakes.length === 0 ? (
            <p className="text-sm text-muted">
              No mistake appeared more than once — good consistency.
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
            <CardTitle>Filler Words</CardTitle>
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
            <CardTitle>Exam Readiness</CardTitle>
          </div>
          <CardDescription>
            Estimated DELF Production Orale score for this session.
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
            <FeedbackList title="Strengths" items={report.strengths} tone="success" />
            <FeedbackList title="Weaknesses" items={report.weaknesses} tone="danger" />
            <FeedbackList title="Suggestions" items={report.suggestions} tone="primary" />
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
