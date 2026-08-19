"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Headphones,
  BookOpen,
  PenLine,
  Target,
  ArrowRight,
  Flame,
  CalendarClock,
  Info,
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
import { getTopikWordOfTheDay } from "@/lib/mock/topik-word-of-the-day";
import { defaultLevelForTrack } from "@/lib/utils/topikLevel";
import { estimateCurrentTopikLevel } from "@/lib/topik/estimateLevel";
import { computeTopikSkillAverages } from "@/lib/topik/dashboardInsights";
import { EXAMS } from "@/config/exams";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { TopikExamCountdown } from "@/components/topik/TopikExamCountdown";
import { TopikAnnouncementsCard } from "@/components/topik/TopikAnnouncementsCard";
import { TopikRecommendationCard } from "@/components/topik/TopikRecommendationCard";
import { TopikBuddyCard } from "@/components/topik/TopikBuddyCard";

const SKILL_ICON = { listening: Headphones, reading: BookOpen, writing: PenLine } as const;
const SKILL_COLOR = { listening: "bg-purple-500", reading: "bg-info-500", writing: "bg-primary-500" } as const;

function SkillProgressRow({
  skill,
  label,
  avg,
  sessions,
  sessionsLabel,
}: {
  skill: keyof typeof SKILL_ICON;
  label: string;
  avg: number | null;
  sessions: number;
  sessionsLabel: string;
}) {
  const Icon = SKILL_ICON[skill];
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background text-muted">
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex flex-1 flex-col gap-1">
        {avg === null ? (
          <>
            <span className="text-sm font-medium text-foreground">{label}</span>
            <span className="text-xs text-muted">{sessionsLabel}: {sessions}</span>
          </>
        ) : (
          <ProgressBar value={avg} max={100} colorClassName={SKILL_COLOR[skill]} label={label} showPercentage />
        )}
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-lg font-semibold text-foreground">{children}</h2>;
}

/** TOPIK Dashboard — a personalized exam command center, not a navigation
 * menu. Organized around the three questions a student actually wants
 * answered: Where am I (progress/level/streak/daily goal), What do I need
 * to know (exam countdown, official TOPIK announcements), and What should
 * I do next (Today's Word, a real data-driven recommendation, Aimie
 * Buddy). Every number here is sourced from the same existing
 * profile.topikTrack/topikLevel/topikStats/topikVocabularyProgress/
 * examDate fields the rest of the app already reads — no second data
 * system, no demo numbers. A brand-new TOPIK account shows real zeros and
 * honest empty states everywhere. */
export function TopikDashboard() {
  const { t, language } = useLanguage();
  const { profile, updateProfile } = useUserProfile();
  const shouldReduceMotion = useReducedMotion();
  const d = t.dashboard;
  const td = t.topik.dashboard;

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
  const exam = EXAMS.topik;
  const stats = profile.topikStats;
  const track = profile.topikTrack;
  const level = profile.topikLevel ?? (track ? defaultLevelForTrack(track) : null);
  const isTrackII = track === "II";
  // Minutes studied today isn't tracked by any real activity flow yet — a
  // brand-new (or any) account has no per-day timer, so this stays 0
  // rather than showing a fabricated number.
  const minutesDoneToday = 0;

  // Today's Word tracks the account's real, performance-estimated level
  // (same estimate the Progress page shows) rather than the static level
  // chosen at onboarding, so vocabulary difficulty rises as the learner
  // actually improves.
  const wordOfDayLevel = estimateCurrentTopikLevel(profile) ?? level;
  const wordOfTheDay = wordOfDayLevel ? getTopikWordOfTheDay(wordOfDayLevel) : null;
  const vocabularyProgress = profile.topikVocabularyProgress ?? [];

  const { listening: listeningAvg, reading: readingAvg, writing: writingAvg } = computeTopikSkillAverages(profile);

  return (
    <div className="flex flex-col gap-8">
      <div className="relative overflow-hidden rounded-3xl border border-primary-800/20 bg-primary-900/90 px-6 py-8 shadow-elevated sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-primary-400/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-primary-500/15 blur-3xl" />
        <div className="relative flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">
              {isFirstDashboardView
                ? d.greetingFirstTime(profile.firstName)
                : d.greeting(profile.firstName)}
            </h1>
            <p className="text-sm text-primary-100/80">{d.subtitle(exam.name)}</p>
          </div>
          {track && (
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary">{track === "I" ? t.topik.track.i : t.topik.track.ii}</Badge>
              {level && <Badge variant="neutral">{t.profile.targetLevel(level)}</Badge>}
            </div>
          )}
        </div>
      </div>

      {/* Where am I? */}
      <div className="flex flex-col gap-4">
        <SectionHeading>{td.whereAmITitle}</SectionHeading>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
                label={d.dailyGoal.minutesLabel(minutesDoneToday, profile.dailyGoalMinutes)}
                showPercentage
              />
              <div className="flex items-center gap-1.5 text-sm text-muted">
                <Flame className="h-4 w-4 text-warning-500" />
                {d.dailyGoal.streakLine(stats.currentStreakDays)}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-start justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <CardTitle>{td.progressTitle}</CardTitle>
                <CardDescription>{td.progressDescription}</CardDescription>
              </div>
              <Link href="/progress" className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary-600 hover:underline">
                {d.progress.viewDetails}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <SkillProgressRow
                  skill="listening"
                  label={d.listening.title}
                  avg={listeningAvg}
                  sessions={stats.listeningSessions}
                  sessionsLabel={d.progress.listeningSessions}
                />
                <SkillProgressRow
                  skill="reading"
                  label={d.reading.title}
                  avg={readingAvg}
                  sessions={stats.readingSessions}
                  sessionsLabel={d.progress.readingSessions}
                />
                {isTrackII && (
                  <SkillProgressRow
                    skill="writing"
                    label={d.writing.title}
                    avg={writingAvg}
                    sessions={stats.writingSessions}
                    sessionsLabel={d.progress.writingSessions}
                  />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {[
                  { label: d.progress.wordsLearned, value: stats.wordsLearned },
                  { label: d.progress.quizzesDone, value: stats.quizzesCompleted },
                  { label: d.progress.listeningSessions, value: stats.listeningSessions },
                  { label: d.progress.readingSessions, value: stats.readingSessions },
                  ...(isTrackII ? [{ label: d.progress.writingSessions, value: stats.writingSessions }] : []),
                  { label: t.vocabulary.yourVocabulary, value: vocabularyProgress.length },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={shouldReduceMotion ? undefined : { opacity: 0, y: 8 }}
                    animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
                    className="flex flex-col gap-1 rounded-2xl bg-background p-4 transition-transform duration-300 transition-smooth hover:-translate-y-0.5"
                  >
                    <span className="font-display text-2xl font-semibold text-foreground">{stat.value}</span>
                    <span className="text-xs text-muted">{stat.label}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* What do I need to know? */}
      <div className="flex flex-col gap-4">
        <SectionHeading>{td.whatToKnowTitle}</SectionHeading>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <CalendarClock className="h-[18px] w-[18px]" />
                </span>
                <CardTitle>{t.topik.examCountdown.cardTitle}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {profile.examDate ? (
                <TopikExamCountdown examDate={profile.examDate} />
              ) : (
                <div className="flex flex-col gap-3 rounded-2xl border border-primary-100 bg-primary-50 px-5 py-4">
                  <div className="flex items-center gap-3 text-sm text-primary-700">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-100">
                      <Info className="h-4 w-4 text-primary-600" />
                    </span>
                    <div className="flex flex-col">
                      <span className="font-medium">{t.studyPlan.noExamDateTitle}</span>
                      <span className="text-primary-600">{t.studyPlan.noExamDateDescription}</span>
                    </div>
                  </div>
                  <Link href="/onboarding" className={buttonVariants({ variant: "secondary", size: "sm", className: "self-start" })}>
                    {t.studyPlan.setExamDateLink}
                  </Link>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Link href="/study-plan" className={buttonVariants({ variant: "secondary", size: "sm" })}>
                {t.topik.examCountdown.viewStudyPlan}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardFooter>
          </Card>

          <TopikAnnouncementsCard />
        </div>
      </div>

      {/* What should I do next? */}
      <div className="flex flex-col gap-4">
        <SectionHeading>{td.whatNextTitle}</SectionHeading>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {wordOfTheDay && (
            <Card className="group transition-transform duration-300 transition-smooth hover:-translate-y-0.5 hover:shadow-card-hover">
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
                  <span className="font-display text-xl font-semibold text-foreground">{wordOfTheDay.word}</span>
                  <span className="text-sm text-muted">{wordOfTheDay.definition[language]}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/vocabulary" className={buttonVariants({ variant: "secondary", size: "sm" })}>
                  {d.wordOfDay.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </CardFooter>
            </Card>
          )}

          <TopikRecommendationCard />
          <TopikBuddyCard />
        </div>
      </div>
    </div>
  );
}
