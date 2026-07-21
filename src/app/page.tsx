"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  Sparkles,
  Mic,
  ArrowRight,
  CheckCircle2,
  CalendarClock,
  TrendingUp,
  UserPlus,
  SlidersHorizontal,
  Repeat,
  Award,
  BarChart3,
} from "lucide-react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Card, CardContent, Badge, ProgressBar, buttonVariants } from "@/components/ui";
import { EXAMS, ACTIVE_EXAM } from "@/config/exams";
import { APP_NAME } from "@/config/app";

const WHY_AIMIE = [
  {
    icon: CalendarClock,
    title: "Personalized Study Plan",
    description:
      "A day-by-day plan built around your level, exam date, and how many minutes you can realistically study.",
  },
  {
    icon: Sparkles,
    title: "AI Feedback",
    description:
      "Examiner-grade feedback on every answer — not a generic chatbot, but scoring modeled on how the real exam is graded.",
  },
  {
    icon: Mic,
    title: "Speaking Simulator",
    description:
      "Answer real exam-style prompts out loud and get structured feedback on delivery, grammar, and vocabulary.",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description:
      "Streaks, skill breakdowns, and session history so you always know exactly where you stand before exam day.",
  },
];

const HOW_IT_WORKS = [
  { icon: UserPlus, title: "Create your account" },
  { icon: SlidersHorizontal, title: "Personalize your study plan" },
  { icon: Repeat, title: "Practice every day" },
  { icon: Sparkles, title: "Receive AI feedback" },
  { icon: BarChart3, title: "Track your progress" },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function HomePage() {
  const shouldReduceMotion = useReducedMotion();
  const motionProps = shouldReduceMotion
    ? {}
    : {
        initial: "hidden" as const,
        whileInView: "visible" as const,
        viewport: { once: true, margin: "-80px" },
      };

  return (
    <div className="flex flex-1 flex-col">
      <PublicNavbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-6xl gap-12 px-6 pb-20 pt-20 sm:pt-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <motion.div
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left"
          >
            <Badge variant="primary">
              <Sparkles className="h-3.5 w-3.5" />
              Currently focused on {ACTIVE_EXAM.name}
            </Badge>
            <h1 className="font-display max-w-xl text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
              Your{" "}
              <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                AI Tutor
              </span>{" "}
              for International Language Exams
            </h1>
            <p className="max-w-xl text-lg leading-8 text-muted">
              {APP_NAME} gives students personalized, AI-powered preparation —
              a study plan built around your goals, and examiner-grade
              feedback on speaking and writing. Our MVP currently supports
              DELF, with more international exams on the way.
            </p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/onboarding"
                className={buttonVariants({ size: "lg", className: "px-8" })}
              >
                Start Your Journey
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#why-aimieai"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "px-8",
                })}
              >
                Learn More
              </Link>
            </div>
          </motion.div>

          {/* Hero mockup */}
          <motion.div
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="mx-auto w-full max-w-sm lg:mx-0 lg:max-w-none"
          >
            <Card className="overflow-hidden shadow-card-hover">
              <CardContent className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white">
                      <Award className="h-4.5 w-4.5" />
                    </span>
                    <span className="font-display text-sm font-semibold text-foreground">
                      Today&apos;s Progress
                    </span>
                  </div>
                  <Badge variant="success">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    On track
                  </Badge>
                </div>
                <ProgressBar value={68} max={100} label="Daily goal" showPercentage colorClassName="bg-primary-500" />
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Speaking", value: "B1" },
                    { label: "Writing", value: "A2" },
                    { label: "Streak", value: "12d" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-background px-3 py-4"
                    >
                      <span className="font-display text-lg font-semibold text-foreground">
                        {stat.value}
                      </span>
                      <span className="text-[11px] text-muted">{stat.label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <p className="text-xs leading-5 text-muted">
                    &ldquo;Strong use of connectors — watch your subjunctive
                    forms in the next paragraph.&rdquo;
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* Why AimieAI */}
        <motion.section
          id="why-aimieai"
          className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 pb-20"
          variants={staggerContainer}
          {...motionProps}
        >
          <motion.div variants={fadeUp} className="mb-8 flex flex-col items-center gap-2 text-center">
            <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
              Why {APP_NAME}
            </h2>
            <p className="max-w-xl text-sm leading-6 text-muted">
              Everything you need to prepare with confidence, built around
              how the exam is actually graded.
            </p>
          </motion.div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_AIMIE.map(({ icon: Icon, title, description }) => (
              <motion.div key={title} variants={fadeUp}>
                <Card className="h-full transition-transform duration-300 transition-smooth hover:shadow-card-hover hover:-translate-y-0.5">
                  <CardContent className="flex h-full flex-col gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="font-display font-semibold text-foreground">
                      {title}
                    </h3>
                    <p className="text-sm leading-6 text-muted">{description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Supported Exams */}
        <motion.section
          className="mx-auto w-full max-w-6xl px-6 pb-20"
          variants={staggerContainer}
          {...motionProps}
        >
          <motion.div variants={fadeUp} className="mb-8 flex flex-col items-center gap-2 text-center">
            <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
              Supported Exams
            </h2>
            <p className="max-w-xl text-sm leading-6 text-muted">
              We&apos;re starting with {ACTIVE_EXAM.fullName} to perfect our
              AI feedback before expanding to other exams.
            </p>
          </motion.div>
          <motion.div variants={fadeUp}>
            <Card className="overflow-hidden">
              <CardContent className="flex flex-wrap justify-center gap-3">
                {Object.values(EXAMS).map((exam) => (
                  <div
                    key={exam.id}
                    className="flex min-w-[140px] flex-col items-center gap-2 rounded-2xl border border-border bg-background px-5 py-4 transition-colors duration-200 hover:border-primary-200"
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
              </CardContent>
            </Card>
          </motion.div>
        </motion.section>

        {/* How it works */}
        <motion.section
          className="mx-auto w-full max-w-6xl px-6 pb-24"
          variants={staggerContainer}
          {...motionProps}
        >
          <motion.div variants={fadeUp} className="mb-8 flex flex-col items-center gap-2 text-center">
            <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
              How it works
            </h2>
          </motion.div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {HOW_IT_WORKS.map(({ icon: Icon, title }, index) => (
              <motion.div key={title} variants={fadeUp}>
                <Card className="h-full transition-transform duration-300 transition-smooth hover:shadow-card-hover hover:-translate-y-0.5">
                  <CardContent className="flex h-full flex-col items-center gap-3 text-center">
                    <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white">
                      <Icon className="h-5 w-5" />
                      <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-surface text-[10px] font-semibold text-primary-700 shadow-card">
                        {index + 1}
                      </span>
                    </span>
                    <h3 className="font-display text-sm font-semibold text-foreground">
                      {title}
                    </h3>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-6 text-sm text-muted sm:flex-row">
          <span>© 2026 {APP_NAME}. Built for language learners.</span>
          <span>Made for the {ACTIVE_EXAM.name} MVP</span>
        </div>
      </footer>
    </div>
  );
}
