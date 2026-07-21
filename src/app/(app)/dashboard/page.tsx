"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Mic,
  PenLine,
  Headphones,
  BookOpen,
  ListChecks,
  TrendingUp,
  Target,
  ArrowRight,
  Flame,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  ProgressBar,
  buttonVariants,
} from "@/components/ui";
import { getWordOfTheDay } from "@/lib/mock/word-of-the-day";
import { EXAMS } from "@/config/exams";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useUserProfile } from "@/lib/profile/UserProfileContext";

export default function DashboardPage() {
  const { t, language } = useLanguage();
  const { profile, updateProfile } = useUserProfile();
  const shouldReduceMotion = useReducedMotion();
  const d = t.dashboard;

  // Captured once on mount, before the effect below stamps lastLoginAt — so
  // this render (and only this one, ever) shows the first-time greeting.
  const [isFirstDashboardView] = useState(() => profile?.lastLoginAt === null);

  useEffect(() => {
    if (profile && profile.lastLoginAt === null) {
      updateProfile({ lastLoginAt: new Date().toISOString() });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!profile) return null;
  const exam = EXAMS[profile.examId];
  const { stats } = profile;
  const wordOfTheDay = getWordOfTheDay(profile.targetLevel);
  // Minutes studied today isn't tracked by any real activity flow yet — a
  // brand-new (or any) account has no per-day timer, so this stays 0 rather
  // than showing a fabricated number.
  const minutesDoneToday = 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="relative overflow-hidden rounded-3xl border border-primary-800/20 bg-primary-900/90 px-6 py-8 shadow-elevated sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-primary-400/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-primary-500/15 blur-3xl" />
        <div className="relative flex flex-col gap-1.5">
          <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">
            {isFirstDashboardView
              ? d.greetingFirstTime(profile.firstName)
              : d.greeting(profile.firstName)}
          </h1>
          <p className="text-sm text-primary-100/80">{d.subtitle(exam.name)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Word of the Day */}
        <Card className="group lg:col-span-2 transition-transform duration-300 transition-smooth hover:-translate-y-0.5 hover:shadow-card-hover">
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <CardTitle>{d.wordOfDay.title}</CardTitle>
              <CardDescription>{d.wordOfDay.description}</CardDescription>
            </div>
            <Badge variant="primary">{d.wordOfDay.badge}</Badge>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-2xl transition-transform duration-300 transition-smooth group-hover:scale-110">
              {wordOfTheDay.icon}
            </span>
            <div className="flex flex-col gap-1">
              <span className="font-display text-xl font-semibold text-foreground">
                {wordOfTheDay.word}
              </span>
              <span className="text-sm text-muted">
                {wordOfTheDay.definition[language]}
              </span>
            </div>
          </CardContent>
          <CardFooter>
            <Link
              href="/vocabulary"
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              {d.wordOfDay.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>

        {/* Daily Goal */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-success-50 text-success-600">
                <Target className="h-[18px] w-[18px]" />
              </span>
              <CardTitle>{d.dailyGoal.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ProgressBar
              value={minutesDoneToday}
              max={profile.dailyGoalMinutes}
              colorClassName="bg-success-500"
              label={d.dailyGoal.minutesLabel(
                minutesDoneToday,
                profile.dailyGoalMinutes
              )}
              showPercentage
            />
            <div className="flex items-center gap-1.5 text-sm text-muted">
              <Flame className="h-4 w-4 text-warning-500" />
              {d.dailyGoal.streakLine(stats.currentStreakDays)}
            </div>
          </CardContent>
        </Card>

        {/* Speaking Practice */}
        <Card className="group transition-transform duration-300 transition-smooth hover:-translate-y-0.5 hover:shadow-card-hover">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-info-50 text-info-600 transition-transform duration-300 transition-smooth group-hover:scale-110">
                <Mic className="h-[18px] w-[18px]" />
              </span>
              <CardTitle>{d.speaking.title}</CardTitle>
            </div>
            <CardDescription>{d.speaking.description}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link
              href="/speaking"
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              {d.speaking.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>

        {/* Writing Practice */}
        <Card className="group transition-transform duration-300 transition-smooth hover:-translate-y-0.5 hover:shadow-card-hover">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-transform duration-300 transition-smooth group-hover:scale-110">
                <PenLine className="h-[18px] w-[18px]" />
              </span>
              <CardTitle>{d.writing.title}</CardTitle>
            </div>
            <CardDescription>{d.writing.description}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link
              href="/writing"
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              {d.writing.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>

        {/* Listening */}
        <Card className="group transition-transform duration-300 transition-smooth hover:-translate-y-0.5 hover:shadow-card-hover">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-transform duration-300 transition-smooth group-hover:scale-110">
                <Headphones className="h-[18px] w-[18px]" />
              </span>
              <CardTitle>{d.listening.title}</CardTitle>
            </div>
            <CardDescription>{d.listening.description}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link
              href="/listening"
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              {d.listening.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>

        {/* Reading */}
        <Card className="group transition-transform duration-300 transition-smooth hover:-translate-y-0.5 hover:shadow-card-hover">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-info-50 text-info-600 transition-transform duration-300 transition-smooth group-hover:scale-110">
                <BookOpen className="h-[18px] w-[18px]" />
              </span>
              <CardTitle>{d.reading.title}</CardTitle>
            </div>
            <CardDescription>{d.reading.description}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link
              href="/reading"
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              {d.reading.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>

        {/* Weekly Quiz */}
        <Card className="group transition-transform duration-300 transition-smooth hover:-translate-y-0.5 hover:shadow-card-hover">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning-50 text-warning-600 transition-transform duration-300 transition-smooth group-hover:scale-110">
                <ListChecks className="h-[18px] w-[18px]" />
              </span>
              <CardTitle>{d.quiz.title}</CardTitle>
            </div>
            <CardDescription>{d.quiz.description}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link
              href="/quiz"
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              {d.quiz.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>

        {/* Progress Summary */}
        <Card className="group lg:col-span-2 transition-transform duration-300 transition-smooth hover:-translate-y-0.5 hover:shadow-card-hover">
          <CardHeader className="flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-transform duration-300 transition-smooth group-hover:scale-110">
                <TrendingUp className="h-[18px] w-[18px]" />
              </span>
              <CardTitle>{d.progress.title}</CardTitle>
            </div>
            <Link
              href="/progress"
              className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline"
            >
              {d.progress.viewDetails}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: d.progress.wordsLearned, value: stats.wordsLearned },
              { label: d.progress.quizzesDone, value: stats.quizzesCompleted },
              { label: d.progress.speakingSessions, value: stats.speakingSessions },
              { label: d.progress.writingSessions, value: stats.writingSessions },
              { label: d.progress.listeningSessions, value: stats.listeningSessions },
              { label: d.progress.readingSessions, value: stats.readingSessions },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={shouldReduceMotion ? undefined : { opacity: 0, y: 8 }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
                className="flex flex-col gap-1 rounded-2xl bg-background p-4 transition-transform duration-300 transition-smooth hover:-translate-y-0.5"
              >
                <span className="font-display text-2xl font-semibold text-foreground">
                  {stat.value}
                </span>
                <span className="text-xs text-muted">{stat.label}</span>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
