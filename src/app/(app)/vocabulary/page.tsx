import { CheckCircle2, XCircle, Quote, Sparkles } from "lucide-react";
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
import { WORD_OF_THE_DAY, VOCABULARY_HISTORY } from "@/lib/mock/word-of-the-day";

const MASTERY_VARIANT = {
  new: "primary",
  learning: "warning",
  mastered: "success",
} as const;

export default function VocabularyPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Word of the Day"
        description="A personalized vocabulary pick for your level — with context on how (and how not) to use it."
      />

      {/* Word card */}
      <Card>
        <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-primary-50 text-4xl">
            {WORD_OF_THE_DAY.icon}
          </span>
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                {WORD_OF_THE_DAY.word}
              </h2>
              <Badge variant="neutral">{WORD_OF_THE_DAY.partOfSpeech}</Badge>
              <span className="text-sm text-muted">
                {WORD_OF_THE_DAY.pronunciation}
              </span>
            </div>
            <p className="text-sm leading-6 text-muted">
              {WORD_OF_THE_DAY.definition}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contexts */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-[18px] w-[18px] text-success-600" />
              <CardTitle>Use it when</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3">
              {WORD_OF_THE_DAY.goodContexts.map((context) => (
                <li key={context} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-600" />
                  {context}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-[18px] w-[18px] text-danger-600" />
              <CardTitle>Avoid it when</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3">
              {WORD_OF_THE_DAY.badContexts.map((context) => (
                <li key={context} className="flex items-start gap-2 text-sm text-foreground">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger-600" />
                  {context}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Example sentences */}
      <Card>
        <CardHeader>
          <CardTitle>Example sentences</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {WORD_OF_THE_DAY.exampleSentences.map((sentence) => (
            <div
              key={sentence}
              className="flex items-start gap-3 rounded-2xl bg-background p-4"
            >
              <Quote className="mt-0.5 h-4 w-4 shrink-0 text-primary-400" />
              <p className="text-sm leading-6 text-foreground">{sentence}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Student's own sentence + AI feedback placeholder */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your turn</CardTitle>
            <CardDescription>
              Write your own sentence using &ldquo;{WORD_OF_THE_DAY.word}&rdquo;.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <textarea
              rows={4}
              placeholder={`Écrivez une phrase avec "${WORD_OF_THE_DAY.word}"...`}
              className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
            />
            <Button className="self-start" disabled>
              Get AI Feedback
            </Button>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-[18px] w-[18px] text-primary-500" />
              <CardTitle>AI Feedback</CardTitle>
              <Badge variant="neutral">Coming soon</Badge>
            </div>
            <CardDescription>
              Examiner-style feedback on your sentence will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-border bg-background text-center text-sm text-muted">
              This is where personalized AI feedback will be shown once the
              feedback engine is connected.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vocabulary history */}
      <Card>
        <CardHeader>
          <CardTitle>Your vocabulary</CardTitle>
          <CardDescription>
            Words you&apos;ve learned recently. Review them all in the Weekly Quiz.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {VOCABULARY_HISTORY.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{entry.word}</span>
                <span className="text-sm text-muted">{entry.definition}</span>
              </div>
              <Badge variant={MASTERY_VARIANT[entry.mastery]}>
                {entry.mastery}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
