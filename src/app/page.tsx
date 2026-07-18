import Link from "next/link";
import {
  Sparkles,
  Mic,
  PenLine,
  BookOpenText,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Card, CardContent, Badge, buttonVariants } from "@/components/ui";
import { EXAMS, ACTIVE_EXAM } from "@/config/exams";

const VALUE_PROPS = [
  {
    icon: Sparkles,
    title: "Examiner-grade AI feedback",
    description:
      "Not a generic chatbot — feedback modeled on how a real DELF examiner evaluates your grammar, vocabulary, and structure.",
  },
  {
    icon: Mic,
    title: "Speaking practice that listens",
    description:
      "Answer real exam-style prompts and reserve space for instant, structured feedback on delivery and accuracy.",
  },
  {
    icon: PenLine,
    title: "Writing evaluated like DELF scores it",
    description:
      "Submit essays and letters and get feedback broken down by grammar, vocabulary, and structure — the way the exam grades it.",
  },
  {
    icon: BookOpenText,
    title: "A new word, every day",
    description:
      "A personalized word of the day with context, usage, and space to practice your own sentence.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <PublicNavbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-6 pb-20 pt-20 text-center sm:pt-28">
          <Badge variant="primary">
            <Sparkles className="h-3.5 w-3.5" />
            Currently focused on {ACTIVE_EXAM.name}
          </Badge>
          <h1 className="font-display max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Prepare for {ACTIVE_EXAM.name} with feedback that feels like a
            real examiner
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-muted">
            Examly gives students professional, structured feedback on
            speaking and writing — helping you understand, correct, and
            improve your mistakes, not just memorize vocabulary.
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className={buttonVariants({ size: "lg", className: "px-8" })}
            >
              Create free account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "px-8",
              })}
            >
              I already have an account
            </Link>
          </div>
        </section>

        {/* Value props */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-20">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUE_PROPS.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="h-full">
                <CardContent className="flex h-full flex-col gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-display font-semibold text-foreground">
                    {title}
                  </h3>
                  <p className="text-sm leading-6 text-muted">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Exam roadmap */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-24">
          <Card className="overflow-hidden">
            <CardContent className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2">
                <h2 className="font-display text-xl font-semibold text-foreground">
                  One exam, done deeply — then more
                </h2>
                <p className="max-w-md text-sm leading-6 text-muted">
                  We&apos;re starting with {ACTIVE_EXAM.fullName} to perfect
                  our AI feedback before expanding to other exams.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {Object.values(EXAMS).map((exam) => (
                  <div
                    key={exam.id}
                    className="flex min-w-[140px] flex-col items-center gap-2 rounded-2xl border border-border bg-background px-5 py-4"
                  >
                    <span className="font-display font-semibold text-foreground">
                      {exam.name}
                    </span>
                    {exam.isActive ? (
                      <Badge variant="success">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Available
                      </Badge>
                    ) : (
                      <Badge variant="neutral">Coming soon</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-6 text-sm text-muted sm:flex-row">
          <span>© 2026 Examly. Built for language learners.</span>
          <span>Made for the {ACTIVE_EXAM.name} MVP</span>
        </div>
      </footer>
    </div>
  );
}
